'use client'

import { motion } from 'framer-motion'
import { Heart, Users, Ship, MessageCircle, Dice6, Coffee, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'

const features = [
  {
    icon: Users,
    title: "CONNECT",
    subtitle: "Find Your Tribe",
    description: "Swipe through profiles to find friends with similar interests, hobbies, and campus vibes. Build your BITS social circle one swipe at a time! 👥",
    gradient: "from-blue-500 to-cyan-500",
    stats: "1000+ connections made"
  },
  {
    icon: Heart,
    title: "FIND LOVE",
    subtitle: "Romantic Connections",
    description: "Discover your perfect match for dates, proms, and romantic adventures. Our AI algorithm finds people who share your values and interests. 💕",
    gradient: "from-pink-500 to-rose-500",
    stats: "500+ couples formed"
  },
  {
    icon: Ship,
    title: "SHIPPING",
    subtitle: "Friends as Cupids",
    description: "Let your friends play matchmaker! Send anonymous ships to connect people you think would be perfect together. Be the cupid! 🚢",
    gradient: "from-purple-500 to-pink-500",
    stats: "300+ ships sent"
  },
  {
    icon: MessageCircle,
    title: "SMART MESSAGING",
    subtitle: "Quality over Quantity",
    description: "5 meaningful messages to make the perfect first impression. No spam, just genuine conversations that lead to real connections. 💬",
    gradient: "from-indigo-500 to-purple-500",
    stats: "95% response rate"
  },
  {
    icon: Dice6,
    title: "DAILY MATCH",
    subtitle: "Serendipity Every Day",
    description: "Get a fresh match every day! Our AI carefully curates each recommendation based on compatibility, interests, and mutual attraction. ✨",
    gradient: "from-cyan-500 to-blue-500",
    stats: "Daily surprises"
  },
  {
    icon: Coffee,
    title: "GROUP ROOMS",
    subtitle: "Community Building",
    description: "Join study groups, hobby clubs, and event planning communities. Build connections beyond one-on-one interactions. 🎉",
    gradient: "from-orange-500 to-red-500",
    stats: "Coming soon"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <span className="text-white/90 text-sm font-medium">✨ Core Features</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Find Love & Friends
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Swipe, match, and connect with fellow BITS students. Find your perfect match for friendship, dating, and everything in between! 💖
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
              <GlassCard className="p-8 h-full group" hover={true}>
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-purple-300 font-medium mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-white/70 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="text-sm text-white/50">
                    {feature.stats}
                  </div>
                </div>

                {/* CTA */}
                <motion.div
                  className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <GradientButton size="lg" variant="primary">
            Start Swiping & Matching! 💕
            <ArrowRight className="w-5 h-5" />
          </GradientButton>
        </motion.div>
      </div>
    </section>
  )
}