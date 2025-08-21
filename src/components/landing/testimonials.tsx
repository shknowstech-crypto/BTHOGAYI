'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const testimonials = [
  {
    name: "Arjun Sharma",
    campus: "BITS Pilani",
    year: "3rd Year CSE",
    content: "BITSPARK helped me find my best friends and even my girlfriend! The AI matching is incredibly accurate.",
    rating: 5,
    avatar: "AS"
  },
  {
    name: "Priya Patel",
    campus: "BITS Goa",
    year: "2nd Year ECE",
    content: "The shipping feature is so fun! My friends matched me with someone perfect. We're going to prom together!",
    rating: 5,
    avatar: "PP"
  },
  {
    name: "Rahul Kumar",
    campus: "BITS Hyderabad",
    year: "4th Year Mech",
    content: "Finally, a platform made just for BITS students. The verification process makes it so much safer.",
    rating: 5,
    avatar: "RK"
  },
  {
    name: "Sneha Reddy",
    campus: "BITS Dubai",
    year: "1st Year CS",
    content: "Love the daily match feature! Every day brings a new surprise connection. Made so many friends already.",
    rating: 5,
    avatar: "SR"
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            What BITS Students{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Are Saying
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Real stories from real BITS students who found their connections
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-purple-400 mb-4" />
                
                {/* Content */}
                <p className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.year}, {testimonial.campus}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}