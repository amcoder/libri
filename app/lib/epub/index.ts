import path from 'path'
import AdmZip from 'adm-zip'
import xmldom, { XMLSerializer } from '@xmldom/xmldom'
import xpath from 'xpath'

import { imageMetadata as getImageMetadata } from '~/lib/image'

/**
 * Dublin Core properties (e.g. dc:title, dc:author, dc:description)
 */
type DublinCoreProperty = {
  id?: string
  name: string
  value: string
  properties: MetaProperties
}

/** meta property (e.g. <meta property=""/>) */
type MetaProperty = {
  property: string
  value: string
  id?: string
  refines?: string
  scheme?: string
  properties: MetaProperties
}

/** collection of meta properties */
type MetaProperties = Record<string, MetaProperty>

/** epub title */
type Title = {
  displayValue: string
  sortValue?: string
  parts: DublinCoreProperty[]
}

/**
 * Wraps the parsing and manipulation of an epub file
 *
 * @example
 * ```ts
 *   const epub = new Epub('book.epub')   // create a new epub object
 *   console.log(epub.title)              // get the epub title
 *   epub.title = 'New Title'             // set the epub title
 *   epub.write('book.epub')              // write the epub file to disk
 * ```
 *
 * How it works:
 *   open the epub file(zip) and load the opf file into memory as an xml dom
 *   document. All operations are done on the in-memory dom document by modifying,
 *   adding and removing nodes.
 *   When `write` is called, the in-memory dom document is serialized and written
 *   to the zip file, then the zip file is written to disk.
 *
 */
export class Epub {
  private readonly zip: AdmZip
  private readonly opf: Document
  private readonly opfPath: string
  private readonly opfBasePath: string

  private coverImageBuffer: Buffer | null = null
  private coverImageDirty: boolean = false

  /**
   * Create a new epub object
   *
   * @param file path to the epub file
   */
  constructor(public readonly file: string | Buffer) {
    this.zip = new AdmZip(file)

    this.opfPath = this.getOpfPath()
    this.opfBasePath = path.dirname(this.opfPath)
    this.opf = this.readXmlDocument(this.opfPath)
  }

  /** Get the date the epub was last modified */
  get modified(): Date | null {
    const value = query.modified(this.opf)
    if (!value) return null

    return new Date(value)
  }

  /** get the epub version */
  get version() {
    return query.version(this.opf)
  }

  /** get the unique identifier */
  get uniqueIdentifier(): string | null {
    const id = query.uniqueIdentifier(this.opf)
    if (!id) return null

    return this.identifiers.find((i) => i.id === id)?.value ?? null
  }

  /** Get the identifiers */
  get identifiers(): DublinCoreProperty[] {
    return this.getDublinCoreProperties('identifier')
  }

  /** Get the epub title */
  get title(): Title {
    const parts = this.getDublinCoreProperties('title')
    const displayValue = parts
      .toSorted(
        (a, b) =>
          +(a.properties['display-seq']?.value ?? '0') -
          +(b.properties['display-seq']?.value ?? '0'),
      )
      .map((p) => p.value)
      .join(': ')
    const sortValue = parts
      .toSorted(
        (a, b) =>
          +(a.properties['display-seq']?.value ?? '0') -
          +(b.properties['display-seq']?.value ?? '0'),
      )
      .map((p) => p.properties['file-as']?.value ?? p.value)
      .filter((v) => v)
      .join(': ')

    return { displayValue, sortValue, parts }
  }

  /**
   * set the epub title
   *
   * @param value the new title
   */
  set title(value: string) {
    const props: DublinCoreProperty[] = value
      .split(':')
      .map((p) => p.trim())
      .map((p, i) => {
        return {
          id: `title-${i + 1}`,
          name: 'title',
          value: p,
          properties: {
            'title-type': {
              property: 'title-type',
              refines: `#title-${i + 1}`,
              value: i == 0 ? 'main' : 'subtitle',
              properties: {},
            },
            'display-seq': {
              property: 'display-seq',
              refines: `#title-${i + 1}`,
              value: `${i + 1}`,
              properties: {},
            },
          },
        }
      })

    // update opf document
    this.removeDublicCoreProperties('title')
    this.addDublinCoreProperties(props)
  }

  /** get the authors */
  get authors(): string[] {
    return this.creators
      .filter(
        (c) => !c.properties?.['role'] || c.properties['role']?.value === 'aut',
      )
      .map((c) => c.value)
  }

  /** get the creators */
  get creators(): DublinCoreProperty[] {
    return this.getDublinCoreProperties('creator')
  }

  /** get the contributors */
  get contributors(): DublinCoreProperty[] {
    return this.getDublinCoreProperties('contributor')
  }

  /** get the publication date */
  get publicationDate(): Date | null {
    const value = this.getDublinCoreProperties('date')[0]?.value ?? null
    if (!value) return null

    return new Date(value)
  }

  /** get the publisher */
  get publisher(): string | null {
    const value = this.getDublinCoreProperties('publisher')[0]?.value ?? null
    if (!value) return null

    return value
  }

  /** get the description */
  get description(): string | null {
    const value = this.getDublinCoreProperties('description')[0]?.value ?? null
    if (!value) return null

    return value
  }

  /** get the languages */
  get languages(): DublinCoreProperty[] {
    return this.getDublinCoreProperties('language')
  }

  /** get the primary language */
  get primaryLanguage(): string | null {
    return this.languages[0]?.value
  }

  /** get the subjects */
  get subjects(): DublinCoreProperty[] {
    return this.getDublinCoreProperties('subject')
  }

  /** Get the epub metadata properties */
  get properties(): MetaProperties {
    const elements = query.pkgProps(this.opf)
    return this.toMetaProperties(elements)
  }

  /**
   * Get the cover image
   *
   * @returns the cover image as a binary buffer
   */
  get coverImage(): Buffer | null {
    if (!this.coverImageDirty) {
      const id = this.getCoverImageId()
      if (!id) return null

      console.log('image id', id)
      const coverPath = query.itemPath(id, this.opf)
      if (!coverPath) return null

      console.log('coverPath', coverPath)
      const zipPath = path.join(this.opfBasePath, coverPath)
      console.log('zipPath', zipPath)
      return this.readBuffer(zipPath)
    }

    return this.coverImageBuffer
  }

  /**
   * Set the cover image
   *
   * @param value the new cover image
   */
  set coverImage(value: Buffer | null) {
    if (value) {
      // validate the image
      const meta = getImageMetadata(value)
      if (!meta) throw new Error('Cover image is not an image')
    }
    this.coverImageBuffer = value
    this.coverImageDirty = true
  }

  /**
   * Update the epub file and write it to disk
   *
   * @param filePath path to the epub file. If not provided, the filePath
   * used to create the epub object will be used.
   */
  public write(filePath?: string): void {
    // update cover image
    this.updateCoverImage()

    // Update the opf file in the zip
    const serializer = new XMLSerializer()
    const xml = serializer.serializeToString(this.opf as unknown as xmldom.Node)
    this.zip.updateFile(this.opfPath, Buffer.from(xml, 'utf8'))

    // Write the zip file
    if (!filePath && this.file instanceof Buffer) {
      throw new Error('filePath is required when writing a buffer')
    }
    this.zip.writeZip(filePath)
  }

  // updates the cover image
  private updateCoverImage() {
    if (!this.coverImageDirty) return

    if (!this.coverImageBuffer) {
      this.deleteCoverImage()
      return
    }

    const imageMetadata = getImageMetadata(this.coverImageBuffer)
    if (!imageMetadata) throw new Error('Cover image is not an image')

    let id = this.getCoverImageId()
    let coverItem: Element | null = null

    if (id) {
      // see if we can reuse the old cover item
      coverItem = query.itemElem(id, this.opf)
      if (
        coverItem &&
        (coverItem.getAttribute('media-type') !== imageMetadata.mediaType ||
          !coverItem.getAttribute('href'))
      ) {
        // this can no longer be our cover image
        this.removeItemProperty(coverItem, 'cover-image')
        coverItem = null
        id = null
      }
    }

    // generate a new id if needed
    id ??= this.generateUniqueId('cover-image')

    // Create a new cover item if needed
    if (!coverItem) {
      const newFilename = this.generateUniqueFilename(
        `cover.${imageMetadata.extension}`,
      )
      coverItem = this.opf.createElementNS(ns.opf, 'item')
      coverItem.setAttribute('id', id)
      coverItem.setAttribute('href', newFilename)
      coverItem.setAttribute('media-type', imageMetadata.mediaType)
      coverItem.setAttribute('properties', 'cover-image')
      query.manifest(this.opf)!.appendChild(coverItem)
    }

    // write the image to the zip
    const coverPath = coverItem.getAttribute('href')!
    this.writeOpfRelativeBuffer(coverPath, this.coverImageBuffer)

    // update cover meta
    const coverMeta = query.coverMeta(this.opf)
    if (coverMeta) {
      coverMeta.setAttribute('content', id)
    } else {
      const meta = this.opf.createElementNS(ns.opf, 'meta')
      meta.setAttribute('name', 'cover')
      meta.setAttribute('content', id)
      query.metadata(this.opf)!.appendChild(meta)
    }
  }

  // delete the cover image
  private deleteCoverImage() {
    const id = this.getCoverImageId()
    if (id) {
      const coverItem = query.itemElem(id, this.opf)
      if (coverItem) {
        // remove cover-item property from item
        this.removeItemProperty(coverItem, 'cover-image')
      }
    }

    // remove cover meta
    const coverMeta = query.coverMeta(this.opf)
    if (coverMeta) {
      removeNode(coverMeta)
    }
  }

  // generate a unique id that isn't already in use
  private generateUniqueId(id: string): string {
    let counter = 1
    while (query.itemElem(id, this.opf)) {
      id = `cover-image-${counter++}`
    }
    return id
  }

  // remove a property from an item
  private removeItemProperty(item: Element, property: string): void {
    let properties = item.getAttribute('properties') ?? ''
    properties = properties
      .split(' ')
      .map((p) => p.trim())
      .filter((p) => p && p !== property)
      .join(' ')
    if (properties) {
      item.setAttribute('properties', properties)
    } else {
      item.removeAttribute('properties')
    }
  }

  // get the cover image id
  private getCoverImageId(): string | null {
    return this.version === '2.0'
      ? query.coverIdv2(this.opf)
      : query.coverIdv3(this.opf)
  }

  // gets the Dublin Core properties for a given name (e.g. title)
  private getDublinCoreProperties(name: string): DublinCoreProperty[] {
    const elements = query.dcProps(name, this.opf)

    const props = elements.map((e) => {
      const id = e.getAttribute('id') ?? undefined
      const part = {
        id,
        name: e.localName,
        value: e.textContent!,
        properties: this.getRefinedProperties(id),
      }
      return part
    })

    return props
  }

  // adds the specified Dublin Core properties to the opf document
  private addDublinCoreProperties(props: DublinCoreProperty[]): void {
    const metadata = query.metadata(this.opf)!
    props.forEach((p) => {
      const element = this.opf.createElementNS(ns.dc, p.name)
      if (p.id) {
        element.setAttribute('id', p.id)
      }
      element.textContent = p.value
      metadata.appendChild(element)
      this.addMetadataProperties(p.properties)
    })
  }

  // removes the named Dublin Core properties from the opf document along with their refines
  private removeDublicCoreProperties(name: string): void {
    const elements = query.dcProps(name, this.opf)
    elements.forEach((element) => {
      if (element.getAttribute('id')) {
        const refines = query.refines(element.getAttribute('id')!, this.opf)
        refines.forEach((e) => removeNode(e))
      }
      removeNode(element)
    })
  }

  // adds the specified metadata properties to the opf document
  private addMetadataProperties(props: MetaProperties): void {
    const metadata = query.metadata(this.opf)!
    Object.values(props).forEach((p) => {
      const element = this.createMetaElement(p)
      metadata.appendChild(element)
      if (p.properties) {
        this.addMetadataProperties(p.properties)
      }
    })
  }

  // create a new meta element from a MetaProperty
  private createMetaElement(prop: MetaProperty): Element {
    const element = this.opf.createElementNS(ns.opf, 'meta')

    element.setAttribute('property', prop.property)
    if (prop.id) element.setAttribute('id', prop.id)
    if (prop.refines) element.setAttribute('refines', prop.refines)
    if (prop.scheme) element.setAttribute('scheme', prop.scheme)
    element.textContent = prop.value ?? ''

    return element
  }

  // gets the refined properties for a given id
  private getRefinedProperties(id?: string): MetaProperties {
    if (!id) return {}

    const refines = query.refines(id, this.opf)
    return this.toMetaProperties(refines)
  }

  // Converts an array of elements to a MetaProperties object
  private toMetaProperties(elements: Element[]): MetaProperties {
    return elements.reduce((a, e) => {
      const id = e.getAttribute('id') ?? undefined
      const property: MetaProperty = {
        id,
        property: e.getAttribute('name') || e.getAttribute('property')!,
        value: e.getAttribute('content') || e.textContent || '',
        refines: e.getAttribute('refines') ?? undefined,
        scheme: e.getAttribute('scheme') ?? undefined,
        properties: this.getRefinedProperties(id),
      }
      a[property.property] = property
      return a
    }, {})
  }

  // gets the opf path from the container.xml file
  private getOpfPath(): string {
    const xml = this.readXmlDocument('META-INF/container.xml')
    const path = query.opfPath(xml)
    if (!path) throw new Error('Could not find opf path in container.xml')
    return path
  }

  // Read an xml document from the zip file
  private readXmlDocument(zipPath: string): Document {
    const buffer = this.readBuffer(zipPath)
    const xml = new TextDecoder().decode(buffer)
    const parser = new xmldom.DOMParser()
    return parser.parseFromString(xml, 'text/xml') as unknown as Document
  }

  // Read a file as a buffer from the zip file
  private readBuffer(zipPath: string): Buffer {
    const buffer = this.zip.readFile(zipPath)
    if (!buffer) throw new Error(`File not found: ${zipPath}`)

    return buffer
  }

  // write a buffer to a file in the zip
  private writeBuffer(zipPath: string, buffer: Buffer): void {
    const entry = this.zip.getEntry(zipPath)
    if (entry) {
      this.zip.updateFile(entry, buffer)
    } else {
      this.zip.addFile(zipPath, buffer)
    }
  }

  // write a buffer to a file in the zip relative to the opf base path
  private writeOpfRelativeBuffer(relPath: string, buffer: Buffer): void {
    const zipPath = path.join(this.opfBasePath, relPath)
    this.writeBuffer(zipPath, buffer)
  }

  // generate a unique filename for a file in the zip
  private generateUniqueFilename(filename: string): string {
    let counter = 1
    const filePath = path.dirname(filename)
    filename = path.basename(filename)
    const ext = path.extname(filename)
    const name = path.parse(filename).name

    while (this.zip.getEntry(filename)) {
      filename = `${name}-${counter++}${ext}`
    }

    return path.join(filePath, filename)
  }
}

// namespaces we care about
const ns = {
  ocf: 'urn:oasis:names:tc:opendocument:xmlns:container',
  opf: 'http://www.idpf.org/2007/opf',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
}

// xpath selector scoped to epub namespaces
const select = xpath.useNamespaces(ns)

// xpath queries for parsing epub documents
const query = {
  // get the opf path from the container.xml file
  opfPath: createQuery1<string>('string(//ocf:rootfile[1]/@full-path)'),

  // get the epub version
  version: createQuery1<string>('string(/opf:package/@version)'),

  // get the unique identifier
  uniqueIdentifier: createQuery1<string>(
    'string(//opf:package/@unique-identifier)',
  ),

  // get the metadata element
  metadata: createQuery1<Element>('//opf:metadata[1]'),

  // get manifest element
  manifest: createQuery1<Element>('//opf:manifest[1]'),

  // get all meta elements that are not refines
  pkgProps: createQuery<Element[]>('//opf:metadata/opf:meta[not(@refines)]'),

  // get the modified date
  modified: createQuery1<string>(
    'string(//opf:meta[@property="dcterms:modified"][1]/text())',
  ),

  // get all identifiers
  identifiers: createQuery<Element[]>('//opf:metadata/dc:identifier'),

  // get all titles
  titles: createQuery<Element[]>('//opf:metadata/dc:title'),

  // get specified dc properties
  dcProps: (name: string, node: Node) => {
    return select(`//opf:metadata/dc:${name}`, node) as unknown as Element[]
  },

  // get all refines for the specified id
  refines: (id: string, node: Node) => {
    return select(
      `//opf:metadata/opf:meta[@refines="#${id}"]`,
      node,
    ) as unknown as Element[]
  },

  // get the cover id for v2
  coverIdv2: createQuery1<string>(
    'string(//opf:meta[@name="cover"][1]/@content)',
  ),

  // get the cover id for v3
  coverIdv3: createQuery1<string>(
    `string(//opf:item[contains(concat(' ', normalize-space(@properties), ' '), ' cover-image ')][1]/@id)`,
  ),

  // get the cover meta element
  coverMeta: createQuery1<Element>('//opf:meta[@name="cover"][1]'),

  // get an item from the manifest
  itemElem: (id: string, node: Node): Element | null => {
    return select(
      `//opf:manifest/opf:item[@id="${id}"]`,
      node,
      true,
    ) as unknown as Element
  },
  // get the path of an item from the manifest
  itemPath: (id: string, node: Node): string | null => {
    return select(
      `string(//opf:manifest/opf:item[@id="${id}"]/@href)`,
      node,
      true,
    ) as string
  },
}

// turn an xpath query into a function
function createQuery<T>(query: string) {
  return (node: Node): T => {
    return select(query, node, false) as T
  }
}
function createQuery1<T>(query: string) {
  return (node: Node): T | null => {
    return select(query, node, true) as T
  }
}

// remove a node from the dom
function removeNode(node: Node) {
  node.parentNode?.removeChild(node)
}

// ---------------
// VV TEST CODE VV

// const file = 'demo.epub'
// // const file =
// //   '/home/amcoder/Books/Stephen King/Sleeping Beauties (304)/Sleeping Beauties - Stephen King.epub'
// // const file =
// //   '/home/amcoder/Books/Adrian Tchaikovsky/Children of Memory (252)/Children of Memory - Adrian Tchaikovsky.epub'
// const epub = new Epub(file)
// console.dir(epub.modified, { depth: null })
// console.dir(epub.title, { depth: null })
// console.dir(epub.properties, { depth: null })
//
// const image = fs.readFileSync('test.png')
// epub.coverImage = image
// epub.title = 'Children of Memory 2'
// epub.write('demo.edited.epub')

// const files = fs.globSync('/home/amcoder/Books/**/*.epub')
// // const files = fs.globSync('/home/amcoder/projects/epub3-samples/**/*.epub')
// for (const file of files) {
//   try {
//     let epub = new Epub(file)
//     epub.title = 'This is a test'
//     epub.write('test.epub')
//     epub = new Epub('test.epub')
//     if (epub.title.displayValue !== 'This is a test') {
//       throw new Error('title not updated')
//     }
//   } catch (error) {
//     console.error(`error parsing ${file}`, error)
//     throw error
//   }
// }
