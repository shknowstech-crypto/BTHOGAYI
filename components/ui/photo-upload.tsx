'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { LoadingSpinner } from './loading-spinner'
import { Camera, Upload, X, Check } from 'lucide-react'

interface PhotoUploadProps {
  currentPhoto?: string
  onPhotoUpload: (file: File) => Promise<boolean>
  title?: string
  description?: string
  maxSize?: number // in MB
}

export function PhotoUpload({
  currentPhoto,
  onPhotoUpload,
  title = "Upload Photo",
  description = "Choose a clear photo of yourself",
  maxSize = 5
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
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
      console.error('Error uploading photo:', error)
      alert('Error uploading photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const displayPhoto = preview || currentPhoto

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-6">{description}</p>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver 
            ? 'border-purple-400 bg-purple-500/20' 
            : 'border-white/30 hover:border-white/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
      >
        {uploading ? (
          <div className="py-8">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-white/70">Uploading photo...</p>
          </div>
        ) : displayPhoto ? (
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={displayPhoto}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                onClick={() => {
                  setPreview(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {currentPhoto && !preview && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">Photo uploaded</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-white/70 mb-4">
              Drag and drop your photo here, or click to browse
            </p>
            <p className="text-white/50 text-sm">
              Supports JPG, PNG • Max {maxSize}MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <GradientButton
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4" />
          Choose File
        </GradientButton>
        
        {displayPhoto && (
          <GradientButton
            variant="romantic"
            disabled={uploading}
            className="flex-1"
          >
            <Check className="w-4 h-4" />
            Looks Good
          </GradientButton>
        )}
      </div>
    </GlassCard>
  )
}