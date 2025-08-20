'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Shield, Lock, Camera, AlertTriangle, UserCheck, Eye } from 'lucide-react'

const features = [
  {
    icon: UserCheck,
    title: "BITS-Only Verified Community",
    description: "Only students with valid @pilani.bits-pilani.ac.in emails can join our platform",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Camera,
    title: "Photo Verification System",
    description: "All profile photos manually verified to prevent catfishing and ensure authenticity",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Lock,
    title: "End-to-End Message Encryption",
    description: "Your conversations are completely private and secure with military-grade encryption",
    color: "from-purple-500 to-indigo-500"
  },
  {
    icon: AlertTriangle,
    title: "Report & Block Tools",
    description: "Easy reporting system with quick response from our moderation team",
    color: "from-red-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Community Guidelines Enforcement",
    description: "Zero tolerance for harassment, spam, or inappropriate behavior",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "Full control over who can see your profile and contact you",
    color: "from-teal-500 to-blue-500"
  }
]

export function TrustSafetySection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
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
              Top Priority
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            We've built comprehensive safety features to ensure a secure and authentic experience for all BITS students
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full group cursor-pointer">
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
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

        {/* Safety Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GlassCard className="inline-block p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Trusted by the Community
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                <p className="text-white/70 text-sm">Verified Students</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
                <p className="text-white/70 text-sm">Data Breaches</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                <p className="text-white/70 text-sm">Moderation</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400 mb-2">99.9%</div>
                <p className="text-white/70 text-sm">Uptime</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassCard className="inline-block p-6">
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center gap-2 text-white/70">
                <Shield className="w-6 h-6 text-green-400" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Lock className="w-6 h-6 text-blue-400" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <UserCheck className="w-6 h-6 text-purple-400" />
                <span>Identity Verified</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <GlassCard className="max-w-4xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Safety Tips for Smart Dating
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Before Meeting:</h4>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                    <span>Video chat first to verify identity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                    <span>Meet in public places on campus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                    <span>Tell friends about your plans</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Red Flags:</h4>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                    <span>Refuses to video chat or verify</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                    <span>Asks for money or personal info</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2" />
                    <span>Pressures you to meet immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}