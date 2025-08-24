import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { ArrowLeft, MessageCircle, Send, Phone, Instagram, ExternalLink, Clock, Crown, Users, Heart } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Connection, Message } from '@/lib/supabase'
import { AuthGuard } from '@/components/auth/auth-guard'

interface ChatConnection extends Connection {
  other_user: {
    id: string
    display_name: string
    profile_photo?: string
    campus: string
    branch: string
  }
  message_count: number
  last_message?: Message
  is_message_limit_reached: boolean
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [connections, setConnections] = useState<ChatConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<ChatConnection | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPlatformRedirect, setShowPlatformRedirect] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    loadConnections()
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (selectedConnection) {
      loadMessages(selectedConnection.id)
      subscribeToMessages(selectedConnection.id)
    }
  }, [selectedConnection])

  const loadConnections = async () => {
    try {
      setLoading(true)
      
      // Get all accepted connections
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select(`
          *,
          other_user:users!connections_user2_id_fkey(
            id,
            display_name,
            profile_photo,
            campus,
            branch
          )
        `)
        .eq('user1_id', user?.id)
        .eq('status', 'accepted')
        .eq('connection_type', 'friend')

      if (error) throw error

      // Get connections where current user is user2
      const { data: connectionsData2, error: error2 } = await supabase
        .from('connections')
        .select(`
          *,
          other_user:users!connections_user1_id_fkey(
            id,
            display_name,
            profile_photo,
            campus,
            branch
          )
        `)
        .eq('user2_id', user?.id)
        .eq('status', 'accepted')
        .eq('connection_type', 'friend')

      if (error2) throw error2

      // Combine and process connections
      const allConnections = [...(connectionsData || []), ...(connectionsData2 || [])]
      
      // Get message counts for each connection
      const connectionsWithCounts = await Promise.all(
        allConnections.map(async (conn: any) => {
          const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`and(sender_id.eq.${conn.user1_id},receiver_id.eq.${conn.user2_id}),and(sender_id.eq.${conn.user2_id},receiver_id.eq.${conn.user1_id})`)

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${conn.user1_id},receiver_id.eq.${conn.user2_id}),and(sender_id.eq.${conn.user2_id},receiver_id.eq.${conn.user1_id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...conn,
            message_count: messageCount || 0,
            last_message: lastMessage,
            is_message_limit_reached: (messageCount || 0) >= 5
          }
        })
      )

      setConnections(connectionsWithCounts)
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId)
      if (!connection) return

      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${connection.user1_id},receiver_id.eq.${connection.user2_id}),and(sender_id.eq.${connection.user2_id},receiver_id.eq.${connection.user1_id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const subscribeToMessages = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId)
    if (!connection) return

    const subscription = supabase
      .channel(`messages:${connectionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${connection.user1_id},receiver_id.eq.${connection.user2_id}),and(sender_id.eq.${connection.user2_id},receiver_id.eq.${connection.user1_id}))`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const sendMessage = async () => {
    if (!selectedConnection || !newMessage.trim()) return

    const connection = connections.find(c => c.id === selectedConnection.id)
    if (!connection || connection.is_message_limit_reached) {
      setShowPlatformRedirect(true)
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
                  sender_id: user?.id,
        receiver_id: connection.other_user.id,
          content: newMessage.trim(),
          connection_id: connection.id,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setNewMessage('')
      
      // Update message count
      await loadConnections()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getOtherUser = (connection: ChatConnection) => {
    return connection.user1_id === user?.id ? connection.other_user : connection.other_user
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true} requireCompleteProfile={true}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <GradientButton
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </GradientButton>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Messages
              </h1>
              <p className="text-white/70">
                Connect with your matches and build meaningful conversations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span>{connections.length} Connections</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connections List */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Your Connections</h2>
              
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 mb-4">No connections yet</p>
                  <GradientButton
                    variant="romantic"
                    onClick={() => navigate('/connect')}
                  >
                    Start Connecting
                  </GradientButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => {
                    const otherUser = getOtherUser(connection)
                    return (
                      <motion.div
                        key={connection.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedConnection(connection)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedConnection?.id === connection.id
                            ? 'bg-white/20 border border-white/30'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            {otherUser.profile_photo ? (
                              <img
                                src={otherUser.profile_photo}
                                alt={otherUser.display_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {otherUser.display_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          
                                          <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {otherUser.display_name}
                  </h3>
                  <p className="text-white/60 text-sm truncate">
                    BITS {otherUser.campus} • {otherUser.branch}
                  </p>
                  {connection.last_message && (
                    <p className="text-white/50 text-xs truncate mt-1">
                      {(connection.last_message as any).content}
                    </p>
                  )}
                </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white/60 text-xs">
                                {connection.message_count}/5
                              </span>
                              {connection.is_message_limit_reached && (
                                <Crown className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                            {connection.last_message && (
                              <span className="text-white/40 text-xs">
                                {formatTime(connection.last_message.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConnection ? (
              <GlassCard className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      {selectedConnection.other_user.profile_photo ? (
                        <img
                          src={selectedConnection.other_user.profile_photo}
                          alt={selectedConnection.other_user.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {selectedConnection.other_user.display_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {selectedConnection.other_user.display_name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        BITS {selectedConnection.other_user.campus}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">
                      {selectedConnection.message_count}/5 messages
                    </span>
                    {selectedConnection.is_message_limit_reached && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Crown className="w-4 h-4" />
                        <span className="text-xs">Limit Reached</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/70">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${(message as any).sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            (message as any).sender_id === user?.id
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            (message as any).sender_id === user?.id ? 'text-white/70' : 'text-white/50'
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  {selectedConnection.is_message_limit_reached ? (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-yellow-400 mb-3">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">Message Limit Reached!</span>
                      </div>
                      <p className="text-white/70 text-sm mb-4">
                        You've reached the 5-message limit. Continue your conversation on other platforms!
                      </p>
                      <GradientButton
                        variant="romantic"
                        onClick={() => setShowPlatformRedirect(true)}
                      >
                        Continue Elsewhere
                      </GradientButton>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                        maxLength={500}
                      />
                      <GradientButton
                        variant="romantic"
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </GradientButton>
                    </div>
                  )}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-24 h-24 text-white/30 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Select a Connection
                  </h3>
                  <p className="text-white/70">
                    Choose a connection from the list to start chatting
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Platform Redirect Modal */}
        <AnimatePresence>
          {showPlatformRedirect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
              onClick={() => setShowPlatformRedirect(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 max-w-md w-full text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ExternalLink className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-4">
                  Continue Your Conversation! 💬
                </h2>
                <p className="text-white/90 mb-6">
                  You've reached the 5-message limit. Continue chatting on your preferred platform!
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => window.open('https://instagram.com', '_blank')}
                    className="w-full p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <Instagram className="w-5 h-5" />
                    Continue on Instagram
                  </button>
                  
                  <button
                    onClick={() => window.open('https://wa.me', '_blank')}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Continue on WhatsApp
                  </button>
                  
                  <button
                    onClick={() => setShowPlatformRedirect(false)}
                    className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-200"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </AuthGuard>
  )
}