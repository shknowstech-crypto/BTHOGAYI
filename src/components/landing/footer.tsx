'use client'

import { motion } from 'framer-motion'
import { Heart, Mail, MapPin, Phone, Instagram, Twitter, Linkedin } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const campuses = [
  { name: "BITS Pilani", location: "Rajasthan, India" },
  { name: "BITS Goa", location: "Goa, India" },
  { name: "BITS Hyderabad", location: "Telangana, India" },
  { name: "BITS Dubai", location: "Dubai, UAE" }
]

const quickLinks = [
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Safety", href: "#safety" },
  { name: "FAQ", href: "#faq" }
]

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" }
]

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 py-16">
      <div className="container mx-auto px-6">
        <GlassCard className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">BITSPARK</span>
              </motion.div>
              <p className="text-white/70 mb-6 leading-relaxed">
                The exclusive social platform connecting BITS students across all campuses through AI-powered matching.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Campuses */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">BITS Campuses</h3>
              <ul className="space-y-2">
                {campuses.map((campus, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/80 font-medium">{campus.name}</p>
                      <p className="text-white/60 text-sm">{campus.location}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <Mail className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">support@bitspark.app</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <Phone className="w-4 h-4 text-white/50" />
                  <span className="text-white/70">+91 XXX XXX XXXX</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-white/60 text-sm">
              © 2024 BITSPARK. All rights reserved. Made with ❤️ for BITS students.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Community Guidelines
              </a>
            </div>
          </motion.div>
        </GlassCard>
      </div>
    </footer>
  )
}