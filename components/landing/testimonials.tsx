'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Star, Heart, Users, Ship } from 'lucide-react'
import { useState } from 'react'

const testimonials = [
  {
    id: 1,
    type: 'Friendship',
    name: 'Meera Singh',
    course: 'Computer Science, 3rd Year',
    campus: 'BITS Pilani',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: "Found my best friend through CONNECT! The AI matching is incredible - we have so much in common.",
    story: 'Met through CONNECT feature, now roommates and study partners',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    rating: 5
  },
  {
    id: 2,
    type: 'Dating',
    name: 'Rahul Sharma',
    course: 'Mechanical Engineering, 2nd Year',
    campus: 'BITS Goa',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: "Met my girlfriend through FIND A DATE! The 5-message limit kept conversations meaningful.",
    story: 'Matched for prom date, now dating for 6 months',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    rating: 5
  },
  {
    id: 3,
    type: 'Shipping Success',
    name: 'Priya Patel',
    course: 'Electronics & Communication, 4th Year',
    campus: 'BITS Hyderabad',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    quote: "My friends shipped me with my now-boyfriend! Thank you BITSPARK and our cupid friends.",
    story: 'Friends used shipping feature, couple is now engaged',
    icon: Ship,
    color: 'from-purple-500 to-pink-500',
    rating: 5
  }
]

export function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Real Connections,{' '}
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Real Stories
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            See how BITSPARK has transformed student connections across all campuses
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <motion.div
          key={activeTestimonial}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <GlassCard className="max-w-4xl mx-auto p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
                  <img 
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Type Badge */}
                <div className={`absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r ${testimonials[activeTestimonial].color} rounded-full flex items-center justify-center`}>
                  <testimonials[activeTestimonial].icon className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                {/* Stars */}
                <div className="flex justify-center md:justify-start gap-1 mb-4">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Quote */}
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed"
                >
                  "{testimonials[activeTestimonial].quote}"
                </motion.blockquote>

                {/* Attribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-xl font-semibold text-white mb-1">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-white/70 mb-1">
                    {testimonials[activeTestimonial].course}
                  </p>
                  <p className="text-white/60">
                    {testimonials[activeTestimonial].campus}
                  </p>
                </motion.div>

                {/* Story */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <p className="text-white/80 italic">
                    {testimonials[activeTestimonial].story}
                  </p>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-4 mb-16">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-4 h-4 rounded-full transition-all ${
                index === activeTestimonial 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Success Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <GlassCard className="inline-block p-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Success Stories by Numbers
            </h3>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">200+</div>
                <p className="text-white/70 text-sm">Friendships</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400 mb-2">150+</div>
                <p className="text-white/70 text-sm">Relationships</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">80+</div>
                <p className="text-white/70 text-sm">Shipping Successes</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}