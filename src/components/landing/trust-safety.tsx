'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, Eye, Lock, UserCheck, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const safetyFeatures = [
  {
    icon: UserCheck,
    title: "BITS Email Verification",
    description: "Only verified BITS students can join our platform",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Shield,
    title: "Student ID Verification",
    description: "Manual verification of student IDs for authenticity",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Eye,
    title: "Photo Verification",
    description: "Profile photos are verified to prevent fake accounts",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Lock,
    title: "Secure Messaging",
    description: "End-to-end encrypted messages with smart limits",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: AlertTriangle,
    title: "Report System",
    description: "Easy reporting and moderation for safety",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: CheckCircle,
    title: "Manual Moderation",
    description: "Human moderators review reports and maintain safety",
    color: "from-teal-500 to-green-500"
  }
]

export function TrustSafetySection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Safety is Our{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Priority
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Multiple layers of verification and safety features to ensure a secure environment
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full text-center hover:bg-white/15 transition-colors">
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 mx-auto`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <GlassCard className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                <p className="text-white/70">Verified Students</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                <p className="text-white/70">Safety Monitoring</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">&lt;1hr</div>
                <p className="text-white/70">Report Response</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400 mb-2">0</div>
                <p className="text-white/70">Data Breaches</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}