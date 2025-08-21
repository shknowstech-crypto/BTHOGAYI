'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { X, Bell, Heart, Users, Ship, MessageCircle, Check } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { NotificationService } from '@/lib/notifications'
import { Notification } from '@/lib/supabase'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

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
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return
    
    try {
      await NotificationService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return Heart
      case 'message': return MessageCircle
      case 'ship': return Ship
      case 'connection_request': return Users
      case 'daily_match': return Bell
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match': return 'from-pink-500 to-rose-500'
      case 'message': return 'from-blue-500 to-cyan-500'
      case 'ship': return 'from-purple-500 to-pink-500'
      case 'connection_request': return 'from-green-500 to-emerald-500'
      case 'daily_match': return 'from-orange-500 to-yellow-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
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
                    <GradientButton size="sm" onClick={markAllAsRead}>
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

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
                    <p className="text-white/70">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-12 h-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">No notifications yet</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type)
                      const colorClass = getNotificationColor(notification.type)
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            notification.read 
                              ? 'bg-white/5 border-white/10' 
                              : 'bg-white/10 border-purple-500/30'
                          }`}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-white text-sm">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-white/70 text-sm mt-1">
                                {notification.message}
                              </p>
                              <p className="text-white/50 text-xs mt-2">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
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
      )}
    </AnimatePresence>
  )
}