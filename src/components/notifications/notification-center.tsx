'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Heart, MessageCircle, Users, Ship, Sparkles, Check } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { useRealtime } from '@/lib/realtime'
import { useAuthStore } from '@/lib/store'
import { supabase, Notification } from '@/lib/supabase'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuthStore()
  const { subscribeToNotifications } = useRealtime()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    loadNotifications()

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Play notification sound
      playNotificationSound()
    })

    return unsubscribe
  }, [user?.id])

  const loadNotifications = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.id) return

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const playNotificationSound = () => {
    // Create a subtle notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="w-5 h-5 text-pink-400" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-400" />
      case 'ship':
        return <Ship className="w-5 h-5 text-purple-400" />
      case 'connection_request':
        return <Users className="w-5 h-5 text-green-400" />
      case 'daily_match':
        return <Sparkles className="w-5 h-5 text-yellow-400" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-end p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mt-16"
          >
            <GlassCard className="max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white">Notifications</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full mx-auto"
                    />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No notifications yet</h3>
                    <p className="text-white/60 text-sm">
                      You'll see notifications for matches, messages, and ships here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-purple-500/10' : ''
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`font-medium ${
                                notification.read ? 'text-white/80' : 'text-white'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-white/50 text-xs whitespace-nowrap">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-white/60' : 'text-white/80'
                            }`}>
                              {notification.message}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-3 h-3 text-white/50" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
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

// Hook for notification management
export function useNotifications() {
  const { user } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Load initial unread count
    const loadUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)

        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error loading unread count:', error)
      }
    }

    loadUnreadCount()
  }, [user?.id])

  return { unreadCount }
}