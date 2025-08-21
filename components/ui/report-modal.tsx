'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { LoadingSpinner } from './loading-spinner'
import { X, Flag, AlertTriangle } from 'lucide-react'
import { ReportService } from '@/lib/reports'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  reporterId: string
}

const reportTypes = [
  { value: 'harassment', label: 'Harassment or Bullying', description: 'Threatening, intimidating, or abusive behavior' },
  { value: 'spam', label: 'Spam or Fake Account', description: 'Fake profile, bot, or spam messages' },
  { value: 'fake_profile', label: 'Fake Profile', description: 'Using someone else\'s photos or false information' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Sexual, violent, or offensive content' },
  { value: 'other', label: 'Other', description: 'Something else that violates community guidelines' }
]

export function ReportModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  reporterId
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setSubmitting(true)
    try {
      const success = await ReportService.createReport(
        reporterId,
        reportedUserId,
        selectedType as any,
        description
      )

      if (success) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setSelectedType('')
          setDescription('')
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <GlassCard className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Flag className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
                <p className="text-white/70">
                  Thank you for helping keep our community safe. We'll review this report promptly.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Flag className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Report User</h2>
                      <p className="text-white/70 text-sm">Report {reportedUserName}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Report Type */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-3">
                      What's the issue?
                    </label>
                    <div className="space-y-2">
                      {reportTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedType === type.value
                              ? 'bg-red-500/20 border-red-400/50'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reportType"
                            value={type.value}
                            checked={selectedType === type.value}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              selectedType === type.value ? 'text-red-400' : 'text-white/50'
                            }`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white text-sm">
                                {type.label}
                              </h4>
                              <p className="text-white/60 text-xs mt-1">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more context about the issue..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  {/* Warning */}
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-300 text-sm mb-1">
                          Important
                        </h4>
                        <p className="text-yellow-200 text-xs">
                          False reports may result in action against your account. 
                          Only report genuine violations of our community guidelines.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <GradientButton
                      variant="secondary"
                      onClick={onClose}
                      className="flex-1"
                      disabled={submitting}
                    >
                      Cancel
                    </GradientButton>
                    <GradientButton
                      variant="danger"
                      type="submit"
                      className="flex-1"
                      disabled={!selectedType || submitting}
                    >
                      {submitting ? <LoadingSpinner size="sm" /> : <Flag className="w-4 h-4" />}
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </GradientButton>
                  </div>
                </form>
              </>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}