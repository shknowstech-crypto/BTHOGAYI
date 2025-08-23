'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Sparkles, MessageCircle, Play, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-20" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,157,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(102,126,234,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(78,205,196,0.15),transparent_70%)]" />
        
        {/* Enhanced Floating Elements */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
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
              {/* Enhanced Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center px-4 py-2 glass-card-strong rounded-full mb-8"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-white/90 text-sm font-medium">Exclusive to BITS Students</span>
                <div className="ml-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                Find Your Perfect{' '}
                <motion.span 
                  className="text-gradient-romantic"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  Match
                </motion.span>
                <br />at BITS
              </motion.h1>

              {/* Enhanced Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Swipe right on friendship, love, and meaningful connections. 
                Our AI-powered algorithm matches you with fellow BITS students based on interests, 
                personality, and compatibility. It's time to find your tribe! 💕
              </motion.p>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8"
              >
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-gradient-romantic">1000+</div>
                  <div className="text-white/60 text-sm">Active Students</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-gradient-modern">500+</div>
                  <div className="text-white/60 text-sm">Successful Matches</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-gradient-fresh">4</div>
                  <div className="text-white/60 text-sm">BITS Campuses</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-yellow-400">24/7</div>
                  <div className="text-white/60 text-sm">Safe & Secure</div>
                </motion.div>
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <GradientButton
                  size="lg"
                  variant="romantic"
                  onClick={() => navigate('/auth')}
                  className="group shadow-2xl pulse-glow"
                >
                  Start Swiping Now! 💖
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </GradientButton>
                
                <motion.button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex items-center justify-center gap-3 px-6 py-3 text-white/80 hover:text-white transition-colors group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className="w-12 h-12 glass-card hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Play className="w-5 h-5 ml-1" />
                  </motion.div>
                  <span className="font-medium">See How It Works</span>
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-8 flex flex-wrap justify-center lg:justify-start gap-6 text-white/60 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                  <span>100% Verified BITS Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full pulse-glow"></div>
                  <span>AI-Powered Smart Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full pulse-glow"></div>
                  <span>Safe & Private Dating</span>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Right Content - App Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <div className="relative mx-auto w-80 h-[600px] float">
                {/* Enhanced Phone Frame */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-full h-full bg-romantic rounded-[2.5rem] p-1">
                    <div className="w-full h-full bg-black rounded-[2rem] overflow-hidden">
                      {/* Enhanced App Content */}
                      <div className="p-6 h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Heart className="w-6 h-6 text-pink-400" />
                            </motion.div>
                            <span className="text-white font-bold">BITSPARK</span>
                          </div>
                          <motion.div 
                            className="w-8 h-8 bg-romantic rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>

                        {/* Enhanced Features Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <motion.div 
                            className="glass-card rounded-2xl p-4 border border-blue-500/20"
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                          >
                            <Users className="w-6 h-6 text-blue-400 mb-2" />
                            <div className="text-white text-sm font-medium">Connect</div>
                            <div className="text-white/60 text-xs">Find Friends</div>
                          </motion.div>
                          
                          <motion.div 
                            className="glass-card rounded-2xl p-4 border border-pink-500/20"
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                          >
                            <Heart className="w-6 h-6 text-pink-400 mb-2" />
                            <div className="text-white text-sm font-medium">Dating</div>
                            <div className="text-white/60 text-xs">Find Love</div>
                          </motion.div>
                          
                          <motion.div 
                            className="glass-card rounded-2xl p-4 border border-purple-500/20"
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                          >
                            <MessageCircle className="w-6 h-6 text-purple-400 mb-2" />
                            <div className="text-white text-sm font-medium">Messages</div>
                            <div className="text-white/60 text-xs">5 Msg Limit</div>
                          </motion.div>
                          
                          <motion.div 
                            className="glass-card rounded-2xl p-4 border border-cyan-500/20"
                            whileHover={{ scale: 1.05 }}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                          >
                            <Sparkles className="w-6 h-6 text-cyan-400 mb-2" />
                            <div className="text-white text-sm font-medium">Daily Match</div>
                            <div className="text-white/60 text-xs">AI Powered</div>
                          </motion.div>
                        </div>

                        {/* Enhanced Bottom CTA */}
                        <div className="mt-6">
                          <motion.div 
                            className="bg-romantic rounded-xl p-3 text-center pulse-glow"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="text-white font-medium text-sm">Join Now - It's Free!</div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Floating Elements */}
                <motion.div
                  animate={{ 
                    y: [0, -15, 0], 
                    rotate: [0, 8, -8, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-romantic rounded-2xl flex items-center justify-center shadow-romantic"
                >
                  <Heart className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 15, 0], 
                    rotate: [0, -8, 8, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-modern rounded-2xl flex items-center justify-center shadow-modern"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ 
                    x: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                  className="absolute top-1/2 -left-6 w-12 h-12 bg-fresh rounded-full flex items-center justify-center shadow-fresh"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center cursor-pointer hover:border-pink-400/50 transition-colors"
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}