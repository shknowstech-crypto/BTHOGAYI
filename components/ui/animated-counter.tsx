'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  duration?: number
}

export function AnimatedCounter({ value, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const animation = animate(count, value, { duration })
    return animation.stop
  }, [count, value, duration])

  return (
    <motion.span>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  )
}