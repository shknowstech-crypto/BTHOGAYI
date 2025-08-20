import { supabase } from './supabase'
import { Connection, UserProfile } from './supabase'

export interface ConnectionWithUser extends Connection {
  user1: UserProfile
  user2: UserProfile
  otherUser: UserProfile
}

export class ConnectionService {
  // Create a new connection request
  static async createConnection(
    user1Id: string,
    user2Id: string,
    connectionType: 'friend' | 'date',
    compatibilityScore: number
  ): Promise<Connection | null> {
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          connection_type: connectionType,
          compatibility_score: compatibilityScore,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for the other user
      await this.createConnectionNotification(user2Id, user1Id, connectionType)

      return data
    } catch (error) {
      console.error('Error creating connection:', error)
      return null
    }
  }

  // Get user's connections
  static async getUserConnections(userId: string): Promise<ConnectionWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          user1:users!connections_user1_id_fkey(*),
          user2:users!connections_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(connection => ({
        ...connection,
        otherUser: connection.user1_id === userId ? connection.user2 : connection.user1
      }))
    } catch (error) {
      console.error('Error getting connections:', error)
      return []
    }
  }

  // Accept a connection request
  static async acceptConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) throw error

      // Create notification for the requester
      const { data: connection } = await supabase
        .from('connections')
        .select('user1_id, user2_id')
        .eq('id', connectionId)
        .single()

      if (connection) {
        await this.createAcceptedNotification(connection.user1_id, connection.user2_id)
      }

      return true
    } catch (error) {
      console.error('Error accepting connection:', error)
      return false
    }
  }

  // Decline a connection request
  static async declineConnection(connectionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error declining connection:', error)
      return false
    }
  }

  // Block a user
  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      // Update existing connection to blocked
      const { error: updateError } = await supabase
        .from('connections')
        .update({ status: 'blocked' })
        .or(`and(user1_id.eq.${userId},user2_id.eq.${blockedUserId}),and(user1_id.eq.${blockedUserId},user2_id.eq.${userId})`)

      if (updateError) throw updateError

      // If no existing connection, create a blocked one
      const { error: insertError } = await supabase
        .from('connections')
        .upsert({
          user1_id: userId,
          user2_id: blockedUserId,
          connection_type: 'friend',
          status: 'blocked'
        })

      if (insertError) throw insertError
      return true
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  }

  // Get pending connection requests for a user
  static async getPendingRequests(userId: string): Promise<ConnectionWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          user1:users!connections_user1_id_fkey(*),
          user2:users!connections_user2_id_fkey(*)
        `)
        .eq('user2_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(connection => ({
        ...connection,
        otherUser: connection.user1
      }))
    } catch (error) {
      console.error('Error getting pending requests:', error)
      return []
    }
  }

  // Check if users are connected
  static async areUsersConnected(user1Id: string, user2Id: string): Promise<Connection | null> {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .single()

      if (error) return null
      return data
    } catch (error) {
      return null
    }
  }

  // Get connection statistics
  static async getConnectionStats(userId: string) {
    try {
      const { data: connections } = await supabase
        .from('connections')
        .select('status, connection_type')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)

      const stats = {
        total: connections?.length || 0,
        accepted: connections?.filter(c => c.status === 'accepted').length || 0,
        pending: connections?.filter(c => c.status === 'pending').length || 0,
        friends: connections?.filter(c => c.connection_type === 'friend' && c.status === 'accepted').length || 0,
        dates: connections?.filter(c => c.connection_type === 'date' && c.status === 'accepted').length || 0
      }

      return stats
    } catch (error) {
      console.error('Error getting connection stats:', error)
      return { total: 0, accepted: 0, pending: 0, friends: 0, dates: 0 }
    }
  }

  // Private helper methods
  private static async createConnectionNotification(
    receiverId: string,
    senderId: string,
    connectionType: 'friend' | 'date'
  ) {
    try {
      const { data: sender } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', senderId)
        .single()

      const typeText = connectionType === 'friend' ? 'friend request' : 'date request'

      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'connection_request',
          title: `New ${typeText}`,
          message: `${sender?.display_name || 'Someone'} wants to connect with you`,
          data: {
            sender_id: senderId,
            connection_type: connectionType
          }
        })
    } catch (error) {
      console.error('Error creating connection notification:', error)
    }
  }

  private static async createAcceptedNotification(
    receiverId: string,
    accepterId: string
  ) {
    try {
      const { data: accepter } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', accepterId)
        .single()

      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'match',
          title: 'Connection Accepted!',
          message: `${accepter?.display_name || 'Someone'} accepted your connection request`,
          data: {
            accepter_id: accepterId
          }
        })
    } catch (error) {
      console.error('Error creating accepted notification:', error)
    }
  }
}