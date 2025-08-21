import { supabase } from './supabase'
import { Message, Connection } from './supabase'

export interface MessageLimitInfo {
  currentCount: number
  limitReached: boolean
  canSendMore: boolean
  remainingMessages: number
}

export interface PlatformOption {
  name: string
  icon: string
  description: string
  action: string
  url: string
  premium?: boolean
}
export class MessagingService {
  // Enhanced message count tracking per user in conversation
  static async getMessageCount(connectionId: string, userId: string): Promise<MessageLimitInfo> {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('message_count, sender_id')
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

  // Enhanced message sending with quality checks
  static async sendMessage(
    connectionId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; message?: Message; limitReached?: boolean }> {
    try {
      // Basic content quality check
      const qualityScore = this.calculateMessageQuality(content)
      
      if (qualityScore < 0.3) {
        throw new Error('Message quality too low. Please write a more meaningful message.')
      }
      
      // Check message limit
      const limitInfo = await this.getMessageCount(connectionId, senderId)
      
      if (limitInfo.limitReached) {
        return { success: false, limitReached: true }
      }

      // Check if connection exists and is accepted
      const { data: connection } = await supabase
        .from('connections')
        .select('status')
        .eq('id', connectionId)
        .single()
        
      if (!connection || connection.status !== 'accepted') {
        throw new Error('Cannot send message to unaccepted connection')
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
      return { success: false, limitReached: false }
    }
  }

  // Calculate message quality score
  static calculateMessageQuality(content: string): number {
    const trimmed = content.trim()
    
    // Basic quality factors
    const lengthScore = Math.min(trimmed.length / 50, 1) // Prefer longer messages
    const wordCount = trimmed.split(/\s+/).length
    const wordScore = Math.min(wordCount / 10, 1) // Prefer more words
    
    // Penalize low-effort messages
    const lowEffortPatterns = [
      /^(hi|hey|hello|sup|yo)$/i,
      /^(ok|okay|k|kk)$/i,
      /^(lol|haha|lmao)$/i,
      /^.{1,3}$/
    ]
    
    const isLowEffort = lowEffortPatterns.some(pattern => pattern.test(trimmed))
    const effortScore = isLowEffort ? 0.2 : 1
    
    // Check for questions (engagement)
    const hasQuestion = /\?/.test(trimmed)
    const questionBonus = hasQuestion ? 0.2 : 0
    
    return Math.min((lengthScore * 0.4 + wordScore * 0.4 + effortScore * 0.2) + questionBonus, 1)
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

  // Enhanced platform options with better integration
  static getPlatformOptions(): PlatformOption[] {
    return [
      {
        name: 'Instagram',
        icon: '📷',
        description: 'Continue chatting on Instagram DM',
        action: 'instagram',
        url: 'https://instagram.com/direct/new/' // Direct to Instagram DM
      },
      {
        name: 'WhatsApp',
        icon: '💬',
        description: 'Move to WhatsApp for instant messaging',
        action: 'whatsapp',
        url: 'https://wa.me/' // WhatsApp direct link
      },
      {
        name: 'Discord',
        icon: '🎮',
        description: 'Join a Discord server together',
        action: 'discord',
        url: 'https://discord.gg/bitspark' // Custom Discord server
      },
      {
        name: 'Phone',
        icon: '📱',
        description: 'Exchange phone numbers',
        action: 'phone',
        url: '#' // Triggers phone exchange modal
      },
      {
        name: 'Continue on BITSPARK',
        icon: '✨',
        description: 'Upgrade to premium for unlimited messages',
        action: 'premium',
        premium: true,
        url: '/premium' // Premium upgrade page
      },
      {
        name: 'Meet in Person',
        icon: '☕',
        description: 'Plan to meet on campus',
        action: 'meetup',
        url: '#' // Triggers meetup planning modal
      }
    ]
  }

  // Get conversation statistics
  static async getConversationStats(connectionId: string) {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('sender_id, content, created_at')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true })

      if (!messages || messages.length === 0) {
        return {
          totalMessages: 0,
          averageLength: 0,
          responseTime: 0,
          qualityScore: 0
        }
      }

      const totalMessages = messages.length
      const averageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages
      
      // Calculate average response time
      let totalResponseTime = 0
      let responseCount = 0
      
      for (let i = 1; i < messages.length; i++) {
        if (messages[i].sender_id !== messages[i-1].sender_id) {
          const responseTime = new Date(messages[i].created_at).getTime() - 
                              new Date(messages[i-1].created_at).getTime()
          totalResponseTime += responseTime
          responseCount++
        }
      }
      
      const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0
      
      // Calculate overall quality score
      const qualityScores = messages.map(msg => this.calculateMessageQuality(msg.content))
      const averageQuality = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length

      return {
        totalMessages,
        averageLength: Math.round(averageLength),
        responseTime: Math.round(averageResponseTime / (1000 * 60)), // Convert to minutes
        qualityScore: Math.round(averageQuality * 100)
      }
    } catch (error) {
      console.error('Error getting conversation stats:', error)
      return {
        totalMessages: 0,
        averageLength: 0,
        responseTime: 0,
        qualityScore: 0
      }
    }
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
      const channel = supabase.channel(`typing:${connectionId}`)
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, typing: true }
      })
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }
  }

  static async stopTypingIndicator(connectionId: string, userId: string) {
    try {
      const channel = supabase.channel(`typing:${connectionId}`)
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, typing: false }
      })
    } catch (error) {
      console.error('Error stopping typing indicator:', error)
    }
  }
}