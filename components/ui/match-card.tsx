'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { UserProfile } from '@/lib/supabase'
import { Heart, X, MapPin, GraduationCap, Users } from 'lucide-react'

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
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <GlassCard className="max-w-sm mx-auto overflow-hidden">
        {/* Profile Image */}
        <div className="relative h-80 bg-gradient-to-br from-purple-500 to-pink-500">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-white">
                {user.display_name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Compatibility Score */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
            <span className="text-white font-semibold">
              {Math.round(compatibilityScore * 100)}% match
            </span>
          </div>
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
          {user.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 3).map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 rounded-full text-white/80 text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-white/80 text-xs">
                    +{user.interests.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Why you matched
            </h4>
            <ul className="space-y-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <GradientButton
              variant="secondary"
              className="flex-1"
              onClick={onPass}
            >
              <X className="w-5 h-5" />
              Pass
            </GradientButton>
            <GradientButton
              variant="romantic"
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