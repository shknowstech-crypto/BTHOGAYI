import { supabase } from './supabase'
import { useAuthStore } from './store'
import { Message, Connection, Notification } from './supabase'

export class RealtimeService {
  private subscriptions: Map<string, any> = new Map()

  // Subscribe to real-time messages for a connection
  subscribeToMessages(connectionId: string, onMessage: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`
        },
        (payload) => {
          console.log('New message received:', payload.new)
          onMessage(payload.new as Message)
        }
      )
      .subscribe()

    this.subscriptions.set(`messages:${connectionId}`, channel)
    return () => this.unsubscribe(`messages:${connectionId}`)
  }

  // Subscribe to real-time connections (matches)
  subscribeToConnections(userId: string, onConnection: (connection: Connection) => void) {
    const channel = supabase
      .channel(`connections:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `or(user1_id.eq.${userId},user2_id.eq.${userId})`
        },
        (payload) => {
          console.log('Connection update:', payload)
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onConnection(payload.new as Connection)
          }
        }
      )
      .subscribe()

    this.subscriptions.set(`connections:${userId}`, channel)
    return () => this.unsubscribe(`connections:${userId}`)
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification:', payload.new)
          onNotification(payload.new as Notification)
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            const notif = payload.new as Notification
            new Notification(notif.title, {
              body: notif.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            })
          }
        }
      )
      .subscribe()

    this.subscriptions.set(`notifications:${userId}`, channel)
    return () => this.unsubscribe(`notifications:${userId}`)
  }

  // Subscribe to user online status
  subscribeToUserPresence(userId: string, onPresenceChange: (presence: any) => void) {
    const channel = supabase
      .channel(`presence:${userId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        onPresenceChange(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          })
        }
      })

    this.subscriptions.set(`presence:${userId}`, channel)
    return () => this.unsubscribe(`presence:${userId}`)
  }

  // Unsubscribe from a channel
  unsubscribe(channelKey: string) {
    const channel = this.subscriptions.get(channelKey)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelKey)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.subscriptions.forEach((channel, key) => {
      supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
  }

  // Send typing indicator
  async sendTypingIndicator(connectionId: string, isTyping: boolean) {
    const channel = supabase.channel(`typing:${connectionId}`)
    
    if (isTyping) {
      await channel.track({
        typing: true,
        user_id: useAuthStore.getState().user?.id,
        timestamp: new Date().toISOString()
      })
    } else {
      await channel.untrack()
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(connectionId: string, onTyping: (typingUsers: string[]) => void) {
    const channel = supabase
      .channel(`typing:${connectionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const typingUsers = Object.keys(state).filter(key => 
          state[key][0]?.typing && 
          state[key][0]?.user_id !== useAuthStore.getState().user?.id
        )
        onTyping(typingUsers)
      })
      .subscribe()

    this.subscriptions.set(`typing:${connectionId}`, channel)
    return () => this.unsubscribe(`typing:${connectionId}`)
  }

  // Update user online status
  async updateOnlineStatus(isOnline: boolean) {
    const userId = useAuthStore.getState().user?.id
    if (!userId) return

    try {
      await supabase
        .from('users')
        .update({ 
          last_seen: new Date().toISOString(),
          is_active: isOnline 
        })
        .eq('id', userId)
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }
}

// Singleton instance
export const realtimeService = new RealtimeService()

// Hook for real-time features
export function useRealtime() {
  const { user } = useAuthStore()

  const subscribeToMessages = (connectionId: string, onMessage: (message: Message) => void) => {
    return realtimeService.subscribeToMessages(connectionId, onMessage)
  }

  const subscribeToConnections = (onConnection: (connection: Connection) => void) => {
    if (!user?.id) return () => {}
    return realtimeService.subscribeToConnections(user.id, onConnection)
  }

  const subscribeToNotifications = (onNotification: (notification: Notification) => void) => {
    if (!user?.id) return () => {}
    return realtimeService.subscribeToNotifications(user.id, onNotification)
  }

  const subscribeToTyping = (connectionId: string, onTyping: (typingUsers: string[]) => void) => {
    return realtimeService.subscribeToTyping(connectionId, onTyping)
  }

  const sendTypingIndicator = (connectionId: string, isTyping: boolean) => {
    return realtimeService.sendTypingIndicator(connectionId, isTyping)
  }

  const updateOnlineStatus = (isOnline: boolean) => {
    return realtimeService.updateOnlineStatus(isOnline)
  }

  return {
    subscribeToMessages,
    subscribeToConnections,
    subscribeToNotifications,
    subscribeToTyping,
    sendTypingIndicator,
    updateOnlineStatus
  }
}