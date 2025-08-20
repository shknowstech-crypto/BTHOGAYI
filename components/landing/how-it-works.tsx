'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GraduationCap, Sparkles, Bot, MessageCircle, Rocket } from 'lucide-react'

const steps = [
  {
    number: "01",
    title: "Verify with BITS Email",
    description: "Secure signup with your @pilani.bits-pilani.ac.in email address",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02", 
    title: "Create Your Profile",
    description: "Add photos, interests, and preferences for perfect matching",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    title: "Get AI Matches",
    description: "Our algorithm finds your perfect matches based on compatibility",
    icon: Bot,
    color: "from-indigo-500 to-purple-500"
  },
  {
    number: "04",
    title: "Start Conversations",
    description: "5 meaningful messages to make lasting connections",
    icon: MessageCircle,
    color: "from-pink-500 to-rose-500"
  },
  {
    number: "05",
    title: "Take It Further",
    description: "Move to Instagram, WhatsApp, or continue on our premium platform",
    icon: Rocket,
    color: "from-orange-500 to-red-500"
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-slate-900 to-indigo-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Journey to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Connection
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Simple steps to meaningful relationships at BITS Pilani
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-purple-500 to-pink-500" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } flex-col lg:gap-16`}
              >
                {/* Step Number Circle */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full items-center justify-center text-white font-bold text-xl z-10">
                  {step.number}
                </div>

                {/* Content Card */}
                <div className="w-full lg:w-5/12">
                  <GlassCard className="p-8 text-center lg:text-left">
                    {/* Mobile step number */}
                    <div className="lg:hidden flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {step.number}
                      </div>
                    </div>

                    <motion.div
                      className={`inline-flex w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl items-center justify-center mb-6`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {step.description}
                    </p>
                  </GlassCard>
                </div>

                {/* Spacer for the other side */}
                <div className="hidden lg:block w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <GlassCard className="inline-block p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-white/70 mb-6">
              Join thousands of BITS students who have already found their connections
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg"
            >
              Get Started Now
            </motion.button>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}