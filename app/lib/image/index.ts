/** Metadata about an image */
type ImageMetadata = {
  mediaType: string
  extension: string
}

/**
 * Get the image metadata from a buffer
 *
 * @param buffer the buffer to get the image metadata from
 * @returns the image metadata or null if the buffer is not an image
 */
export function imageMetadata(buffer: Buffer): ImageMetadata | null {
  const hasHeader = (header: string): boolean => {
    const headerHex = header
      .split('')
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
    const bufHex = buffer.subarray(0, header.length).toString('hex')
    return headerHex === bufHex
  }

  const headerLookup = {
    '\x89PNG': { mediaType: 'image/png', extension: 'png' },
    '\xFF\xD8\xFF': { mediaType: 'image/jpeg', extension: 'jpg' },
  }

  for (const [header, metadata] of Object.entries(headerLookup)) {
    if (hasHeader(header)) {
      return metadata
    }
  }

  return null
}
