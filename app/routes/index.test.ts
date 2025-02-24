import { vi, describe, expect, test } from 'vitest'
import { Route } from './index'
import { redirect } from '@tanstack/react-router'

vi.mock(import('@tanstack/react-router'), async (importOriginal) => {
  const mod = await importOriginal() // type is inferred
  return {
    ...mod,
    redirect: vi.fn(),
  }
})

describe('index', () => {
  test('redirects to /books', async () => {
    const expected = { to: '/books' }

    vi.mocked(redirect).mockImplementation((r) => r)

    try {
      // @ts-expect-error - we don't care about the parameters
      Route.options.beforeLoad()
      expect.unreachable()
    } catch (error) {
      expect(error).to.deep.equal(expected)
      expect(redirect).toHaveBeenCalledOnce()
      expect(redirect).toHaveBeenCalledWith(expected)
    }
  })
})
