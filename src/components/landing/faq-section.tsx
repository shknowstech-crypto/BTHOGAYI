'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const faqs = [
  {
    question: "Who can join BITSPARK?",
    answer: "Only verified BITS Pilani students from all campuses (Pilani, Goa, Hyderabad, Dubai) can join. You need a valid BITS email address and student ID for verification."
  },
  {
    question: "How does the AI matching work?",
    answer: "Our AI analyzes your interests, personality traits, and preferences to find compatible matches. You can choose +1 for similar personalities or -1 for opposite attractions."
  },
  {
    question: "What is the 5-message limit?",
    answer: "To encourage meaningful conversations, you get 5 messages per connection. After that, you'll be redirected to external platforms like WhatsApp or Instagram to continue chatting."
  },
  {
    question: "How does shipping work?",
    answer: "Friends can 'ship' you with other users they think you'd be compatible with. You can choose to accept or decline these suggestions, and shipping can be done anonymously."
  },
  {
    question: "Is my data safe?",
    answer: "Absolutely! We use end-to-end encryption for messages, secure data storage, and never share your personal information with third parties. Your privacy is our top priority."
  },
  {
    question: "Can I connect with students from other campuses?",
    answer: "Yes! BITSPARK connects students across all BITS campuses. You can find friends and dates from Pilani, Goa, Hyderabad, and Dubai."
  },
  {
    question: "How do I get verified?",
    answer: "Upload your student ID and a clear profile photo. Our team manually verifies each account to ensure authenticity and safety."
  },
  {
    question: "Is BITSPARK free?",
    answer: "Yes, BITSPARK is completely free for all BITS students. We may introduce premium features in the future, but core functionality will always be free."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to know about BITSPARK
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-white/70 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/70 flex-shrink-0" />
                  )}
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}