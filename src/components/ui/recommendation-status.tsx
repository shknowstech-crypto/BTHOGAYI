import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, Wifi, WifiOff, Shield } from 'lucide-react'

interface RecommendationStatusProps {
  isLocalFallback?: boolean
  apiUrl?: string
}

export function RecommendationStatus({ isLocalFallback = true, apiUrl }: RecommendationStatusProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the status for 3 seconds when component mounts
    setIsVisible(true)
    const timer = setTimeout(() => setIsVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [isLocalFallback])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: isVisible ? 1 : 0.7, x: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div 
        className={`px-4 py-2 rounded-xl backdrop-blur-xl border text-sm font-medium flex items-center gap-2 cursor-pointer ${
          isLocalFallback 
            ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' 
            : 'bg-green-500/10 border-green-500/30 text-green-300'
        }`}
        onClick={() => setIsVisible(!isVisible)}
      >
        {isLocalFallback ? (
          <>
            <Database className="w-4 h-4" />
            <span>Local Recommendations</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>API Recommendations</span>
          </>
        )}
      </div>
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-black/80 backdrop-blur-xl rounded-lg border border-white/10 text-xs text-white/70"
        >
          {isLocalFallback ? (
            <div>
              <div className="text-orange-300 font-medium mb-1">Using Local Engine</div>
              <div>Recommendations are generated locally for better performance and privacy.</div>
            </div>
          ) : (
            <div>
              <div className="text-green-300 font-medium mb-1">Using Remote API</div>
              <div>Connected to recommendation engine at: {apiUrl}</div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
