import { supabase } from './supabase'
import { Message, Connection } from './supabase'

export interface MessageLimitInfo {
  currentCount: number
  limitReached: boolean
  canSendMore: boolean
  remainingMessages: number
}

export class MessagingService {
  // Get message count for a connection
  static async getMessageCount(connectionId: string, userId: string): Promise<MessageLimitInfo> {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('message_count')
        .eq('connection_id', connectionId)
        .eq('sender_id', userId)
        .order('message_count', { ascending: false })
        .limit(1)

      const currentCount = messages?.[0]?.message_count || 0
      const limitReached = currentCount >= 5
      
      return {
        currentCount,
        limitReached,
        canSendMore: !limitReached,
        remainingMessages: Math.max(0, 5 - currentCount)
      }
    } catch (error) {
      console.error('Error getting message count:', error)
      return {
        currentCount: 5,
        limitReached: true,
        canSendMore: false,
        remainingMessages: 0
      }
    }
  }

  // Send a message with limit enforcement
  static async sendMessage(
    connectionId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; message?: Message; limitReached?: boolean }> {
    try {
      // Check message limit
      const limitInfo = await this.getMessageCount(connectionId, senderId)
      
      if (limitInfo.limitReached) {
        return { success: false, limitReached: true }
      }

      // Send message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          connection_id: connectionId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_count: limitInfo.currentCount + 1
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for receiver
      await this.createMessageNotification(receiverId, senderId, content)

      return { 
        success: true, 
        message, 
        limitReached: message.message_count >= 5 
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false }
    }
  }

  // Get messages for a connection
  static async getMessages(connectionId: string, userId: string): Promise<Message[]> {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(display_name, profile_photo),
          receiver:users!messages_receiver_id_fkey(display_name, profile_photo)
        `)
        .eq('connection_id', connectionId)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true })

      return messages || []
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  // Mark messages as read
  static async markAsRead(connectionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('connection_id', connectionId)
        .eq('receiver_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking messages as read:', error)
      return false
    }
  }

  // Get platform redirection options when limit is reached
  static getPlatformOptions() {
    return [
      {
        name: 'Instagram',
        icon: '📷',
        description: 'Continue chatting on Instagram DM',
        action: 'instagram'
      },
      {
        name: 'WhatsApp',
        icon: '💬',
        description: 'Move to WhatsApp for instant messaging',
        action: 'whatsapp'
      },
      {
        name: 'Discord',
        icon: '🎮',
        description: 'Join a Discord server together',
        action: 'discord'
      },
      {
        name: 'Phone',
        icon: '📱',
        description: 'Exchange phone numbers',
        action: 'phone'
      },
      {
        name: 'Continue on BITSPARK',
        icon: '✨',
        description: 'Upgrade to premium for unlimited messages',
        action: 'premium',
        premium: true
      }
    ]
  }

  // Create message notification
  private static async createMessageNotification(
    receiverId: string,
    senderId: string,
    content: string
  ) {
    try {
      const { data: sender } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', senderId)
        .single()

      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          title: 'New Message',
          message: `${sender?.display_name || 'Someone'} sent you a message`,
          data: {
            sender_id: senderId,
            preview: content.substring(0, 50)
          }
        })
    } catch (error) {
      console.error('Error creating message notification:', error)
    }
  }

  // Real-time message subscription
  static subscribeToMessages(connectionId: string, callback: (message: Message) => void) {
    return supabase
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
          callback(payload.new as Message)
        }
      )
      .subscribe()
  }

  // Typing indicator
  static async sendTypingIndicator(connectionId: string, userId: string) {
    try {
      await supabase.realtime.broadcast({
        channel: `typing:${connectionId}`,
        event: 'typing',
        payload: { user_id: userId, typing: true }
      })
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }

  static async stopTypingIndicator(connectionId: string, userId: string) {
    try {
      await supabase.realtime.broadcast({
        channel: `typing:${connectionId}`,
        event: 'typing',
        payload: { user_id: userId, typing: false }
      })
    } catch (error) {
      console.error('Error stopping typing indicator:', error)
    }
  }
}