'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { LoadingSpinner } from './loading-spinner'
import { X, Bell, Heart, Users, Ship, MessageCircle, Check } from 'lucide-react'
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
  daily_match: Bell
}

const notificationColors = {
  match: 'text-pink-400',
  message: 'text-blue-400',
  ship: 'text-purple-400',
  connection_request: 'text-green-400',
  daily_match: 'text-cyan-400'
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
    try {
      await NotificationService.markAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      await NotificationService.markAllAsRead(user.id)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[80vh] overflow-hidden"
        >
          <GlassCard className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.read) && (
                  <GradientButton
                    size="sm"
                    variant="secondary"
                    onClick={markAllAsRead}
                  >
                    <Check className="w-4 h-4" />
                    Mark All Read
                  </GradientButton>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner className="mx-auto mb-4" />
                  <p className="text-white/70">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type]
                    const iconColor = notificationColors[notification.type]
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer",
                          notification.read 
                            ? "bg-white/5 border-white/10" 
                            : "bg-purple-500/20 border-purple-400/30"
                        )}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-1", iconColor)}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-white/70 text-sm leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-white/50 text-xs mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}