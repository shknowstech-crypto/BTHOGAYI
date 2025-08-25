'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, ExternalLink, Clock, Crown, Image as ImageIcon } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { useRealtime } from '@/lib/realtime'
import { useAuthStore } from '@/lib/store'
import { supabase, Message, Connection } from '@/lib/supabase'
import { StorageService } from '@/lib/storage'

interface RealTimeChatProps {
  connection: Connection & {
    other_user: {
      id: string
      display_name: string
      profile_photo?: string
      campus: string
      is_online?: boolean
    }
  }
  onMessageLimitReached?: () => void
}

export function RealTimeChat({ connection, onMessageLimitReached }: RealTimeChatProps) {
  const { user } = useAuthStore()
  const { subscribeToMessages, subscribeToTyping, sendTypingIndicator } = useRealtime()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [messageCount, setMessageCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [showPlatformRedirect, setShowPlatformRedirect] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isMessageLimitReached = messageCount >= 5

  useEffect(() => {
    loadMessages()
    
    // Subscribe to real-time messages
    const unsubscribeMessages = subscribeToMessages(connection.id, (message) => {
      setMessages(prev => [...prev, message])
      setMessageCount(prev => prev + 1)
      scrollToBottom()
    })

    // Subscribe to typing indicators
    const unsubscribeTyping = subscribeToTyping(connection.id, setTypingUsers)

    return () => {
      unsubscribeMessages()
      unsubscribeTyping()
    }
  }, [connection.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connection.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      setMessageCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || isMessageLimitReached) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          connection_id: connection.id,
          sender_id: user.id,
          receiver_id: connection.other_user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) {
        if (error.message.includes('Message limit')) {
          setShowPlatformRedirect(true)
          onMessageLimitReached?.()
          return
        }
        throw error
      }

      setNewMessage('')
      stopTyping()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendTypingIndicator(connection.id, true)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 2000)
  }

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      sendTypingIndicator(connection.id, false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!user?.id || isMessageLimitReached) return

    try {
      const attachmentUrl = await StorageService.uploadMessageAttachment(
        user.id, 
        connection.id, 
        file
      )

      // Send message with attachment
      await supabase
        .from('messages')
        .insert({
          connection_id: connection.id,
          sender_id: user.id,
          receiver_id: connection.other_user.id,
          content: file.type.startsWith('image/') ? '📷 Image' : '📎 File',
          message_type: file.type.startsWith('image/') ? 'image' : 'file',
          metadata: { attachment_url: attachmentUrl, file_name: file.name }
        })

      setShowAttachmentMenu(false)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const redirectToPlatform = async (platform: 'whatsapp' | 'instagram' | 'telegram') => {
    try {
      // Record platform redirection
      await supabase
        .from('platform_redirections')
        .insert({
          connection_id: connection.id,
          platform: platform
        })

      // Open platform
      const urls = {
        whatsapp: import.meta.env.VITE_WHATSAPP_REDIRECT_URL || 'https://wa.me',
        instagram: import.meta.env.VITE_INSTAGRAM_REDIRECT_URL || 'https://instagram.com',
        telegram: import.meta.env.VITE_TELEGRAM_REDIRECT_URL || 'https://t.me'
      }

      window.open(urls[platform], '_blank')
      setShowPlatformRedirect(false)
    } catch (error) {
      console.error('Error recording platform redirection:', error)
    }
  }

  if (isLoading) {
    return (
      <GlassCard className="h-[500px] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full"
        />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="h-[500px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              {connection.other_user.profile_photo ? (
                <img
                  src={connection.other_user.profile_photo}
                  alt={connection.other_user.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {connection.other_user.display_name.charAt(0)}
                </span>
              )}
            </div>
            {connection.other_user.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="text-white font-medium">
              {connection.other_user.display_name}
            </h3>
            <p className="text-white/60 text-sm">
              {connection.other_user.is_online ? 'Online' : 'BITS ' + connection.other_user.campus}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isMessageLimitReached 
              ? 'bg-red-500/20 text-red-400' 
              : messageCount >= 3 
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            {messageCount}/5 messages
          </div>
          {isMessageLimitReached && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Start the conversation!</h3>
            <p className="text-white/60 text-sm">
              You have 5 messages to make a great first impression
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white'
                }`}
              >
                {message.message_type === 'image' && (message as any).metadata?.attachment_url ? (
                  <div className="mb-2">
                    <img 
                      src={(message as any).metadata.attachment_url} 
                      alt="Attachment"
                      className="max-w-full rounded-lg"
                    />
                  </div>
                ) : null}
                
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${
                    message.sender_id === user?.id ? 'text-white/70' : 'text-white/50'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                  {message.sender_id === user?.id && (
                    <div className="text-xs text-white/70">
                      {message.is_read ? '✓✓' : '✓'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Typing Indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 px-4 py-2 rounded-2xl">
                <div className="flex items-center gap-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white/60 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-xs ml-2">typing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        {isMessageLimitReached ? (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-3">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Message Limit Reached!</span>
            </div>
            <p className="text-white/70 text-sm mb-4">
              You've used all 5 messages. Continue your conversation on other platforms!
            </p>
            <div className="flex gap-2">
              <GradientButton
                variant="secondary"
                onClick={() => redirectToPlatform('whatsapp')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                WhatsApp
              </GradientButton>
              <GradientButton
                variant="romantic"
                onClick={() => redirectToPlatform('instagram')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Instagram
              </GradientButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Message Limit Warning */}
            {messageCount >= 3 && (
              <div className="text-center py-2">
                <p className="text-yellow-400 text-sm">
                  ⚠️ {5 - messageCount} messages remaining. Make them count!
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {/* Attachment Button */}
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-white" />
                </button>

                {/* Attachment Menu */}
                <AnimatePresence>
                  {showAttachmentMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 min-w-32"
                    >
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="block w-full px-3 py-2 text-white/80 hover:bg-white/10 rounded-lg text-sm text-left"
                      >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Photo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={stopTyping}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                maxLength={500}
                disabled={isMessageLimitReached}
              />

              {/* Send Button */}
              <GradientButton
                variant="romantic"
                onClick={sendMessage}
                disabled={!newMessage.trim() || isMessageLimitReached}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </GradientButton>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileUpload(file)
        }}
        className="hidden"
      />

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
                  onClick={() => redirectToPlatform('whatsapp')}
                  className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <span>💬</span>
                  Continue on WhatsApp
                </button>
                
                <button
                  onClick={() => redirectToPlatform('instagram')}
                  className="w-full p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <span>📷</span>
                  Continue on Instagram
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
    </GlassCard>
  )
}