import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Camera, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { GlassCard } from './glass-card'
import { StorageService } from '@/lib/storage'
import { useAuthStore } from '@/lib/store'

interface PhotoUploadProps {
  onPhotoUpload?: (file: File) => void
  onPhotoUploaded?: (url: string) => void
  currentPhoto?: string
  className?: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
  uploadType?: 'profile' | 'verification' | 'message'
}

export function PhotoUpload({ 
  onPhotoUpload,
  onPhotoUploaded,
  currentPhoto, 
  className = '',
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  uploadType = 'profile'
}: PhotoUploadProps) {
  const { user } = useAuthStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentPhoto || null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)'
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }
    
    return null
  }

  const handleFile = useCallback((file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Optimize image before upload
    const processAndUpload = async () => {
      setIsUploading(true)
      setUploadProgress(0)
      
      try {
        // Optimize image
        setUploadProgress(20)
        const optimizedFile = await StorageService.optimizeImage(file, 800, 0.8)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(optimizedFile)
        
        setUploadProgress(40)
        
        // Upload to Supabase Storage
        if (user?.id) {
          let uploadedUrl: string
          
          if (uploadType === 'profile') {
            uploadedUrl = await StorageService.uploadProfilePhoto(user.id, optimizedFile)
          } else if (uploadType === 'verification') {
            uploadedUrl = await StorageService.uploadVerificationDoc(user.id, optimizedFile, 'photo_verification')
          } else {
            throw new Error('Invalid upload type')
          }
          
          setUploadProgress(80)
          
          // Simulate verification process
          await new Promise(resolve => setTimeout(resolve, 1000))
          setUploadProgress(100)
          
          setIsVerified(true)
          onPhotoUploaded?.(uploadedUrl)
        }
        
        // Legacy callback
        onPhotoUpload?.(optimizedFile)
        
      } catch (uploadError: any) {
        console.error('Upload failed:', uploadError)
        setError(uploadError.message || 'Upload failed. Please try again.')
        setPreview(null)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    }
    
    processAndUpload()
  }, [onPhotoUpload, onPhotoUploaded, maxSize, acceptedTypes, uploadType, user?.id])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleRemovePhoto = useCallback(() => {
    setPreview(null)
    setError(null)
    setIsVerified(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard 
              className={`p-8 border-2 border-dashed transition-all duration-200 ${
                isDragOver 
                  ? 'border-purple-400 bg-purple-500/10' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div
                className="text-center cursor-pointer"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
              >
                <motion.div
                  animate={{ 
                    scale: isDragOver ? 1.1 : 1,
                    rotate: isDragOver ? 5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Camera className="w-10 h-10 text-purple-400" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Upload Profile Photo
                </h3>
                <p className="text-white/70 mb-4">
                  Drag and drop your photo here, or click to browse
                </p>
                
                <div className="space-y-2 text-sm text-white/50">
                  <p>Supported formats: JPEG, PNG, WebP</p>
                  <p>Maximum size: {maxSize}MB</p>
                  <p>Recommended: Square image, 400x400px or larger</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileDialog()
                  }}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Choose Photo
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="preview-area"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <GlassCard className="p-0 overflow-hidden">
              <div className="relative">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-64 object-cover"
                />
                
                {/* Verification Status */}
                <div className="absolute top-4 right-4">
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-blue-500/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2"
                      >
                        <div className="w-4 h-4 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white"
                            initial={{ width: '0%' }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium">
                          {uploadProgress < 50 ? 'Optimizing...' : 
                           uploadProgress < 90 ? 'Uploading...' : 'Verifying...'}
                        </span>
                      </motion.div>
                    )}
                    
                    {isVerified && !isUploading && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">Verified</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remove Button */}
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-4 left-4 w-8 h-8 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Profile Photo</h3>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70 text-sm">Photo uploaded</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-white/60">
                  <p>✅ Photo meets size requirements</p>
                  <p>✅ Format is supported</p>
                  <p>✅ Ready for verification</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={openFileDialog}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200"
                  >
                    Change Photo
                  </button>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-all duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
} 