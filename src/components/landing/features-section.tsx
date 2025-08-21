import { motion } from 'framer-motion'
import { Heart, Users, Ship, MessageCircle, Dice6, Coffee } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const features = [
  {
    icon: Users,
    title: "CONNECT - Social Networking",
    description: "AI-powered friend matching with personality compatibility scoring",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    icon: Heart,
    title: "FIND A DATE/PROM",
    description: "Romantic connections for dates, proms, and special events",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Ship,
    title: "SHIPPING - Matchmaking",
    description: "Friends can ship you with others - the modern cupid",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: MessageCircle,
    title: "Smart Messaging",
    description: "5 meaningful messages to make the perfect first impression",
    gradient: "from-indigo-500 to-cyan-500",
  },
  {
    icon: Dice6,
    title: "Daily Random Match",
    description: "Discover someone new every day with our AI algorithm",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Coffee,
    title: "Group Rooms (Coming Soon)",
    description: "Join communities, plan events, and build lasting friendships",
    gradient: "from-orange-500 to-red-500",
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Discover the features that make BITSPARK the ultimate platform for meaningful connections
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full cursor-pointer group" hover={true}>
                {/* Icon */}
                <motion.div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-purple-400 font-medium flex items-center gap-2 group-hover:text-purple-300 transition-colors"
                >
                  Learn More →
                </motion.button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}