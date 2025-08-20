'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: "How does the AI matching algorithm work?",
    answer: "Our AI analyzes your interests, personality traits, academic background, and preferences to find compatible matches. You can choose +1 for similar personalities or -1 for opposites attract matching. The algorithm considers compatibility scores, response rates, and mutual interests to suggest the best connections."
  },
  {
    question: "What happens after the 5-message limit?",
    answer: "After 5 meaningful messages, you can choose to continue the conversation on external platforms like Instagram, WhatsApp, Discord, or phone. This encourages quality conversations and quick decisions. Premium users can continue chatting on our platform without limits."
  },
  {
    question: "Is my data safe and private?",
    answer: "Absolutely. We use end-to-end encryption for all messages, your data is never shared with third parties, and we're fully GDPR compliant. Only verified BITS students can access the platform, and we have 24/7 moderation to ensure community safety."
  },
  {
    question: "Can students from all BITS campuses connect?",
    answer: "Yes! BITSPARK connects students across all four BITS campuses - Pilani, Goa, Hyderabad, and Dubai. You can set location preferences or connect with anyone in the BITS community regardless of campus."
  },
  {
    question: "How does the shipping feature work?",
    answer: "Friends can 'ship' you with someone they think you'd be compatible with. You can choose to ship anonymously or reveal your identity. Both parties must consent before a connection is made. It's a fun way for friends to play cupid!"
  },
  {
    question: "What makes BITSPARK different from other dating apps?",
    answer: "BITSPARK is exclusively for verified BITS students, ensuring a safe and authentic community. Our 5-message limit encourages meaningful conversations, the shipping feature lets friends help with matchmaking, and our AI understands student life and academic interests better than generic apps."
  },
  {
    question: "How do I verify my BITS email and student ID?",
    answer: "Simply sign up with your @pilani.bits-pilani.ac.in email address and upload a clear photo of your student ID. Our team manually verifies all profiles within 24-48 hours to ensure authenticity and prevent fake accounts."
  },
  {
    question: "Is BITSPARK free to use?",
    answer: "Yes! Core features including CONNECT, FIND A DATE, messaging (5 messages), daily matches, and shipping are completely free. We offer premium features for enhanced matching and unlimited messaging for students who want extra features."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
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
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to know about BITSPARK
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="overflow-hidden">
                <motion.button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <h3 className="text-xl font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-purple-400 flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </motion.div>
                </motion.button>
                
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

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <GlassCard className="inline-block p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-white/70 mb-6">
              Our support team is here to help you get the most out of BITSPARK
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
            >
              Contact Support
            </motion.button>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}