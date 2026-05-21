import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadApi } from './upload.api'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api-client'

const mockPresigned = {
  uploadUrl: 'https://r2.example.com/presigned-put',
  publicUrl: 'https://r2.example.com/uploads/image.jpg',
  key: 'uploads/image.jpg',
}

describe('uploadApi.getPresignedUrl', () => {
  beforeEach(() => vi.clearAllMocks())

  it('posts to /uploads/presigned and returns the presigned data', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: mockPresigned },
    })

    const result = await uploadApi.getPresignedUrl('image.jpg', 'image/jpeg')

    expect(apiClient.post).toHaveBeenCalledWith('/uploads/presigned', {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    })
    expect(result).toEqual(mockPresigned)
  })
})

describe('uploadApi.uploadToR2', () => {
  beforeEach(() => vi.clearAllMocks())

  it('PUTs the file to the presigned URL with the correct Content-Type', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true }))

    const file = new File(['data'], 'image.jpg', { type: 'image/jpeg' })
    await uploadApi.uploadToR2('https://r2.example.com/presigned-put', file)

    expect(fetch).toHaveBeenCalledWith('https://r2.example.com/presigned-put', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: file,
    })
  })

  it('throws when R2 returns a non-OK response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }))

    const file = new File(['data'], 'image.jpg', { type: 'image/jpeg' })
    await expect(
      uploadApi.uploadToR2('https://r2.example.com/presigned-put', file),
    ).rejects.toThrow('Upload failed (403)')
  })
})
