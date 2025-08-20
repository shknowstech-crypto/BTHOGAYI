'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { Bell, X, Check, Heart, Users, Ship, MessageCircle, Dice6 } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [user, isOpen])

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

  const loadUnreadCount = async () => {
    if (!user) return
    
    try {
      const count = await NotificationService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    
    try {
      await NotificationService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  if (!isOpen) return null

  return (
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
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="mb-4">
              <GradientButton
                size="sm"
                variant="secondary"
                onClick={handleMarkAllAsRead}
                className="w-full"
              >
                <Check className="w-4 h-4" />
                Mark All as Read
              </GradientButton>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-white/70">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">No notifications yet</p>
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type] || Bell
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-4 rounded-xl border transition-colors ${
                        notification.read
                          ? 'bg-white/5 border-white/10'
                          : 'bg-purple-500/20 border-purple-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-white/70 text-xs mt-1">
                            {notification.message}
                          </p>
                          <p className="text-white/50 text-xs mt-2">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-white/70 hover:text-white transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-white/70 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}