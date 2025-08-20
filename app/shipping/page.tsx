'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Ship, Heart, Users, Send, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { ShippingService, ShipWithUsers } from '@/lib/shipping'
import { useRouter } from 'next/navigation'

export default function ShippingPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [ships, setShips] = useState<ShipWithUsers[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'create'>('received')
  const [createShipData, setCreateShipData] = useState({
    user1Email: '',
    user2Email: '',
    message: '',
    isAnonymous: false
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) {
      loadShips()
    }
  }, [user, activeTab])

  const loadShips = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let shipsData: ShipWithUsers[] = []
      
      if (activeTab === 'received') {
        shipsData = await ShippingService.getReceivedShips(user.id)
      } else if (activeTab === 'sent') {
        shipsData = await ShippingService.getSentShips(user.id)
      }
      
      setShips(shipsData)
    } catch (error) {
      console.error('Error loading ships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShip = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setCreating(true)
    try {
      const success = await ShippingService.createShip(
        user.id,
        createShipData.user1Email,
        createShipData.user2Email,
        createShipData.message,
        createShipData.isAnonymous
      )
      
      if (success) {
        setCreateShipData({
          user1Email: '',
          user2Email: '',
          message: '',
          isAnonymous: false
        })
        setActiveTab('sent')
      }
    } catch (error) {
      console.error('Error creating ship:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleRespondToShip = async (shipId: string, action: 'accept' | 'decline') => {
    try {
      await ShippingService.respondToShip(shipId, action)
      loadShips()
    } catch (error) {
      console.error('Error responding to ship:', error)
    }
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Ship className="w-10 h-10 text-purple-400" />
            SHIPPING
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Let friends play cupid! Ship your friends with each other and see the magic happen.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-2">
            <div className="flex gap-2">
              {[
                { key: 'received', label: 'Ships for You', icon: Heart },
                { key: 'sent', label: 'Your Ships', icon: Send },
                { key: 'create', label: 'Create Ship', icon: Ship }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-purple-500 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'create' ? (
            <GlassCard className="max-w-2xl mx-auto p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Ship Two Friends Together
              </h2>
              
              <form onSubmit={handleCreateShip} className="space-y-6">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Person's BITS Email
                  </label>
                  <input
                    type="email"
                    value={createShipData.user1Email}
                    onChange={(e) => setCreateShipData({ ...createShipData, user1Email: e.target.value })}
                    placeholder="friend1@pilani.bits-pilani.ac.in"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Second Person's BITS Email
                  </label>
                  <input
                    type="email"
                    value={createShipData.user2Email}
                    onChange={(e) => setCreateShipData({ ...createShipData, user2Email: e.target.value })}
                    placeholder="friend2@pilani.bits-pilani.ac.in"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={createShipData.message}
                    onChange={(e) => setCreateShipData({ ...createShipData, message: e.target.value })}
                    placeholder="Why do you think they'd be perfect together?"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateShipData({ ...createShipData, isAnonymous: !createShipData.isAnonymous })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      createShipData.isAnonymous
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {createShipData.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {createShipData.isAnonymous ? 'Anonymous Ship' : 'Reveal Identity'}
                  </button>
                </div>

                <GradientButton
                  type="submit"
                  size="lg"
                  variant="romantic"
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? <LoadingSpinner size="sm" /> : <Ship className="w-5 h-5" />}
                  {creating ? 'Creating Ship...' : 'Send Ship'}
                </GradientButton>
              </form>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {loading ? (
                <GlassCard className="p-12 text-center">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <p className="text-white/70">Loading ships...</p>
                </GlassCard>
              ) : ships.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <Ship className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {activeTab === 'received' ? 'No Ships Yet' : 'No Ships Sent'}
                  </h3>
                  <p className="text-white/70">
                    {activeTab === 'received' 
                      ? "No one has shipped you yet. Maybe it's time to make some connections!"
                      : "You haven't shipped anyone yet. Help your friends find love!"
                    }
                  </p>
                </GlassCard>
              ) : (
                ships.map((ship) => (
                  <motion.div
                    key={ship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Ship className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {activeTab === 'received' ? 'Someone shipped you!' : 'Your Ship'}
                              </h3>
                              <p className="text-white/60 text-sm">
                                {ship.is_anonymous ? 'Anonymous cupid' : `From ${ship.shipper.display_name}`}
                              </p>
                            </div>
                          </div>

                          {activeTab === 'received' ? (
                            <div className="mb-4">
                              <p className="text-white/80 mb-2">
                                You've been shipped with <span className="font-semibold text-white">{ship.otherUser.display_name}</span>
                              </p>
                              <div className="flex items-center gap-2 text-white/60 text-sm">
                                <Users className="w-4 h-4" />
                                <span>{ship.otherUser.branch} • Year {ship.otherUser.year} • BITS {ship.otherUser.campus}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4">
                              <p className="text-white/80 mb-2">
                                You shipped <span className="font-semibold text-white">{ship.user1.display_name}</span> with <span className="font-semibold text-white">{ship.user2.display_name}</span>
                              </p>
                            </div>
                          )}

                          {ship.message && (
                            <div className="bg-white/5 rounded-xl p-4 mb-4">
                              <p className="text-white/80 italic">"{ship.message}"</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              ship.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              ship.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {ship.status.charAt(0).toUpperCase() + ship.status.slice(1)}
                            </span>
                            
                            <span className="text-white/50 text-sm">
                              {new Date(ship.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {activeTab === 'received' && ship.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <GradientButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRespondToShip(ship.id, 'decline')}
                            >
                              Decline
                            </GradientButton>
                            <GradientButton
                              size="sm"
                              variant="romantic"
                              onClick={() => handleRespondToShip(ship.id, 'accept')}
                            >
                              <Heart className="w-4 h-4" />
                              Accept
                            </GradientButton>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}