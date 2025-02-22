import { expect, test, describe } from 'vitest'
import { imageMetadata } from '~/lib/image/index'

describe('lib/image', () => {
  describe('imageMetadata', () => {
    test('returns null for a buffer with an non-image header', () => {
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
      const metadata = imageMetadata(buffer)
      expect(metadata).toBeNull()
    })

    test('returns null for an empty buffer', () => {
      const buffer = Buffer.from([])
      const metadata = imageMetadata(buffer)
      expect(metadata).toBeNull()
    })

    test('returns jpeg for a buffer with a jpeg header', () => {
      const buffer = Buffer.from([0xff, 0xd8, 0xff])
      const metadata = imageMetadata(buffer)
      expect(metadata).toEqual({ mediaType: 'image/jpeg', extension: 'jpg' })
    })

    test('returns png for a buffer with a png header', () => {
      const buffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ])
      const metadata = imageMetadata(buffer)
      expect(metadata).toEqual({ mediaType: 'image/png', extension: 'png' })
    })
  })
})
