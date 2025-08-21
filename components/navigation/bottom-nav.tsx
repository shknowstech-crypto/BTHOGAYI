'use client'

import { motion } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, Heart, Ship, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Users, label: 'Connect', href: '/connect' },
  { icon: Heart, label: 'Dating', href: '/dating' },
  { icon: Ship, label: 'Ships', href: '/shipping' },
  { icon: MessageCircle, label: 'Messages', href: '/messages' },
  { icon: User, label: 'Profile', href: '/settings' }
]

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on landing page or auth
  if (pathname === '/' || pathname === '/auth') {
    return null
  }

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 p-4"
    >
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-2 shadow-2xl">
          <div className="flex items-center justify-between">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-purple-500/30 text-white" 
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}