'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { GradientButton } from './gradient-button'
import { X, AlertTriangle, Flag } from 'lucide-react'
import { ReportService } from '@/lib/reports'
import { Report } from '@/lib/supabase'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName: string
  reporterId: string
}

const reportTypes: { value: Report['report_type']; label: string; description: string }[] = [
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying, threats, or unwanted contact'
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive or irrelevant messages'
  },
  {
    value: 'fake_profile',
    label: 'Fake Profile',
    description: 'Using someone else\'s photos or information'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Sexual, violent, or offensive content'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that violates our guidelines'
  }
]

export function ReportModal({ 
  isOpen, 
  onClose, 
  reportedUserId, 
  reportedUserName, 
  reporterId 
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<Report['report_type'] | ''>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setSubmitting(true)
    try {
      const success = await ReportService.createReport(
        reporterId,
        reportedUserId,
        selectedType,
        description
      )

      if (success) {
        alert('Report submitted successfully. Our team will review it shortly.')
        onClose()
        setSelectedType('')
        setDescription('')
      } else {
        alert('Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Report User</h2>
                <p className="text-white/70 text-sm">Report {reportedUserName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                What's the issue?
              </label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedType === type.value
                        ? 'bg-red-500/20 border-red-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value as Report['report_type'])}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                        selectedType === type.value
                          ? 'border-red-400 bg-red-400'
                          : 'border-white/30'
                      }`} />
                      <div>
                        <p className="text-white font-medium text-sm">{type.label}</p>
                        <p className="text-white/60 text-xs mt-1">{type.description}</p>
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
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Important</p>
                  <p className="text-yellow-200 text-xs mt-1">
                    False reports may result in action against your account. Only report genuine violations.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                Cancel
              </button>
              <GradientButton
                type="submit"
                variant="secondary"
                className="flex-1"
                disabled={!selectedType || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </GradientButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}