'use client'

import { motion } from 'framer-motion'
import { Heart, Users, Ship, MessageCircle, Dice6, Coffee } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'

const features = [
  {
    icon: Users,
    title: "CONNECT - Social Networking",
    description: "AI-powered friend matching with personality compatibility scoring",
    gradient: "from-blue-500 to-purple-500",
    details: [
      "Vector-based recommendation engine",
      "Similarity/opposite personality matching", 
      "Interest-based connections",
      "Profile compatibility scoring"
    ]
  },
  {
    icon: Heart,
    title: "FIND A DATE/PROM",
    description: "Romantic connections for dates, proms, and special events",
    gradient: "from-pink-500 to-rose-500",
    details: [
      "Gender preference matching",
      "Event-specific connections",
      "Romantic intent filtering",
      "Advanced compatibility algorithms"
    ]
  },
  {
    icon: Ship,
    title: "SHIPPING - Matchmaking",
    description: "Friends can ship you with others - the modern cupid",
    gradient: "from-purple-500 to-pink-500",
    details: [
      "Anonymous or named shipping",
      "Mutual consent system",
      "Ship notifications & responses",
      "Third-party matchmaking magic"
    ]
  },
  {
    icon: MessageCircle,
    title: "Smart Messaging",
    description: "5 meaningful messages to make the perfect first impression",
    gradient: "from-indigo-500 to-cyan-500",
    details: [
      "5-message conversation limit",
      "'Rizz Timer' for quality chats",
      "Auto-redirect to external platforms",
      "Instagram, WhatsApp, Discord integration"
    ]
  },
  {
    icon: Dice6,
    title: "Daily Random Match",
    description: "Discover someone new every day with our AI algorithm",
    gradient: "from-cyan-500 to-blue-500",
    details: [
      "Algorithm-powered suggestions",
      "Match of the Day notifications",
      "Streak rewards for engagement",
      "Serendipitous discoveries"
    ]
  },
  {
    icon: Coffee,
    title: "Group Rooms (Coming Soon)",
    description: "Join communities, plan events, and build lasting friendships",
    gradient: "from-orange-500 to-red-500",
    details: [
      "Interest-based group chats",
      "Event planning rooms",
      "Study group formation",
      "Gaming & hobby communities"
    ]
  }
]

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Discover the features that make BITSPARK the ultimate platform for meaningful connections
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard 
                className="p-8 h-full cursor-pointer group"
                hover={true}
                onClick={() => setSelectedFeature(index)}
              >
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Preview Details */}
                <ul className="space-y-2">
                  {feature.details.slice(0, 2).map((detail, i) => (
                    <li key={i} className="text-white/60 text-sm flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3" />
                      {detail}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ x: 5 }}
                  className="mt-6 text-purple-400 font-medium flex items-center gap-2 group-hover:text-purple-300 transition-colors"
                >
                  Learn More →
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Feature Modal */}
        {selectedFeature !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              <GlassCard className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${features[selectedFeature].gradient} flex items-center justify-center mr-4`}>
                    {features[selectedFeature].icon && (
                      <features[selectedFeature].icon className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-white">
                    {features[selectedFeature].title}
                  </h3>
                </div>

                <p className="text-white/80 text-lg mb-8">
                  {features[selectedFeature].description}
                </p>

                <h4 className="text-xl font-semibold text-white mb-4">Key Features:</h4>
                <ul className="space-y-3 mb-8">
                  {features[selectedFeature].details.map((detail, i) => (
                    <li key={i} className="text-white/70 flex items-start">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2" />
                      {detail}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedFeature(null)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                  Close
                </button>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}