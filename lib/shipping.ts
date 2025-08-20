import { supabase } from './supabase'
import { Ship, UserProfile } from './supabase'

export interface ShipWithUsers extends Ship {
  shipper: UserProfile
  user1: UserProfile
  user2: UserProfile
  otherUser: UserProfile // For received ships, this is the person you're shipped with
}

export interface ShipStats {
  sent: {
    total: number
    accepted: number
    pending: number
    declined: number
    successRate: number
  }
  received: {
    total: number
    accepted: number
    pending: number
    declined: number
    responseRate: number
  }
}

export class ShippingService {
  // Enhanced ship creation with validation
  static async createShip(
    shipperId: string,
    user1Email: string,
    user2Email: string,
    message: string = '',
    isAnonymous: boolean = false
  ): Promise<boolean> {
    try {
      // Validate BITS email format
      const bitsEmailRegex = /^[a-zA-Z0-9._%+-]+@pilani\.bits-pilani\.ac\.in$/
      if (!bitsEmailRegex.test(user1Email) || !bitsEmailRegex.test(user2Email)) {
        throw new Error('Please use valid BITS email addresses')
      }
      
      // Prevent self-shipping
      if (user1Email === user2Email) {
        throw new Error('Cannot ship a person with themselves')
      }
      
      // Get user IDs from emails
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, bits_email, display_name, is_active')
        .in('bits_email', [user1Email, user2Email])

      if (userError) throw userError
      if (!users || users.length !== 2) {
        throw new Error('One or both users not found')
      }

      const user1 = users.find(u => u.bits_email === user1Email)
      const user2 = users.find(u => u.bits_email === user2Email)

      if (!user1 || !user2) {
        throw new Error('Users not found')
      }

      // Check if users are active
      if (!user1.is_active || !user2.is_active) {
        throw new Error('One or both users are not active')
      }
      
      // Prevent shipping the shipper themselves
      if (user1.id === shipperId || user2.id === shipperId) {
        throw new Error('Cannot ship yourself')
      }

      // Check if users are already connected
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('status')
        .or(`and(user1_id.eq.${user1.id},user2_id.eq.${user2.id}),and(user1_id.eq.${user2.id},user2_id.eq.${user1.id})`)
        .single()
        
      if (existingConnection && existingConnection.status === 'accepted') {
        throw new Error('These users are already connected!')
      }

      // Check if ship already exists
      const existingShip = await this.getExistingShip(shipperId, user1.id, user2.id)
      if (existingShip) {
        throw new Error('You have already shipped these users')
      }

      // Create the ship
      const { data, error } = await supabase
        .from('ships')
        .insert({
          shipper_id: shipperId,
          user1_id: user1.id,
          user2_id: user2.id,
          message,
          is_anonymous: isAnonymous,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) throw error

      // Create notifications for both users
      await this.createShipNotifications(user1.id, user2.id, shipperId, isAnonymous, message)

      return true
    } catch (error) {
      console.error('Error creating ship:', error)
      throw error
    }
  }

  // Get ships received by a user
  static async getReceivedShips(userId: string): Promise<ShipWithUsers[]> {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select(`
          *,
          shipper:users!ships_shipper_id_fkey(*),
          user1:users!ships_user1_id_fkey(*),
          user2:users!ships_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(ship => ({
        ...ship,
        otherUser: ship.user1_id === userId ? ship.user2 : ship.user1
      }))
    } catch (error) {
      console.error('Error getting received ships:', error)
      return []
    }
  }

  // Get ships sent by a user
  static async getSentShips(userId: string): Promise<ShipWithUsers[]> {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select(`
          *,
          shipper:users!ships_shipper_id_fkey(*),
          user1:users!ships_user1_id_fkey(*),
          user2:users!ships_user2_id_fkey(*)
        `)
        .eq('shipper_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(ship => ({
        ...ship,
        otherUser: ship.user1 // For display purposes
      }))
    } catch (error) {
      console.error('Error getting sent ships:', error)
      return []
    }
  }

  // Enhanced ship response with connection creation
  static async respondToShip(shipId: string, action: 'accept' | 'decline'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ships')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', shipId)
        .select()
        .single()

      if (error) throw error

      // If accepted, create a connection between the two users
      if (action === 'accept') {
        const success = await this.createConnectionFromShip(data)
        if (!success) {
          throw new Error('Failed to create connection from ship')
        }
      }

      // Notify the shipper about the response
      await this.createResponseNotification(data.shipper_id, data.user1_id, data.user2_id, action)

      return true
    } catch (error) {
      console.error('Error responding to ship:', error)
      return false
    }
  }

  // Enhanced ship statistics
  static async getShipStats(userId: string): Promise<ShipStats> {
    try {
      const [sentShips, receivedShips] = await Promise.all([
        supabase
          .from('ships')
          .select('status')
          .eq('shipper_id', userId),
        supabase
          .from('ships')
          .select('status')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      ])

      const sent = sentShips.data || []
      const received = receivedShips.data || []

      const sentStats = {
        total: sent.length,
        accepted: sent.filter(s => s.status === 'accepted').length,
        pending: sent.filter(s => s.status === 'pending').length,
        declined: sent.filter(s => s.status === 'declined').length,
        successRate: sent.length > 0 ? (sent.filter(s => s.status === 'accepted').length / sent.length) * 100 : 0
      }
      
      const receivedStats = {
        total: received.length,
        accepted: received.filter(s => s.status === 'accepted').length,
        pending: received.filter(s => s.status === 'pending').length,
        declined: received.filter(s => s.status === 'declined').length,
        responseRate: received.length > 0 ? ((received.filter(s => s.status !== 'pending').length) / received.length) * 100 : 0
      }

      return {
        sent: sentStats,
        received: receivedStats
      }
    } catch (error) {
      console.error('Error getting ship stats:', error)
      return {
        sent: { total: 0, accepted: 0, pending: 0, declined: 0, successRate: 0 },
        received: { total: 0, accepted: 0, pending: 0, declined: 0, responseRate: 0 }
      }
    }
  }

  // Get trending ships (popular matchmakers)
  static async getTrendingShippers(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('ships')
        .select(`
          shipper_id,
          status,
          shipper:users!ships_shipper_id_fkey(display_name, username)
        `)
        .eq('status', 'accepted')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      if (error) throw error

      // Count successful ships per shipper
      const shipperCounts: Record<string, { count: number; shipper: any }> = {}
      
      data?.forEach(ship => {
        if (!shipperCounts[ship.shipper_id]) {
          shipperCounts[ship.shipper_id] = { count: 0, shipper: ship.shipper }
        }
        shipperCounts[ship.shipper_id].count++
      })

      return Object.values(shipperCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(({ count, shipper }) => ({
          shipper,
          successfulShips: count
        }))
    } catch (error) {
      console.error('Error getting trending shippers:', error)
      return []
    }
  }

  // Expire old ships
  static async expireOldShips(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('ships')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .select('id')

      if (error) throw error
      return data?.length || 0
    } catch (error) {
      console.error('Error expiring old ships:', error)
      return 0
    }
  }

  // Private helper methods
  private static async getExistingShip(shipperId: string, user1Id: string, user2Id: string) {
    try {
      const { data } = await supabase
        .from('ships')
        .select('id')
        .eq('shipper_id', shipperId)
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
        .neq('status', 'expired')
        .single()

      return data
    } catch (error) {
      return null
    }
  }

  private static async createShipNotifications(
    user1Id: string,
    user2Id: string,
    shipperId: string,
    isAnonymous: boolean,
    message: string
  ) {
    try {
      const { data: shipper } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', shipperId)
        .single()

      const shipperName = isAnonymous ? 'Someone' : shipper?.display_name || 'Someone'
      const messagePreview = message ? ` with message: "${message.substring(0, 50)}..."` : ''

      // Notify both users
      await Promise.all([
        supabase
          .from('notifications')
          .insert({
            user_id: user1Id,
            type: 'ship',
            title: 'You\'ve been shipped!',
            message: `${shipperName} thinks you'd be perfect with someone${messagePreview}`,
            data: {
              shipper_id: shipperId,
              is_anonymous: isAnonymous,
              message: message
            }
          }),
        supabase
          .from('notifications')
          .insert({
            user_id: user2Id,
            type: 'ship',
            title: 'You\'ve been shipped!',
            message: `${shipperName} thinks you'd be perfect with someone${messagePreview}`,
            data: {
              shipper_id: shipperId,
              is_anonymous: isAnonymous,
              message: message
            }
          })
      ])
    } catch (error) {
      console.error('Error creating ship notifications:', error)
    }
  }

  private static async createConnectionFromShip(ship: Ship): Promise<boolean> {
    try {
      // Import ConnectionService to avoid circular dependency
      const { ConnectionService } = await import('./connections')
      
      const connection = await ConnectionService.createConnection(
        ship.user1_id,
        ship.user2_id,
        'friend', // Ships create friend connections by default
        0.85 // High compatibility score for accepted ships
      )
      
      return !!connection
    } catch (error) {
      console.error('Error creating connection from ship:', error)
      return false
    }
  }

  private static async createResponseNotification(
    shipperId: string,
    user1Id: string,
    user2Id: string,
    action: 'accept' | 'decline'
  ) {
    try {
      const emoji = action === 'accept' ? '🎉' : '😔'
      const actionText = action === 'accept' ? 'accepted' : 'declined'
      const { data: users } = await supabase
        .from('users')
        .select('display_name')
        .in('id', [user1Id, user2Id])

      const userNames = users?.map(u => u.display_name).join(' and ') || 'Your ship'

      await supabase
        .from('notifications')
        .insert({
          user_id: shipperId,
          type: 'ship',
          title: `Ship ${actionText}! ${emoji}`,
          message: `${userNames} ${actionText} your ship${action === 'accept' ? ' and are now connected!' : '.'}`,
          data: {
            action,
            user1_id: user1Id,
            user2_id: user2Id
          }
        })
    } catch (error) {
      console.error('Error creating response notification:', error)
    }
  }
}