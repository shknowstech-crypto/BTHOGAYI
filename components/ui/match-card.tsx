'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Heart, X, MapPin, GraduationCap, Star } from 'lucide-react'
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={className}
    >
      <GlassCard className="p-6 max-w-sm mx-auto">
        {/* Profile Photo */}
        <div className="relative mb-4">
          <div className="w-full h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl overflow-hidden">
            {user.profile_photo ? (
              <img 
                src={user.profile_photo} 
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Compatibility Score */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1">
            <div className="flex items-center gap-1 text-white text-sm font-semibold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {Math.round(compatibilityScore * 100)}%
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-white mb-1">
            {user.display_name}
          </h3>
          <div className="flex items-center gap-2 text-white/70 mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>{user.branch} • Year {user.year}</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 mb-3">
            <MapPin className="w-4 h-4" />
            <span>BITS {user.campus}</span>
          </div>
          
          {user.bio && (
            <p className="text-white/80 text-sm mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        {/* Match Reasons */}
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-2">Why you matched:</h4>
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
      </GlassCard>
    </motion.div>
  )
}