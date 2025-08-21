'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MessageCircle, Send, Clock, ExternalLink, Heart } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { ConnectionService, ConnectionWithUser } from '@/lib/connections'
import { BottomNav } from '@/components/navigation/bottom-nav'
import { MessageLimitIndicator } from '@/components/ui/message-limit-indicator'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { MessagingService, MessageLimitInfo } from '@/lib/messaging'
import { Message } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [connections, setConnections] = useState<ConnectionWithUser[]>([])
  const [selectedConnection, setSelectedConnection] = useState<ConnectionWithUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [messageLimit, setMessageLimit] = useState<MessageLimitInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')

  useEffect(() => {
    if (user) {
      loadConnections()
    }
  }, [user])

  useEffect(() => {
    if (selectedConnection && user) {
      loadMessages()
      loadMessageLimit()
    }
  }, [selectedConnection, user])

  const loadConnections = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userConnections = await ConnectionService.getUserConnections(user.id)
      const acceptedConnections = userConnections.filter(c => c.status === 'accepted')
      setConnections(acceptedConnections)
      
      if (acceptedConnections.length > 0 && !selectedConnection) {
        setSelectedConnection(acceptedConnections[0])
      }
    } catch (error) {
      console.error('Error loading connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedConnection || !user) return
    
    try {
      const connectionMessages = await MessagingService.getMessages(selectedConnection.id, user.id)
      setMessages(connectionMessages)
      
      // Mark messages as read
      await MessagingService.markAsRead(selectedConnection.id, user.id)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadMessageLimit = async () => {
    if (!selectedConnection || !user) return
    
    try {
      const limit = await MessagingService.getMessageCount(selectedConnection.id, user.id)
      setMessageLimit(limit)
    } catch (error) {
      console.error('Error loading message limit:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConnection || !user || !newMessage.trim() || sending) return
    
    setSending(true)
    try {
      const result = await MessagingService.sendMessage(
        selectedConnection.id,
        user.id,
        selectedConnection.otherUser.id,
        newMessage.trim()
      )
      
      if (result.success) {
        setNewMessage('')
        await loadMessages()
        await loadMessageLimit()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const getPlatformOptions = () => MessagingService.getPlatformOptions()

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <MessageCircle className="w-10 h-10 text-purple-400" />
            MESSAGES
          </h1>
          <p className="text-xl text-white/70">
            Your conversations with connections
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Connections List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-6 h-[600px] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Your Connections</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner className="mx-auto mb-4" />
                  <p className="text-white/70">Loading connections...</p>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No connections yet</p>
                  <GradientButton 
                    className="mt-4"
                    onClick={() => router.push('/connect')}
                  >
                    Find Connections
                  </GradientButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <motion.button
                      key={connection.id}
                      onClick={() => setSelectedConnection(connection)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedConnection?.id === connection.id
                          ? 'bg-purple-500/30 border border-purple-400'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          {connection.otherUser.profile_photo ? (
                            <img 
                              src={connection.otherUser.profile_photo} 
                              alt={connection.otherUser.display_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {connection.otherUser.display_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">
                            {connection.otherUser.display_name}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {connection.connection_type === 'friend' ? 'Friend' : 'Date'} • 
                            {Math.round(connection.compatibility_score * 100)}% match
                          </p>
                        </div>
                        {connection.connection_type === 'date' && (
                          <Heart className="w-4 h-4 text-pink-400" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            {selectedConnection ? (
              <GlassCard className="p-6 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      {selectedConnection.otherUser.profile_photo ? (
                        <img 
                          src={selectedConnection.otherUser.profile_photo} 
                          alt={selectedConnection.otherUser.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold">
                          {selectedConnection.otherUser.display_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedConnection.otherUser.display_name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {selectedConnection.otherUser.branch} • BITS {selectedConnection.otherUser.campus}
                      </p>
                    </div>
                  </div>
                  
                  {messageLimit && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {messageLimit.remainingMessages} messages left
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">Start your conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender_id === user.id
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white'
                        }`}>
                          <p>{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                            {message.sender_id === user.id && (
                              <span className="text-xs opacity-70">
                                #{message.message_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Message Input or Platform Options */}
                <div className="space-y-4">
                  {/* Message Limit Indicator */}
                  {messageLimit && (
                    <MessageLimitIndicator
                      currentCount={messageLimit.currentCount}
                      maxCount={5}
                      onPlatformSelect={(platform) => {
                        if (platform === 'phone') {
                          alert('Phone number exchange feature - Replace with actual modal')
                        } else {
                          const platformUrls: Record<string, string> = {
                            instagram: 'https://instagram.com/direct/new/',
                            whatsapp: 'https://wa.me/',
                            discord: 'https://discord.gg/bitspark'
                          }
                          if (platformUrls[platform]) {
                            window.open(platformUrls[platform], '_blank')
                          }
                        }
                      }}
                    />
                  )}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <TypingIndicator userName={typingUser} />
                  )}
                  
                  {/* Message Input */}
                  {!messageLimit?.limitReached && (
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={sending}
                    />
                    <GradientButton
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6"
                    >
                      {sending ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
                    </GradientButton>
                  </form>
                  )}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center h-[600px] flex items-center justify-center">
                <div>
                  <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Select a Connection</h3>
                  <p className="text-white/70">
                    Choose a connection from the left to start messaging
                  </p>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}