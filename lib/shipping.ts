import { supabase } from './supabase'
import { Ship, UserProfile } from './supabase'

export interface ShipWithUsers extends Ship {
  shipper: UserProfile
  user1: UserProfile
  user2: UserProfile
  otherUser: UserProfile // For received ships, this is the person you're shipped with
}

export class ShippingService {
  // Create a new ship
  static async createShip(
    shipperId: string,
    user1Email: string,
    user2Email: string,
    message: string = '',
    isAnonymous: boolean = false
  ): Promise<boolean> {
    try {
      // Get user IDs from emails
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, bits_email')
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
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Create notifications for both users
      await this.createShipNotifications(user1.id, user2.id, shipperId, isAnonymous)

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
        otherUser: ship.user1 // For sent ships, we don't need otherUser logic
      }))
    } catch (error) {
      console.error('Error getting sent ships:', error)
      return []
    }
  }

  // Respond to a ship (accept/decline)
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
        await this.createConnectionFromShip(data)
      }

      // Notify the shipper about the response
      await this.createResponseNotification(data.shipper_id, data.user1_id, data.user2_id, action)

      return true
    } catch (error) {
      console.error('Error responding to ship:', error)
      return false
    }
  }

  // Get ship statistics for a user
  static async getShipStats(userId: string) {
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

      return {
        sent: {
          total: sent.length,
          accepted: sent.filter(s => s.status === 'accepted').length,
          pending: sent.filter(s => s.status === 'pending').length,
          declined: sent.filter(s => s.status === 'declined').length
        },
        received: {
          total: received.length,
          accepted: received.filter(s => s.status === 'accepted').length,
          pending: received.filter(s => s.status === 'pending').length,
          declined: received.filter(s => s.status === 'declined').length
        }
      }
    } catch (error) {
      console.error('Error getting ship stats:', error)
      return {
        sent: { total: 0, accepted: 0, pending: 0, declined: 0 },
        received: { total: 0, accepted: 0, pending: 0, declined: 0 }
      }
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
    isAnonymous: boolean
  ) {
    try {
      const { data: shipper } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', shipperId)
        .single()

      const shipperName = isAnonymous ? 'Someone' : shipper?.display_name || 'Someone'

      // Notify both users
      await Promise.all([
        supabase
          .from('notifications')
          .insert({
            user_id: user1Id,
            type: 'ship',
            title: 'You\'ve been shipped!',
            message: `${shipperName} thinks you'd be perfect with someone`,
            data: {
              shipper_id: shipperId,
              is_anonymous: isAnonymous
            }
          }),
        supabase
          .from('notifications')
          .insert({
            user_id: user2Id,
            type: 'ship',
            title: 'You\'ve been shipped!',
            message: `${shipperName} thinks you'd be perfect with someone`,
            data: {
              shipper_id: shipperId,
              is_anonymous: isAnonymous
            }
          })
      ])
    } catch (error) {
      console.error('Error creating ship notifications:', error)
    }
  }

  private static async createConnectionFromShip(ship: Ship) {
    try {
      // Import ConnectionService to avoid circular dependency
      const { ConnectionService } = await import('./connections')
      
      await ConnectionService.createConnection(
        ship.user1_id,
        ship.user2_id,
        'friend', // Ships create friend connections by default
        0.8 // High compatibility score for accepted ships
      )
    } catch (error) {
      console.error('Error creating connection from ship:', error)
    }
  }

  private static async createResponseNotification(
    shipperId: string,
    user1Id: string,
    user2Id: string,
    action: 'accept' | 'decline'
  ) {
    try {
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
          title: `Ship ${action}ed!`,
          message: `${userNames} ${action}ed your ship`,
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