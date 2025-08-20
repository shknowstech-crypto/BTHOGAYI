'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { UserProfile } from '@/lib/supabase'
import { Heart, X, Star, MapPin, GraduationCap, Users } from 'lucide-react'

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
  className = ""
}: MatchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 10 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={`max-w-sm mx-auto ${className}`}
    >
      <GlassCard className="overflow-hidden">
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
          
          {/* Compatibility Score Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-semibold">
                {Math.round(compatibilityScore * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-white mb-1">
              {user.display_name}
            </h3>
            <p className="text-white/70 text-sm">
              @{user.username}
            </p>
          </div>

          {/* Basic Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-white/80">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm">{user.branch} • Year {user.year}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">BITS {user.campus}</span>
            </div>
            {user.age && (
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4" />
                <span className="text-sm">{user.age} years old</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-4">
              <p className="text-white/80 text-sm leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 4 && (
                  <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                    +{user.interests.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-2">Why you matched:</h4>
            <ul className="space-y-1">
              {matchReasons.map((reason, index) => (
                <li key={index} className="text-white/70 text-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPass}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
              Pass
            </motion.button>
            
            <GradientButton
              onClick={onLike}
              variant="romantic"
              className="flex-1 flex items-center justify-center gap-2"
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