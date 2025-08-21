'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Camera, Upload, X, Check } from 'lucide-react'

interface PhotoUploadProps {
  currentPhoto?: string
  onPhotoUpload: (file: File) => Promise<boolean>
  title: string
  description: string
}

export function PhotoUpload({ 
  currentPhoto, 
  onPhotoUpload, 
  title, 
  description 
}: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const success = await onPhotoUpload(file)
      if (success) {
        // Success handled by parent component
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-6">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-white/30 hover:border-white/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview || currentPhoto ? (
          <div className="relative">
            <img
              src={preview || currentPhoto}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
            />
            {preview && (
              <button
                onClick={clearPreview}
                className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 mb-2">
              Drag and drop your photo here, or click to browse
            </p>
            <p className="text-white/50 text-sm">
              Supports JPG, PNG, WebP (max 10MB)
            </p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-2" />
              <p className="text-white text-sm">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <GradientButton
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          Choose File
        </GradientButton>
        
        {(preview || currentPhoto) && (
          <GradientButton
            size="sm"
            variant="success"
            className="flex-1"
            disabled={uploading}
          >
            <Check className="w-4 h-4" />
            {currentPhoto ? 'Verified' : 'Ready'}
          </GradientButton>
        )}
      </div>
    </GlassCard>
  )
}