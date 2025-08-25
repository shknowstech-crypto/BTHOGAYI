import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/store';
import toast from 'react-hot-toast';

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  currentPhotos?: string[];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 6,
  currentPhotos = []
}) => {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(currentPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select only image files');
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }

        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Compress image before upload
        const compressedFile = await compressImage(file);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, compressedFile);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];
      
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      
      toast.success(`${uploadedUrls.length} photo(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      toast.error(error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
    toast.success('Photo removed');
  };

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [movedPhoto] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, movedPhoto);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload Photos</span>
            </>
          )}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-white/10"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Primary Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                    Primary
                  </div>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Photo Number */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add More Photos Placeholder */}
          {photos.length < maxPhotos && (
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/60 hover:text-white/80 hover:border-white/50 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm">Add Photo</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-white/30 rounded-lg">
          <ImageIcon className="w-16 h-16 mx-auto text-white/40 mb-4" />
          <p className="text-white/60 mb-2">No photos uploaded yet</p>
          <p className="text-white/40 text-sm">
            Upload at least one photo to continue
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400 space-y-1">
        <p>• Upload up to {maxPhotos} photos</p>
        <p>• First photo will be your primary photo</p>
        <p>• Maximum file size: 5MB per photo</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
      </div>
    </div>
  );
};