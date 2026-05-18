import { useRef, useState } from 'react'
import { uploadApi } from '@/lib/upload.api'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

interface CoverImageUploaderProps {
  imageUrl: string | null
  onChange: (url: string | null) => void
}

export function CoverImageUploader({ imageUrl, onChange }: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // reset so the same file can be picked again after an error
    e.target.value = ''
    if (!file) return

    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG and PNG images are supported.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be 5 MB or smaller.')
      return
    }

    setIsUploading(true)
    try {
      const { uploadUrl, publicUrl } = await uploadApi.getPresignedUrl(file.name, file.type)
      await uploadApi.uploadToR2(uploadUrl, file)
      onChange(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setError(null)
    onChange(null)
  }

  const openFilePicker = () => fileInputRef.current?.click()

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      {imageUrl ? (
        <div className="flex items-center gap-3 rounded-[14px] border border-ink-border bg-surface p-3">
          <img
            src={imageUrl}
            alt="Quiz cover"
            className="h-16 w-16 shrink-0 rounded-[10px] border border-ink-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">Cover image</p>
            <p className="mt-0.5 truncate font-mono text-[10.5px] text-ink-muted">
              {imageUrl}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={isUploading}
              className="rounded-[8px] border border-ink-border px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              {isUploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="rounded-[8px] border border-wrong/30 px-2.5 py-1 text-[11.5px] font-semibold text-wrong transition-colors hover:bg-wrong-soft disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading}
          className="flex w-full items-center gap-3 rounded-[14px] border-2 border-dashed border-ink-border bg-surface-2 p-4 text-left transition-colors hover:bg-surface-3 disabled:cursor-wait disabled:opacity-70"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-surface-3 text-ink-muted">
            {isUploading ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
                <path d="M21 12a9 9 0 11-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="2" />
                <path d="M3 17l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-ink">
              {isUploading ? 'Uploading…' : 'Add a cover image'}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              {isUploading ? 'Sending to Cloudflare R2' : 'PNG or JPEG, up to 5 MB'}
            </p>
          </div>
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-wrong" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
