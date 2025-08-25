import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Upload, User, Heart, Sparkles, Camera } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/glass-card';
import { GradientButton } from '../components/ui/gradient-button';
import { PhotoUpload } from '../components/ui/photo-upload';
import toast from 'react-hot-toast';

interface OnboardingData {
  display_name: string;
  age: number;
  gender: string;
  pronouns: string;
  year: number;
  branch: string;
  bio: string;
  interests: string[];
  preferences: {
    age_range: [number, number];
    same_campus_only: boolean;
    same_year_preference: boolean;
  };
  photos: string[];
}

const INTEREST_CATEGORIES = {
  'Academic': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Literature', 'Philosophy'],
  'Sports': ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Gym', 'Running'],
  'Arts': ['Music', 'Dancing', 'Painting', 'Photography', 'Writing', 'Theater', 'Singing', 'Drawing'],
  'Technology': ['Programming', 'AI/ML', 'Web Development', 'Mobile Apps', 'Gaming', 'Robotics', 'Blockchain', 'Cybersecurity'],
  'Hobbies': ['Reading', 'Cooking', 'Traveling', 'Movies', 'Anime', 'Netflix', 'Podcasts', 'Meditation']
};

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    display_name: '',
    age: 18,
    gender: '',
    pronouns: '',
    year: 1,
    branch: '',
    bio: '',
    interests: [],
    preferences: {
      age_range: [18, 25],
      same_campus_only: false,
      same_year_preference: false
    },
    photos: []
  });

  useEffect(() => {
    // Check if user has already completed onboarding
    if (user?.profile_completed) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          display_name: data.display_name,
          age: data.age,
          gender: data.gender,
          pronouns: data.pronouns,
          year: data.year,
          branch: data.branch,
          bio: data.bio,
          preferences: data.preferences,
          profile_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      // Add interests
      if (data.interests.length > 0) {
        const interestInserts = data.interests.map(interest => ({
          user_id: user?.id,
          interest_name: interest,
          is_primary: true
        }));

        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestInserts);

        if (interestsError) throw interestsError;
      }

      // Add photos
      if (data.photos.length > 0) {
        const photoInserts = data.photos.map((photo, index) => ({
          user_id: user?.id,
          photo_url: photo,
          photo_order: index + 1,
          is_primary: index === 0,
          moderation_status: 'approved' // Auto-approve for now
        }));

        const { error: photosError } = await supabase
          .from('user_photos')
          .insert(photoInserts);

        if (photosError) throw photosError;
      }

      // Update local user state
      await updateUser();

      toast.success('Profile completed successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.display_name.trim() && data.age >= 17 && data.age <= 30;
      case 2:
        return data.gender && data.year >= 1 && data.year <= 4 && data.branch.trim();
      case 3:
        return data.bio.trim().length >= 20;
      case 4:
        return data.interests.length >= 3;
      case 5:
        return data.photos.length >= 1;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Basic Information</h2>
              <p className="text-gray-300">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={data.display_name}
                  onChange={(e) => setData({ ...data, display_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="How should people know you?"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 18 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  min="17"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Gender</label>
                <select
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Pronouns (Optional)</label>
                <input
                  type="text"
                  value={data.pronouns}
                  onChange={(e) => setData({ ...data, pronouns: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="e.g., he/him, she/her, they/them"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Academic Details</h2>
              <p className="text-gray-300">Your BITS journey</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Year of Study</label>
                <select
                  value={data.year}
                  onChange={(e) => setData({ ...data, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Branch</label>
                <input
                  type="text"
                  value={data.branch}
                  onChange={(e) => setData({ ...data, branch: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  placeholder="e.g., Computer Science, Mechanical, EEE"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">About You</h2>
              <p className="text-gray-300">Share your story</p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Bio</label>
              <textarea
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 h-32 resize-none"
                placeholder="Tell people about yourself, your interests, what makes you unique..."
                maxLength={500}
              />
              <p className="text-gray-400 text-sm mt-2">
                {data.bio.length}/500 characters (minimum 20)
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Interests</h2>
              <p className="text-gray-300">Select at least 3 interests</p>
            </div>

            <div className="space-y-4">
              {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                <div key={category}>
                  <h3 className="text-white font-medium mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => {
                          if (data.interests.includes(interest)) {
                            setData({
                              ...data,
                              interests: data.interests.filter(i => i !== interest)
                            });
                          } else {
                            setData({
                              ...data,
                              interests: [...data.interests, interest]
                            });
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          data.interests.includes(interest)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400">
              Selected: {data.interests.length} interests
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Camera className="w-16 h-16 mx-auto text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Add Photos</h2>
              <p className="text-gray-300">Upload at least one photo</p>
            </div>

            <PhotoUpload
              onPhotosChange={(photos) => setData({ ...data, photos })}
              maxPhotos={6}
              currentPhotos={data.photos}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm">Step {currentStep} of 5</span>
            <span className="text-gray-400 text-sm">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <GlassCard className="p-6 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </GlassCard>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <GradientButton
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <span>{currentStep === 5 ? 'Complete' : 'Next'}</span>
                {currentStep === 5 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </>
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;