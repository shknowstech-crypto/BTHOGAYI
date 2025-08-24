'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Copy, Share2, Users, Mail } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { useAppStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'

export function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user } = useAppStore()

  const inviteLink = `${window.location.origin}?ref=invite`

  const handleSendInvites = async () => {
    setIsLoading(true)
    try {
      const emailList = emails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'))

      // Here you would implement the actual invite sending logic
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInvitesSent(emailList.length)
      setEmails('')
    } catch (error) {
      console.error('Failed to send invites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BITSPARK',
          text: 'Join me on BITSPARK - the exclusive social platform for BITS students!',
          url: inviteLink,
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      copyInviteLink()
    }
  }

  return (
    <AnimatePresence>
      {inviteModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setInviteModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Invite Friends</h2>
                </div>
                <button
                  onClick={() => setInviteModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {invitesSent > 0 ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Invites Sent! 🎉
                  </h3>
                  <p className="text-white/70 mb-6">
                    {invitesSent} invitation{invitesSent > 1 ? 's' : ''} sent successfully
                  </p>
                  <GradientButton
                    variant="secondary"
                    onClick={() => {
                      setInvitesSent(0)
                      setInviteModalOpen(false)
                    }}
                  >
                    Done
                  </GradientButton>
                </motion.div>
              ) : (
                /* Invite Form */
                <div className="space-y-6">
                  {/* Email Invites */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Invite by Email
                    </label>
                    <textarea
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      placeholder="Enter email addresses (one per line or comma separated)"
                      className="w-full h-24 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                    <p className="text-white/50 text-xs mt-1">
                      Invite your BITS friends to join BITSPARK
                    </p>
                  </div>

                  <GradientButton
                    size="lg"
                    variant="romantic"
                    onClick={handleSendInvites}
                    disabled={!emails.trim() || isLoading}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4" />
                    {isLoading ? 'Sending...' : 'Send Invites'}
                  </GradientButton>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/60">or</span>
                    </div>
                  </div>

                  {/* Share Link */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Share Invite Link
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white/70 text-sm truncate">
                        {inviteLink}
                      </div>
                      <button
                        onClick={copyInviteLink}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
                      >
                        <Copy className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={shareInviteLink}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}