# BITSPARK - BITS Dating & Social App 🚀💕

A modern, Tinder-style dating and social networking app exclusively for BITS students across all campuses.

## ✨ Features

### 🔐 Authentication
- **Google OAuth Login** - Quick and secure sign-in
- **BITS Email Validation** - Only @pilani.bits-pilani.ac.in, @goa.bits-pilani.ac.in, @hyderabad.bits-pilani.ac.in, @dubai.bits-pilani.ac.in
- **Profile Onboarding** - Comprehensive profile setup with interests, preferences, and photos

### 👥 CONNECT - Find Friends
- **Swipe Interface** - Tinder-like card swiping for friend discovery
- **AI-Powered Matching** - Algorithm based on interests, year, branch, and compatibility
- **Compatibility Scoring** - Smart matching using multiple factors
- **Common Interests Display** - See what you have in common

### 💕 SHIPPING - Matchmaking
- **Friend Matchmaking** - Let friends play cupid and suggest matches
- **Anonymous Options** - Send ships anonymously or reveal your identity
- **Dating Compatibility** - AI calculates romantic compatibility scores
- **Ship Reasons** - Explain why two people would be perfect together

### 💬 Smart Messaging
- **5 Message Limit** - Quality over quantity approach
- **Connection Management** - Track all your matches and conversations
- **Platform Integration** - Move to preferred messaging apps after initial connection

### 🎯 Daily Match
- **AI Recommendations** - Get one perfect match every day
- **Compatibility Algorithm** - Based on interests, personality, and preferences
- **Fresh Opportunities** - Never run out of potential connections

### 🏛️ Campus Support
- **BITS Pilani** - Main campus
- **BITS Goa** - Beach campus
- **BITS Hyderabad** - City campus  
- **BITS Dubai** - International campus

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd BTHOGAYI
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Database Setup**
Run the Supabase migration:
```sql
-- Run the migration in your Supabase SQL editor
-- File: supabase/migrations/20250822233843_amber_lake.sql
```

5. **Start Development Server**
```bash
npm run dev
```

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** for data storage
- **Real-time subscriptions** for live updates

### Key Components
- **Auth System** - Google OAuth + BITS email validation
- **Matching Engine** - AI-powered compatibility algorithm
- **Swipe Interface** - Tinder-like user experience
- **Profile Management** - Comprehensive user profiles
- **Connection System** - Friend and dating connections

## 🎨 UI/UX Features

### Design Philosophy
- **Modern & Engaging** - Not boring, like Tinder
- **Mobile-First** - Responsive design for all devices
- **Smooth Animations** - Framer Motion powered interactions
- **Glass Morphism** - Beautiful glass card effects
- **Gradient Themes** - Purple, pink, and blue color schemes

### User Experience
- **Intuitive Swiping** - Left/right gestures for decisions
- **Match Celebrations** - Exciting animations for successful matches
- **Progress Indicators** - Clear feedback on all actions
- **Responsive Feedback** - Haptic-like visual responses

## 🔧 Configuration

### Matching Algorithm
The app uses a sophisticated compatibility scoring system:

1. **Interest Similarity (40%)** - Common hobbies and activities
2. **Academic Compatibility (30%)** - Year and branch considerations
3. **Activity Level (20%)** - Recent online activity
4. **Campus Proximity (10%)** - Same campus preference

### User Preferences
- **Connect Similarity** - +1 for similar, -1 for opposite personalities
- **Dating Similarity** - +1 for similar, -1 for complementary traits
- **Looking For** - Friends, dating, or networking
- **Privacy Settings** - Anonymous or public interactions

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First** approach
- **Touch Gestures** - Swipe, tap, and hold interactions
- **Optimized Layouts** - Perfect for mobile dating app usage
- **Fast Loading** - Optimized for mobile networks

## 🔒 Security & Privacy

### Data Protection
- **BITS Email Verification** - Only verified students can join
- **Profile Privacy** - Control what information is visible
- **Anonymous Options** - Ship anonymously if desired
- **Secure Authentication** - Google OAuth + Supabase security

### Community Safety
- **Report System** - Flag inappropriate behavior
- **Moderation Tools** - Admin controls for community safety
- **Block Features** - Block unwanted users
- **Content Filtering** - AI-powered inappropriate content detection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel** - Recommended for React apps
- **Netlify** - Great for static sites
- **Supabase Hosting** - Full-stack solution

## 🤝 Contributing

### Development Guidelines
1. **Feature Branches** - Create feature branches for new functionality
2. **Code Quality** - Follow TypeScript and React best practices
3. **Testing** - Test all new features thoroughly
4. **Documentation** - Update README for new features

### Code Style
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent code formatting
- **Component Structure** - Reusable, modular components

## 📊 Performance

### Optimization Features
- **Lazy Loading** - Components load on demand
- **Image Optimization** - Compressed profile photos
- **Bundle Splitting** - Efficient code splitting
- **Caching** - Smart data caching strategies

### Metrics
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms

## 🔮 Future Features

### Planned Enhancements
- **Video Profiles** - Short video introductions
- **Group Dating** - Double dates and group activities
- **Event Integration** - Campus event matching
- **Advanced Filters** - More detailed preference settings
- **Push Notifications** - Real-time match alerts

### AI Improvements
- **Better Matching** - Enhanced compatibility algorithms
- **Conversation Starters** - AI-generated ice breakers
- **Personality Analysis** - Deeper user understanding
- **Predictive Matching** - Future compatibility predictions

## 📞 Support

### Getting Help
- **Documentation** - Check this README first
- **Issues** - Report bugs via GitHub issues
- **Discussions** - Join community discussions
- **Email Support** - Contact the development team

### Community
- **BITS Students** - Join the exclusive BITS community
- **Feedback** - Share your experience and suggestions
- **Feature Requests** - Suggest new features
- **Bug Reports** - Help improve the app

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **BITS Community** - For inspiration and feedback
- **Supabase Team** - For the amazing backend platform
- **React Community** - For the excellent frontend framework
- **Open Source Contributors** - For the libraries and tools used

---

**Made with ❤️ for BITS students by BITS students**

*Find your perfect match at BITS! 🚀💕*