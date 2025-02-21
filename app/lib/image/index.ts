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
    return headerHex === buffer.subarray(0, header.length).toString('hex')
  }

  if (hasHeader('GIF8')) {
    return { mediaType: 'image/gif', extension: 'gif' }
  } else if (hasHeader('\x89PNG')) {
    return { mediaType: 'image/png', extension: 'png' }
  } else if (hasHeader('\xFF\xD8\xFF')) {
    return { mediaType: 'image/jpeg', extension: 'jpg' }
  } else if (hasHeader('RIFF')) {
    return { mediaType: 'image/tiff', extension: 'tiff' }
  } else if (hasHeader('BM')) {
    return { mediaType: 'image/bmp', extension: 'bmp' }
  } else {
    return null
  }
}
