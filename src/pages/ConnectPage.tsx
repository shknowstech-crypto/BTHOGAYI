import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, ArrowLeft, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/glass-card';
import { GradientButton } from '../components/ui/gradient-button';
import toast from 'react-hot-toast';

interface User {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  campus: string;
  year: number;
  branch: string;
  interests: string[];
  photos: string[];
}

const ConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch users from the same campus, excluding current user
      const { data: potentialMatches, error } = await supabase
        .from('users')
        .select(`
          id,
          display_name,
          age,
          bio,
          campus,
          year,
          branch,
          user_interests (
            interest_name
          ),
          user_photos (
            photo_url,
            is_primary
          )
        `)
        .eq('verified', true)
        .eq('is_active', true)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;

      const formattedUsers = potentialMatches?.map(match => ({
        id: match.id,
        display_name: match.display_name || 'Anonymous',
        age: match.age || 20,
        bio: match.bio || 'No bio available',
        campus: match.campus || 'Unknown',
        year: match.year || 1,
        branch: match.branch || 'Unknown',
        interests: match.user_interests?.map((i: any) => i.interest_name) || [],
        photos: match.user_photos?.map((p: any) => p.photo_url) || []
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'super') => {
    if (currentUserIndex >= users.length) return;

    const currentMatch = users[currentUserIndex];
    setSwipeDirection(direction === 'left' ? 'left' : 'right');

    try {
      // Record the action in recommendation_feedback
      await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: user?.id,
          recommended_user_id: currentMatch.id,
          action: direction === 'left' ? 'pass' : direction === 'super' ? 'super_like' : 'like',
          compatibility_score: Math.random() * 100, // Placeholder
          algorithm_version: 'v2.0'
        });

      // If it's a like or super like, create/update connection
      if (direction === 'right' || direction === 'super') {
        const { error: connectionError } = await supabase
          .from('connections')
          .upsert({
            user1_id: user?.id,
            user2_id: currentMatch.id,
            user1_action: direction === 'super' ? 'super_like' : 'like',
            status: 'pending'
          });

        if (connectionError) {
          console.error('Error creating connection:', connectionError);
        } else {
          toast.success(direction === 'super' ? 'Super liked!' : 'Liked!');
        }
      }

      // Move to next user after animation
      setTimeout(() => {
        setCurrentUserIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 300);

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Something went wrong');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentUser = users[currentUserIndex];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <GlassCard className="text-center p-8">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-4">No More Matches!</h2>
          <p className="text-gray-300 mb-6">
            You've seen all available matches. Check back later for new people!
          </p>
          <GradientButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </GradientButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2 text-white">
          <Users className="w-5 h-5" />
          <span className="font-medium">Connect</span>
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Card Stack */}
      <div className="max-w-sm mx-auto relative h-[600px]">
        <AnimatePresence>
          {currentUser && (
            <motion.div
              key={currentUser.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
                rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0
              }}
              exit={{ 
                scale: 0.8, 
                opacity: 0,
                x: swipeDirection === 'left' ? -300 : 300,
                rotate: swipeDirection === 'left' ? -30 : 30
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <GlassCard className="h-full overflow-hidden">
                {/* Photo */}
                <div className="h-2/3 bg-gradient-to-br from-purple-400 to-pink-400 relative">
                  {currentUser.photos.length > 0 ? (
                    <img
                      src={currentUser.photos[0]}
                      alt={currentUser.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-24 h-24 text-white/50" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Basic info overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">
                      {currentUser.display_name}, {currentUser.age}
                    </h3>
                    <p className="text-sm opacity-90">
                      {currentUser.year}th Year • {currentUser.branch}
                    </p>
                    <p className="text-sm opacity-90">{currentUser.campus} Campus</p>
                  </div>
                </div>

                {/* Details */}
                <div className="h-1/3 p-4 space-y-3">
                  <p className="text-gray-300 text-sm line-clamp-2">
                    {currentUser.bio}
                  </p>
                  
                  {/* Interests */}
                  <div className="flex flex-wrap gap-1">
                    {currentUser.interests.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {currentUser.interests.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                        +{currentUser.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center space-x-6 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        
        <button
          onClick={() => handleSwipe('super')}
          className="w-12 h-12 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/30 transition-colors"
        >
          <Star className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center mt-6 text-gray-400 text-sm">
        <p>Swipe or tap buttons to connect with people</p>
      </div>
    </div>
  );
};

export default ConnectPage;