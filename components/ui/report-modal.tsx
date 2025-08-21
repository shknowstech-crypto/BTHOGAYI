'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { X, AlertTriangle, Flag } from 'lucide-react'
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
  { value: 'other', label: 'Other', description: 'Something else that violates our guidelines' }
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

  const handleClose = () => {
    onClose()
    setSelectedType('')
    setDescription('')
    setSubmitted(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6">
              {submitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flag className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
                  <p className="text-white/70">
                    Thank you for helping keep BITSPARK safe. We'll review this report within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                      <h2 className="text-xl font-bold text-white">Report User</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <p className="text-white/70 mb-6">
                    Report <span className="font-semibold text-white">{reportedUserName}</span> for violating community guidelines.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Report Type Selection */}
                    <div>
                      <label className="block text-white font-medium mb-3">
                        What's the issue?
                      </label>
                      <div className="space-y-2">
                        {reportTypes.map((type) => (
                          <label
                            key={type.value}
                            className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedType === type.value
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
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
                              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                                selectedType === type.value
                                  ? 'border-red-500 bg-red-500'
                                  : 'border-white/40'
                              }`} />
                              <div>
                                <h3 className="font-semibold text-white text-sm">
                                  {type.label}
                                </h3>
                                <p className="text-white/60 text-xs mt-1">
                                  {type.description}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide more context about this report..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <GradientButton
                        variant="secondary"
                        className="flex-1"
                        onClick={handleClose}
                        type="button"
                      >
                        Cancel
                      </GradientButton>
                      <GradientButton
                        variant="danger"
                        className="flex-1"
                        type="submit"
                        disabled={!selectedType || submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                      </GradientButton>
                    </div>
                  </form>
                </>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}