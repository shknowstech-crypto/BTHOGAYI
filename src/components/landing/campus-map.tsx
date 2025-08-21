'use client'

import { motion } from 'framer-motion'
import { MapPin, Users, GraduationCap } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const campuses = [
  {
    name: "BITS Pilani",
    location: "Rajasthan",
    students: "4000+",
    color: "from-blue-500 to-purple-500",
    position: { top: "30%", left: "25%" }
  },
  {
    name: "BITS Goa",
    location: "Goa",
    students: "2500+",
    color: "from-green-500 to-blue-500",
    position: { top: "60%", left: "20%" }
  },
  {
    name: "BITS Hyderabad",
    location: "Telangana",
    students: "3000+",
    color: "from-purple-500 to-pink-500",
    position: { top: "55%", left: "35%" }
  },
  {
    name: "BITS Dubai",
    location: "UAE",
    students: "1500+",
    color: "from-orange-500 to-red-500",
    position: { top: "45%", left: "45%" }
  }
]

export function CampusMapSection() {
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
            Connect Across All{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BITS Campuses
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            From Pilani to Dubai, connect with BITS students worldwide
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
            <GlassCard className="p-8 h-96 relative overflow-hidden">
              {/* Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl" />
              
              {/* Campus Markers */}
              {campuses.map((campus, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={campus.position}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${campus.color} shadow-lg`}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-4 h-4 rounded-full bg-gradient-to-r ${campus.color} opacity-50`}
                    />
                  </motion.div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {campus.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </GlassCard>
          </motion.div>

          {/* Campus Stats */}
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
                <GlassCard className="p-6 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${campus.color} flex items-center justify-center`}>
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{campus.name}</h3>
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{campus.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{campus.students} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}