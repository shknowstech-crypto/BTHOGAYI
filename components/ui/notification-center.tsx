'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { X, Bell, Heart, Users, Ship, MessageCircle, Dice6 } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { NotificationService } from '@/lib/notifications'
import { Notification } from '@/lib/supabase'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const notificationIcons = {
  match: Heart,
  message: MessageCircle,
  ship: Ship,
  connection_request: Users,
  daily_match: Dice6
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications()
    }
  }, [isOpen, user])

  const loadNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userNotifications = await NotificationService.getUserNotifications(user.id)
      setNotifications(userNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    await NotificationService.markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
                  <p className="text-white/70">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        notification.read
                          ? 'bg-white/5 border-white/10'
                          : 'bg-purple-500/20 border-purple-400/30'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.read ? 'bg-white/10' : 'bg-purple-500/30'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-white/70 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-white/50 text-xs mt-2">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}