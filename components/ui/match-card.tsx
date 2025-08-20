'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Heart, X, MapPin, GraduationCap, Star, Users } from 'lucide-react'
import { UserProfile } from '@/lib/supabase'

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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 300 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={className}
    >
      <GlassCard className="max-w-sm mx-auto overflow-hidden">
        {/* Profile Image */}
        <div className="relative h-80 overflow-hidden">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-6xl font-bold text-white">
                {user.display_name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Compatibility Score Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full px-3 py-1"
          >
            <span className="text-white font-bold text-sm">
              {Math.round(compatibilityScore * 100)}% Match
            </span>
          </motion.div>

          {/* Verification Badge */}
          {user.verified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-4 left-4 bg-blue-500 rounded-full p-2"
            >
              <Star className="w-4 h-4 text-white fill-current" />
            </motion.div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-1">
              {user.display_name}
            </h3>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>{user.branch} • Year {user.year}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <MapPin className="w-4 h-4" />
              <span>BITS {user.campus}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-white/80 text-sm mb-4 line-clamp-3">
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
                    className="px-2 py-1 bg-white/20 rounded-full text-white/80 text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 4 && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-white/80 text-xs">
                    +{user.interests.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Why you match:
            </h4>
            <ul className="space-y-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="text-white/70 text-xs flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <GradientButton
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onPass}
            >
              <X className="w-5 h-5" />
              Pass
            </GradientButton>
            <GradientButton
              variant="romantic"
              size="lg"
              className="flex-1"
              onClick={onLike}
            >
              <Heart className="w-5 h-5" />
              Connect
            </GradientButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}