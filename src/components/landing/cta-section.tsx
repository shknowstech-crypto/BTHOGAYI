'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Users, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
import { GlassCard } from '@/components/ui/glass-card'

export function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
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
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassCard className="p-12 max-w-4xl mx-auto">
            {/* Icons */}
            <div className="flex justify-center gap-4 mb-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center"
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Find Your{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Perfect Match?
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of BITS students who have already found their connections. 
              Your next best friend or life partner could be just one click away.
            </p>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
                <p className="text-white/70">Active Students</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">500+</div>
                <p className="text-white/70">Successful Matches</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">4</div>
                <p className="text-white/70">BITS Campuses</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <GradientButton
                size="xl"
                variant="romantic"
                onClick={() => navigate('/auth')}
              >
                Join BITSPARK Now <ArrowRight className="w-5 h-5" />
              </GradientButton>
              
              <GradientButton
                size="xl"
                variant="secondary"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn More
              </GradientButton>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                🔒 Secure • ✅ Verified Students Only • 🎓 All BITS Campuses
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}