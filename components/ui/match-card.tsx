'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Heart, X, MapPin, GraduationCap, Star, Flag } from 'lucide-react'
import { UserProfile } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  user: UserProfile
  compatibilityScore: number
  matchReasons: string[]
  onLike: () => void
  onPass: () => void
  className?: string
}

export function MatchCard({
  user,
  compatibilityScore,
  matchReasons,
  onLike,
  onPass,
  className
}: MatchCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  const photos = user.profile_photo ? [user.profile_photo] : []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={cn("w-full max-w-sm mx-auto", className)}
    >
      <GlassCard className="overflow-hidden">
        {/* Photo Section */}
        <div className="relative h-96 bg-gradient-to-br from-purple-500 to-pink-500">
          {photos.length > 0 ? (
            <img
              src={photos[currentPhotoIndex]}
              alt={user.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-6xl font-bold text-white">
                  {user.display_name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Compatibility Score */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-semibold">
                {Math.round(compatibilityScore * 100)}%
              </span>
            </div>
          </div>

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {user.display_name}
              </h3>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{user.branch} • Year {user.year}</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>BITS {user.campus}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Flag className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-white/80 mb-4 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/30 text-white rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 4 && (
                  <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm">
                    +{user.interests.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-2 text-sm">Why you matched:</h4>
            <div className="space-y-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <div key={index} className="flex items-center gap-2 text-white/70 text-sm">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <GradientButton
              variant="secondary"
              size="lg"
              onClick={onPass}
              className="flex-1"
            >
              <X className="w-6 h-6" />
              Pass
            </GradientButton>
            <GradientButton
              variant="romantic"
              size="lg"
              onClick={onLike}
              className="flex-1"
            >
              <Heart className="w-6 h-6" />
              Connect
            </GradientButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}