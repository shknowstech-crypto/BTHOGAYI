'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { CompatibilityMeter } from './compatibility-meter'
import { Heart, X, MapPin, GraduationCap, Calendar } from 'lucide-react'
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
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
      transition={{ duration: 0.6, type: "spring" }}
      className={className}
    >
      <GlassCard className="max-w-sm mx-auto overflow-hidden">
        {/* Profile Photo */}
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
          
          {/* Compatibility Badge */}
          <div className="absolute top-4 right-4">
            <CompatibilityMeter score={compatibilityScore} size="sm" />
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {user.display_name}
              </h3>
              <p className="text-white/70">
                @{user.username}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-purple-400">
                {Math.round(compatibilityScore * 100)}%
              </div>
              <div className="text-white/60 text-sm">Match</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-white/70">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm">{user.branch}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Year {user.year}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">BITS {user.campus}</span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-6">
              <p className="text-white/80 text-sm leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-xs"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 4 && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
                    +{user.interests.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          {matchReasons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-2 text-sm">Why you match:</h4>
              <ul className="space-y-1">
                {matchReasons.slice(0, 3).map((reason, index) => (
                  <li key={index} className="text-white/70 text-xs flex items-start">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 mt-1.5" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

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