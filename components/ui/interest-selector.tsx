'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { X, Plus, Search } from 'lucide-react'
import { InterestService } from '@/lib/interests'

interface InterestSelectorProps {
  selectedInterests: string[]
  onInterestsChange: (interests: string[]) => void
  maxInterests?: number
}

const popularInterests = [
  'Programming', 'Music', 'Photography', 'Gaming', 'Sports', 'Reading',
  'Movies', 'Travel', 'Cooking', 'Art', 'Dancing', 'Fitness',
  'Technology', 'Anime', 'Cricket', 'Football', 'Basketball',
  'Guitar', 'Piano', 'Singing', 'Writing', 'Blogging'
]

export function InterestSelector({ 
  selectedInterests, 
  onInterestsChange, 
  maxInterests = 10 
}: InterestSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customInterest, setCustomInterest] = useState('')
  const [trendingInterests, setTrendingInterests] = useState<string[]>([])

  useEffect(() => {
    loadTrendingInterests()
  }, [])

  const loadTrendingInterests = async () => {
    try {
      const trending = await InterestService.getPopularInterests(12)
      setTrendingInterests(trending.map(t => t.interest))
    } catch (error) {
      console.error('Error loading trending interests:', error)
    }
  }

  const addInterest = (interest: string) => {
    const trimmed = interest.trim()
    if (trimmed && !selectedInterests.includes(trimmed) && selectedInterests.length < maxInterests) {
      onInterestsChange([...selectedInterests, trimmed])
    }
  }

  const removeInterest = (interest: string) => {
    onInterestsChange(selectedInterests.filter(i => i !== interest))
  }

  const addCustomInterest = () => {
    if (customInterest.trim()) {
      addInterest(customInterest)
      setCustomInterest('')
    }
  }

  const filteredInterests = popularInterests.filter(interest =>
    interest.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedInterests.includes(interest)
  )

  return (
    <div className="space-y-6">
      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3">
            Your Interests ({selectedInterests.length}/{maxInterests})
          </h4>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedInterests.map((interest) => (
                <motion.span
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add Custom Interest */}
      <div>
        <h4 className="text-white font-semibold mb-3">Add Custom Interest</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
            placeholder="Type your interest..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={selectedInterests.length >= maxInterests}
          />
          <GradientButton
            onClick={addCustomInterest}
            disabled={!customInterest.trim() || selectedInterests.length >= maxInterests}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>

      {/* Search */}
      <div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search interests..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Popular Interests */}
      <div>
        <h4 className="text-white font-semibold mb-3">
          {searchTerm ? 'Search Results' : 'Popular Interests'}
        </h4>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {(searchTerm ? filteredInterests : popularInterests).map((interest) => (
            <motion.button
              key={interest}
              onClick={() => addInterest(interest)}
              disabled={selectedInterests.includes(interest) || selectedInterests.length >= maxInterests}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {interest}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Interests */}
      {trendingInterests.length > 0 && !searchTerm && (
        <div>
          <h4 className="text-white font-semibold mb-3">Trending at BITS</h4>
          <div className="flex flex-wrap gap-2">
            {trendingInterests.filter(interest => !selectedInterests.includes(interest)).map((interest) => (
              <motion.button
                key={interest}
                onClick={() => addInterest(interest)}
                disabled={selectedInterests.length >= maxInterests}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 text-cyan-300 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔥 {interest}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}