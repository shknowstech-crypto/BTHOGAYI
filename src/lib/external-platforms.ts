// External platform integration service
export class ExternalPlatformService {
  // WhatsApp integration
  static redirectToWhatsApp(phoneNumber?: string, message?: string) {
    const baseUrl = import.meta.env.VITE_WHATSAPP_REDIRECT_URL || 'https://wa.me'
    let url = baseUrl
    
    if (phoneNumber) {
      // Remove any non-numeric characters
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      url += `/${cleanNumber}`
    }
    
    if (message) {
      const encodedMessage = encodeURIComponent(message)
      url += `?text=${encodedMessage}`
    }
    
    window.open(url, '_blank')
  }

  // Instagram integration
  static redirectToInstagram(username?: string) {
    const baseUrl = import.meta.env.VITE_INSTAGRAM_REDIRECT_URL || 'https://instagram.com'
    let url = baseUrl
    
    if (username) {
      url += `/${username}`
    }
    
    window.open(url, '_blank')
  }

  // Telegram integration
  static redirectToTelegram(username?: string, message?: string) {
    const baseUrl = import.meta.env.VITE_TELEGRAM_REDIRECT_URL || 'https://t.me'
    let url = baseUrl
    
    if (username) {
      url += `/${username}`
      if (message) {
        url += `?text=${encodeURIComponent(message)}`
      }
    }
    
    window.open(url, '_blank')
  }

  // Generate platform sharing links
  static generateShareLinks(connectionData: {
    userNames: [string, string]
    platform: 'whatsapp' | 'instagram' | 'telegram'
    customMessage?: string
  }) {
    const { userNames, platform, customMessage } = connectionData
    const defaultMessage = `Hey! I found you through BITSPARK - the BITS student platform. Let's continue our conversation here! 🎓💕`
    const message = customMessage || defaultMessage

    switch (platform) {
      case 'whatsapp':
        return {
          url: `${import.meta.env.VITE_WHATSAPP_REDIRECT_URL || 'https://wa.me'}?text=${encodeURIComponent(message)}`,
          instructions: 'Share your WhatsApp number to continue chatting'
        }
      
      case 'instagram':
        return {
          url: `${import.meta.env.VITE_INSTAGRAM_REDIRECT_URL || 'https://instagram.com'}`,
          instructions: 'Share your Instagram handle to connect'
        }
      
      case 'telegram':
        return {
          url: `${import.meta.env.VITE_TELEGRAM_REDIRECT_URL || 'https://t.me'}?text=${encodeURIComponent(message)}`,
          instructions: 'Share your Telegram username to continue'
        }
      
      default:
        return {
          url: '#',
          instructions: 'Platform not supported'
        }
    }
  }

  // Create platform connection invitation
  static async createPlatformInvitation(connectionId: string, platform: string, customMessage?: string) {
    try {
      // Record the platform redirection in database
      const { data, error } = await supabase
        .from('platform_redirections')
        .insert({
          connection_id: connectionId,
          platform: platform,
          redirect_count: 1,
          last_redirect_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        redirectionId: data.id,
        message: customMessage || 'Platform invitation created successfully'
      }
    } catch (error) {
      console.error('Error creating platform invitation:', error)
      return {
        success: false,
        error: 'Failed to create platform invitation'
      }
    }
  }

  // Get platform redirection statistics
  static async getPlatformStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('platform_redirections')
        .select(`
          platform,
          redirect_count,
          connections!inner(user1_id, user2_id)
        `)
        .or(`connections.user1_id.eq.${userId},connections.user2_id.eq.${userId}`)

      if (error) throw error

      // Aggregate stats by platform
      const stats = data.reduce((acc: any, item: any) => {
        const platform = item.platform
        acc[platform] = (acc[platform] || 0) + item.redirect_count
        return acc
      }, {})

      return stats
    } catch (error) {
      console.error('Error getting platform stats:', error)
      return {}
    }
  }
}