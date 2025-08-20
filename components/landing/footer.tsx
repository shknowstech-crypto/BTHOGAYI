'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Heart, Mail, Shield, FileText, HelpCircle } from 'lucide-react'

const footerSections = [
  {
    title: 'Features',
    links: [
      { name: 'CONNECT - Social', href: '#connect' },
      { name: 'FIND A DATE', href: '#dating' },
      { name: 'SHIPPING', href: '#shipping' },
      { name: 'Smart Messaging', href: '#messaging' },
      { name: 'Daily Matches', href: '#matches' }
    ]
  },
  {
    title: 'Campuses',
    links: [
      { name: 'BITS Pilani', href: '#pilani' },
      { name: 'BITS Goa', href: '#goa' },
      { name: 'BITS Hyderabad', href: '#hyderabad' },
      { name: 'BITS Dubai', href: '#dubai' }
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#help' },
      { name: 'Safety Guidelines', href: '#safety' },
      { name: 'Community Rules', href: '#rules' },
      { name: 'Contact Us', href: '#contact' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Data Protection', href: '#data' }
    ]
  }
]

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-8 mb-12">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">BITSPARK</h3>
                </motion.div>
                
                <p className="text-white/70 mb-6 leading-relaxed">
                  The exclusive social platform connecting BITS students across all campuses through AI-powered matching.
                </p>
                
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Footer Links */}
              {footerSections.map((section, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={linkIndex}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <a
                          href={link.href}
                          className="text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          {link.name}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 text-white/60"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p>© 2025 BITSPARK. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span>Made with</span>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </motion.div>
            <span>for BITS Community</span>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 pt-8 border-t border-white/10"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Student Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>BITS Email Only</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}