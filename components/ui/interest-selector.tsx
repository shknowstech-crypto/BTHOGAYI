'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { GradientButton } from './gradient-button'

interface InterestSelectorProps {
  selectedInterests: string[]
  onInterestsChange: (interests: string[]) => void
  maxInterests?: number
}

const popularInterests = [
  'Programming', 'Music', 'Movies', 'Gaming', 'Sports', 'Reading',
  'Photography', 'Travel', 'Cooking', 'Dancing', 'Art', 'Fitness',
  'Technology', 'Anime', 'Cricket', 'Football', 'Basketball', 'Tennis',
  'Guitar', 'Piano', 'Singing', 'Writing', 'Blogging', 'Coding',
  'Machine Learning', 'AI', 'Web Development', 'Mobile Apps',
  'Startups', 'Entrepreneurship', 'Finance', 'Investment'
]

export function InterestSelector({ 
  selectedInterests, 
  onInterestsChange, 
  maxInterests = 10 
}: InterestSelectorProps) {
  const [newInterest, setNewInterest] = useState('')

  const addInterest = (interest: string) => {
    if (selectedInterests.length >= maxInterests) return
    if (!selectedInterests.includes(interest)) {
      onInterestsChange([...selectedInterests, interest])
    }
  }

  const removeInterest = (interest: string) => {
    onInterestsChange(selectedInterests.filter(i => i !== interest))
  }

  const handleAddCustom = () => {
    if (newInterest.trim() && !selectedInterests.includes(newInterest.trim())) {
      addInterest(newInterest.trim())
      setNewInterest('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Interests</h3>
        <span className="text-white/60 text-sm">
          {selectedInterests.length}/{maxInterests}
        </span>
      </div>

      {/* Selected Interests */}
      {selectedInterests.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm"
              >
                <span>{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Interest */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Add custom interest..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={selectedInterests.length >= maxInterests}
          />
          <GradientButton
            size="sm"
            onClick={handleAddCustom}
            disabled={!newInterest.trim() || selectedInterests.length >= maxInterests}
          >
            <Plus className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>

      {/* Popular Interests */}
      <div>
        <h4 className="text-white/80 font-medium mb-3">Popular Interests</h4>
        <div className="flex flex-wrap gap-2">
          {popularInterests
            .filter(interest => !selectedInterests.includes(interest))
            .map((interest) => (
              <motion.button
                key={interest}
                onClick={() => addInterest(interest)}
                disabled={selectedInterests.length >= maxInterests}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white/80 text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {interest}
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  )
}