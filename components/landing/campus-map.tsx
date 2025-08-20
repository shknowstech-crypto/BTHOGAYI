'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { MapPin, Users, Star } from 'lucide-react'

const campuses = [
  {
    name: "BITS Pilani",
    location: "Rajasthan",
    students: 400,
    highlight: "Original campus, highest activity",
    color: "from-blue-500 to-cyan-500",
    position: { x: 35, y: 45 }
  },
  {
    name: "BITS Goa",
    location: "Goa",
    students: 300,
    highlight: "Beach vibes, creative community",
    color: "from-green-500 to-teal-500",
    position: { x: 25, y: 70 }
  },
  {
    name: "BITS Hyderabad",
    location: "Telangana",
    students: 250,
    highlight: "Tech hub, innovation focused",
    color: "from-purple-500 to-pink-500",
    position: { x: 50, y: 65 }
  },
  {
    name: "BITS Dubai",
    location: "UAE",
    students: 50,
    highlight: "International diversity",
    color: "from-orange-500 to-red-500",
    position: { x: 70, y: 50 }
  }
]

export function CampusMapSection() {
  return (
    <section id="campuses" className="py-24 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connect Across All{' '}
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              BITS Campuses
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            One platform, four amazing campuses, endless connections
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <GlassCard className="p-8 aspect-square">
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 overflow-hidden">
                {/* India/World Map Background */}
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500 to-purple-500" />
                
                {/* Campus Markers */}
                {campuses.map((campus, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    style={{
                      position: 'absolute',
                      left: `${campus.position.x}%`,
                      top: `${campus.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className="group cursor-pointer"
                  >
                    {/* Pulse Animation */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 0.3, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.4
                      }}
                      className={`absolute inset-0 w-6 h-6 bg-gradient-to-r ${campus.color} rounded-full -translate-x-1/2 -translate-y-1/2`}
                    />
                    
                    {/* Main Marker */}
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className={`w-6 h-6 bg-gradient-to-r ${campus.color} rounded-full relative z-10 shadow-lg`}
                    />

                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
                    >
                      <GlassCard className="px-3 py-2 whitespace-nowrap">
                        <p className="text-white font-semibold text-sm">
                          {campus.name}
                        </p>
                        <p className="text-white/70 text-xs">
                          {campus.students}+ students
                        </p>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Campus Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {campuses.map((campus, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 hover:bg-white/15 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${campus.color} rounded-xl flex items-center justify-center`}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {campus.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-2">
                        {campus.location}
                      </p>
                      <p className="text-white/80 mb-3">
                        {campus.highlight}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Users className="w-4 h-4" />
                          <AnimatedCounter value={campus.students} suffix="+ active users" />
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <GlassCard className="inline-block p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={1000} suffix="+" />
                </div>
                <p className="text-white/70">Total Students</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">4</div>
                <p className="text-white/70">Campuses</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={500} suffix="+" />
                </div>
                <p className="text-white/70">Connections Made</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <p className="text-white/70">Satisfaction</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}