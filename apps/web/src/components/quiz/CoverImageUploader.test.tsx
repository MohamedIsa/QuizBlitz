import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CoverImageUploader } from './CoverImageUploader'

vi.mock('@/lib/upload.api', () => ({
  uploadApi: {
    getPresignedUrl: vi.fn(),
    uploadToR2: vi.fn(),
  },
}))

import { uploadApi } from '@/lib/upload.api'

const mockPresigned = {
  uploadUrl: 'https://r2.example.com/presigned-put',
  publicUrl: 'https://r2.example.com/uploads/image.jpg',
  key: 'uploads/image.jpg',
}

describe('CoverImageUploader', () => {
  const onChange = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('renders the placeholder when imageUrl is null', () => {
    render(<CoverImageUploader imageUrl={null} onChange={onChange} />)
    expect(screen.getByText('Add a cover image')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows a validation error for a file over 5 MB without calling the API', async () => {
    render(<CoverImageUploader imageUrl={null} onChange={onChange} />)

    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, largeFile)

    expect(await screen.findByText('Image must be 5 MB or smaller.')).toBeInTheDocument()
    expect(uploadApi.getPresignedUrl).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a validation error for an unsupported file type without calling the API', async () => {
    render(<CoverImageUploader imageUrl={null} onChange={onChange} />)

    const gifFile = new File(['gif'], 'anim.gif', { type: 'image/gif' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, gifFile, { applyAccept: false })

    expect(await screen.findByText('Only JPEG and PNG images are supported.')).toBeInTheDocument()
    expect(uploadApi.getPresignedUrl).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange with the publicUrl after a successful upload', async () => {
    vi.mocked(uploadApi.getPresignedUrl).mockResolvedValueOnce(mockPresigned)
    vi.mocked(uploadApi.uploadToR2).mockResolvedValueOnce(undefined)

    render(<CoverImageUploader imageUrl={null} onChange={onChange} />)

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(mockPresigned.publicUrl)
    })
    expect(uploadApi.getPresignedUrl).toHaveBeenCalledWith('photo.jpg', 'image/jpeg')
    expect(uploadApi.uploadToR2).toHaveBeenCalledWith(mockPresigned.uploadUrl, file)
  })

  it('shows the image preview and Remove button when imageUrl is set', () => {
    render(<CoverImageUploader imageUrl="https://r2.example.com/uploads/image.jpg" onChange={onChange} />)
    expect(screen.getByRole('img', { name: 'Quiz cover' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('calls onChange(null) when Remove is clicked', async () => {
    render(<CoverImageUploader imageUrl="https://r2.example.com/uploads/image.jpg" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
