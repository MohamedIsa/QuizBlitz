import { act, renderHook } from '@testing-library/react-native'
import { useImageUpload } from '@/hooks/useImageUpload'
import * as ImageManipulator from 'expo-image-manipulator'
import { apiClient } from '@/core/api-client'

const MOCK_MANIPULATED_URI = 'file:///tmp/manipulated.jpg'
const MOCK_UPLOAD_URL = 'https://r2.example.com/upload?sig=abc'
const MOCK_PUBLIC_URL = 'https://cdn.example.com/images/test.jpg'

jest.mock('expo-image-manipulator')
jest.mock('@/core/api-client')

const mockBlob = new Blob(['image-data'], { type: 'image/jpeg' })

function setupMocks() {
  ;(ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
    uri: MOCK_MANIPULATED_URI,
  })
  ;(apiClient.post as jest.Mock).mockResolvedValue({
    uploadUrl: MOCK_UPLOAD_URL,
    publicUrl: MOCK_PUBLIC_URL,
  })
  global.fetch = jest.fn((input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : String(input)
    if (url === MOCK_MANIPULATED_URI) {
      return Promise.resolve({ blob: () => Promise.resolve(mockBlob) } as Response)
    }
    if (url === MOCK_UPLOAD_URL) {
      return Promise.resolve({ ok: true } as Response)
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })
}

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
  jest.clearAllMocks()
})

describe('useImageUpload', () => {
  it('returns publicUrl on successful upload and resets isUploading', async () => {
    setupMocks()
    const { result } = renderHook(() => useImageUpload())

    expect(result.current.isUploading).toBe(false)

    let url: string | undefined
    await act(async () => {
      url = await result.current.upload('file:///tmp/photo.jpg')
    })

    expect(url).toBe(MOCK_PUBLIC_URL)
    expect(result.current.isUploading).toBe(false)
  })

  it('PUTs the blob to the presigned URL with correct Content-Type', async () => {
    setupMocks()
    const { result } = renderHook(() => useImageUpload())

    await act(async () => {
      await result.current.upload('file:///tmp/photo.jpg')
    })

    const fetchMock = global.fetch as jest.Mock
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith(MOCK_MANIPULATED_URI)
    expect(fetchMock).toHaveBeenCalledWith(MOCK_UPLOAD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: mockBlob,
    })
  })

  it('resets isUploading to false even on error', async () => {
    setupMocks()
    global.fetch = jest.fn((input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : String(input)
      if (url === MOCK_MANIPULATED_URI) {
        return Promise.resolve({ blob: () => Promise.resolve(mockBlob) } as Response)
      }
      return Promise.reject(new Error('Network error'))
    })

    const { result } = renderHook(() => useImageUpload())

    await act(async () => {
      try {
        await result.current.upload('file:///tmp/photo.jpg')
      } catch {
        // expected
      }
    })

    expect(result.current.isUploading).toBe(false)
  })
})
