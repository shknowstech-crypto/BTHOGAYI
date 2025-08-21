'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Sparkles, MessageCircle } from 'lucide-react'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard } from '@/components/ui/glass-card'

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <GlassCard className="inline-flex items-center px-6 py-3 bg-white/20">
            <Sparkles className="w-5 h-5 text-yellow-300 mr-2" />
            <span className="text-white font-medium">Exclusive to BITS Pilani Students</span>
          </GlassCard>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Find Your Perfect{' '}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Connection
          </span>
          <br />at BITS Pilani
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          The exclusive social platform where BITS students discover friendships, 
          dates, and life-changing connections through AI-powered matching.
        </motion.p>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 mb-10 text-white/70"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>1000+ Students</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            <span>500+ Matches</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <span>All BITS Campuses</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <GradientButton
            size="xl"
            variant="romantic"
            onClick={() => {
              window.location.href = '/auth'
            }}
          >
            Join BITSPARK Today <ArrowRight className="w-5 h-5" />
          </GradientButton>
          
          <GradientButton
            size="xl"
            variant="secondary"
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            See How It Works
          </GradientButton>
        </motion.div>

        {/* Floating Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotateY: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="relative mx-auto w-64 h-[32rem] bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl"
          >
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 rounded-[2.5rem] p-1">
              <div className="w-full h-full bg-black rounded-[2rem] flex items-center justify-center">
                <div className="text-white text-center">
                  <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold">BITSPARK</p>
                  <p className="text-sm opacity-70">Coming Soon</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}