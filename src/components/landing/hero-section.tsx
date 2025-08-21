'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Sparkles, MessageCircle, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,219,255,0.1),transparent_70%)]" />
        
        {/* Floating Elements */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-white/90 text-sm font-medium">Exclusive to BITS Students</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Find Your Perfect{' '}
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Match
                </span>
                <br />at BITS
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Connect with fellow BITS students through AI-powered matching. 
                Find friends, dates, and meaningful relationships across all campuses.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1000+</div>
                  <div className="text-white/60 text-sm">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">500+</div>
                  <div className="text-white/60 text-sm">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">4</div>
                  <div className="text-white/60 text-sm">Campuses</div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <GradientButton
                  size="lg"
                  variant="primary"
                  onClick={() => navigate('/auth')}
                  className="group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
                
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-white/80 hover:text-white transition-colors group"
                >
                  <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                  <span>See How It Works</span>
                </button>
              </motion.div>
            </div>

            {/* Right Content - App Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <div className="relative mx-auto w-80 h-[600px]">
                {/* Phone Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-pink-500 rounded-[2.5rem] p-1">
                    <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden">
                      {/* App Content */}
                      <div className="p-6 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-pink-400" />
                            <span className="text-white font-bold">BITSPARK</span>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-white/10">
                            <Users className="w-6 h-6 text-blue-400 mb-2" />
                            <div className="text-white text-sm font-medium">Connect</div>
                            <div className="text-white/60 text-xs">Find Friends</div>
                          </div>
                          <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl p-4 border border-white/10">
                            <Heart className="w-6 h-6 text-pink-400 mb-2" />
                            <div className="text-white text-sm font-medium">Dating</div>
                            <div className="text-white/60 text-xs">Find Love</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-white/10">
                            <MessageCircle className="w-6 h-6 text-purple-400 mb-2" />
                            <div className="text-white text-sm font-medium">Messages</div>
                            <div className="text-white/60 text-xs">5 Msg Limit</div>
                          </div>
                          <div className="bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-2xl p-4 border border-white/10">
                            <Sparkles className="w-6 h-6 text-cyan-400 mb-2" />
                            <div className="text-white text-sm font-medium">Daily Match</div>
                            <div className="text-white/60 text-xs">AI Powered</div>
                          </div>
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-6">
                          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-3 text-center">
                            <div className="text-white font-medium text-sm">Join Now</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center cursor-pointer"
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}