'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { recommendationAPI } from '@/lib/recommendation-api'

export function ServerStatusIndicator() {
  const [status, setStatus] = useState({ available: true, usingFallback: false })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const currentStatus = recommendationAPI.getServerStatus()
      setStatus(currentStatus)
    }

    // Check immediately
    checkStatus()

    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (status.available) return 'text-green-400'
    if (status.usingFallback) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusIcon = () => {
    if (status.available) return <Wifi className="w-3 h-3" />
    if (status.usingFallback) return <AlertCircle className="w-3 h-3" />
    return <WifiOff className="w-3 h-3" />
  }

  const getStatusText = () => {
    if (status.available) return 'Server Algorithm'
    if (status.usingFallback) return 'Local Algorithm'
    return 'Offline'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <motion.button
          onClick={() => setShowDetails(!showDetails)}
          className={`flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium transition-colors ${getStatusColor()}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: status.available ? 0 : 360 }}
            transition={{ duration: 2, repeat: status.available ? 0 : Infinity }}
          >
            {getStatusIcon()}
          </motion.div>
          <span>{getStatusText()}</span>
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-2 p-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl text-xs text-white min-w-48"
            >
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Recommendation Engine</span>
              </div>
              
              <div className="space-y-1 text-white/70">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={getStatusColor()}>
                    {status.available ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Algorithm:</span>
                  <span>{status.usingFallback ? 'Local Fallback' : 'AI Server'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span className={status.available ? 'text-green-400' : 'text-yellow-400'}>
                    {status.available ? 'High' : 'Standard'}
                  </span>
                </div>
              </div>

              {status.usingFallback && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-yellow-400 text-xs">
                    Using local algorithm. Server recommendations will resume when available.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}