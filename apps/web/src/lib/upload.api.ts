import { apiClient } from '@/lib/api-client'
import type { Envelope } from '@/lib/api-client'

export interface PresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
  key: string
}

export const uploadApi = {
  getPresignedUrl: (filename: string, contentType: string): Promise<PresignedUrlResponse> =>
    apiClient
      .post<Envelope<PresignedUrlResponse>>('/uploads/presigned', { filename, contentType })
      .then(r => r.data.data),

  // Direct PUT to R2/MinIO via the presigned URL. Uses fetch (not apiClient) so
  // our auth header is not sent to R2 — the presigned URL is the auth.
  uploadToR2: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })
    if (!response.ok) {
      throw new Error(`Upload failed (${response.status})`)
    }
  },
}
