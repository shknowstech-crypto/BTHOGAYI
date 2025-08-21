'use client'

import { motion } from 'framer-motion'
import { UserPlus, Heart, MessageCircle, Coffee } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up with BITS Email",
    description: "Create your account using your official BITS email address",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    icon: Heart,
    title: "Set Your Preferences",
    description: "Choose similarity preferences and what you're looking for",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: MessageCircle,
    title: "Get Matched",
    description: "Our AI finds compatible connections based on your preferences",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Coffee,
    title: "Start Connecting",
    description: "Send messages and build meaningful relationships",
    gradient: "from-indigo-500 to-cyan-500",
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            How{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              BITSPARK
            </span>{' '}
            Works
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Getting started is simple. Follow these steps to begin your journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full text-center">
                {/* Step Number */}
                <div className="text-6xl font-bold text-white/20 mb-4">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-6 mx-auto`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}