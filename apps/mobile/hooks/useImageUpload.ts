import { useState } from 'react'
import * as ImageManipulator from 'expo-image-manipulator'
import { apiClient } from '@/core/api-client'

const MAX_IMAGE_WIDTH = 1200
const COMPRESSION_QUALITY = 0.8

interface PresignedResponse {
  uploadUrl: string
  publicUrl: string
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)

  async function upload(localUri: string): Promise<string> {
    setIsUploading(true)
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: MAX_IMAGE_WIDTH } }],
        { compress: COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
      )

      const suffix = Math.random().toString(16).slice(2, 6)
      const filename = `image_${Date.now()}_${suffix}.jpg`
      const { uploadUrl, publicUrl } = await apiClient.post<PresignedResponse>(
        '/uploads/presigned',
        { filename, contentType: 'image/jpeg' },
      )

      const response = await fetch(manipulated.uri)
      const blob = await response.blob()

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      })

      return publicUrl
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading }
}
