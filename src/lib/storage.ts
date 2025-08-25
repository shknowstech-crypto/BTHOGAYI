import { supabase } from './supabase'

export class StorageService {
  // Upload profile photo
  static async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      // Update user profile with photo URL
      await supabase
        .from('users')
        .update({ profile_photo: publicUrl })
        .eq('id', userId)

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      throw error
    }
  }

  // Upload verification document
  static async uploadVerificationDoc(userId: string, file: File, docType: 'student_id' | 'photo_verification'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${docType}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get signed URL (private bucket)
      const { data: { signedUrl } } = await supabase.storage
        .from('verification-docs')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7) // 7 days

      return signedUrl || ''
    } catch (error) {
      console.error('Error uploading verification document:', error)
      throw error
    }
  }

  // Upload message attachment
  static async uploadMessageAttachment(userId: string, connectionId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${connectionId}/attachment-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get signed URL
      const { data: { signedUrl } } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(fileName, 60 * 60 * 24) // 24 hours

      return signedUrl || ''
    } catch (error) {
      console.error('Error uploading message attachment:', error)
      throw error
    }
  }

  // Delete file from storage
  static async deleteFile(bucket: string, filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  // Get file URL with expiration
  static async getSignedUrl(bucket: string, filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn)

      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.error('Error getting signed URL:', error)
      throw error
    }
  }

  // Optimize image before upload
  static async optimizeImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(optimizedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}