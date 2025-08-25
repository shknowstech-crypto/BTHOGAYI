import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Send, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/ui/glass-card';
import { RealTimeChat } from '../components/messaging/real-time-chat';
import toast from 'react-hot-toast';

interface Connection {
  id: string;
  user1_id: string;
  user2_id: string;
  status: string;
  matched_at: string;
  messages_count: number;
  last_message_at: string;
  other_user: {
    id: string;
    display_name: string;
    user_photos: Array<{ photo_url: string; is_primary: boolean }>;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection.id);
    }
  }, [selectedConnection]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select(`
          id,
          user1_id,
          user2_id,
          status,
          matched_at,
          messages_count,
          last_message_at,
          user1:users!connections_user1_id_fkey (
            id,
            display_name,
            user_photos (photo_url, is_primary)
          ),
          user2:users!connections_user2_id_fkey (
            id,
            display_name,
            user_photos (photo_url, is_primary)
          )
        `)
        .eq('status', 'matched')
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConnections = connectionsData?.map(conn => ({
        ...conn,
        other_user: conn.user1_id === user?.id ? conn.user2 : conn.user1
      })) || [];

      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (connectionId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConnection || sendingMessage) return;

    // Check message limit (5 messages per user per connection)
    const userMessages = messages.filter(msg => msg.sender_id === user?.id);
    if (userMessages.length >= 5) {
      toast.error('Message limit reached! Continue on WhatsApp or Instagram');
      return;
    }

    try {
      setSendingMessage(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          connection_id: selectedConnection.id,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Update connection's message count and last message time
      await supabase
        .from('connections')
        .update({
          messages_count: selectedConnection.messages_count + 1,
          last_message_at: new Date().toISOString()
        })
        .eq('id', selectedConnection.id);

      setNewMessage('');
      fetchMessages(selectedConnection.id);
      fetchConnections(); // Refresh to update last message time

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleExternalRedirect = (platform: 'whatsapp' | 'instagram') => {
    const message = `Hey! We've reached our message limit on BITSPARK. Let's continue our conversation here! 😊`;
    
    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (platform === 'instagram') {
      window.open('https://instagram.com', '_blank');
    }
    
    toast.success(`Redirected to ${platform}! Share your contact details to continue.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-white/10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2 text-white">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </div>
          </div>

          {/* Conversations */}
          <div className="space-y-2">
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start connecting with people to begin chatting!
                </p>
              </div>
            ) : (
              connections.map((connection) => (
                <motion.div
                  key={connection.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedConnection(connection)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConnection?.id === connection.id
                      ? 'bg-white/20'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      {connection.other_user.user_photos?.[0] ? (
                        <img
                          src={connection.other_user.user_photos[0].photo_url}
                          alt={connection.other_user.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {connection.other_user.display_name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {connection.other_user.display_name || 'Anonymous'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {connection.messages_count} messages
                      </p>
                    </div>
                    {connection.messages_count >= 10 && (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConnection ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      {selectedConnection.other_user.user_photos?.[0] ? (
                        <img
                          src={selectedConnection.other_user.user_photos[0].photo_url}
                          alt={selectedConnection.other_user.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {selectedConnection.other_user.display_name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedConnection.other_user.display_name || 'Anonymous'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {selectedConnection.messages_count}/10 messages used
                      </p>
                    </div>
                  </div>
                  
                  {selectedConnection.messages_count >= 8 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleExternalRedirect('whatsapp')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm hover:bg-green-500/30 transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleExternalRedirect('instagram')}
                        className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm hover:bg-pink-500/30 transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Instagram</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                {messages.filter(msg => msg.sender_id === user?.id).length >= 5 ? (
                  <div className="text-center py-4">
                    <p className="text-yellow-400 mb-2">Message limit reached!</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Continue your conversation on external platforms
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => handleExternalRedirect('whatsapp')}
                        className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        Continue on WhatsApp
                      </button>
                      <button
                        onClick={() => handleExternalRedirect('instagram')}
                        className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
                      >
                        Continue on Instagram
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400 text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;