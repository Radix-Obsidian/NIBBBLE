'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageCircle, TrendingUp, Users, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';
import { DiscussionThreadCard } from '@/app/components/social/discussion-thread-card';
import type { DiscussionThread } from '@/lib/services/social-service';

const categories = [
  { id: 'all', label: 'All Discussions', icon: MessageCircle },
  { id: 'general', label: 'General', icon: MessageCircle },
  { id: 'recipe-help', label: 'Recipe Help', icon: TrendingUp },
  { id: 'techniques', label: 'Techniques', icon: Users },
  { id: 'ingredients', label: 'Ingredients', icon: Search },
  { id: 'equipment', label: 'Equipment', icon: Filter },
  { id: 'dietary', label: 'Dietary', icon: Users },
];

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [selectedCategory]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      params.set('limit', '20');

      const response = await fetch(`/api/social/community/threads?${params}`);
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error('Load threads error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (thread: DiscussionThread) => {
    // Navigate to thread detail page (to be implemented)
    console.log('Navigate to thread:', thread.id);
  };

  const filteredThreads = threads.filter(thread =>
    searchQuery === '' || 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the community.</p>
          <Button onClick={() => window.location.href = '/signin'}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">
            Connect with fellow cooks, share tips, and get help with recipes
          </p>
        </div>

        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{threads.length}</p>
                <p className="text-sm text-gray-600">Active Discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#f97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {threads.reduce((sum, thread) => sum + thread.reply_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2.4k</p>
                <p className="text-sm text-gray-600">Community Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-sm text-gray-600">Questions Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                const threadCount = category.id === 'all' 
                  ? threads.length 
                  : threads.filter(t => t.category === category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      {threadCount}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[#f97316] rounded-full mt-2 flex-shrink-0" />
                <p>Be respectful and helpful to fellow cooks</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[#f97316] rounded-full mt-2 flex-shrink-0" />
                <p>Search existing discussions before posting</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[#f97316] rounded-full mt-2 flex-shrink-0" />
                <p>Include recipe details when asking for help</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-[#f97316] rounded-full mt-2 flex-shrink-0" />
                <p>Mark helpful replies as solutions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Threads List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredThreads.length > 0 ? (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <DiscussionThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={handleThreadClick}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No discussions found' : 'No discussions yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms or browse different categories.'
                    : 'Be the first to start a discussion in this category!'
                  }
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Form Modal (placeholder) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Discussion form coming soon! This will allow users to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-6">
                <li>Choose a category</li>
                <li>Add a descriptive title</li>
                <li>Write detailed content</li>
                <li>Link to recipes</li>
                <li>Add tags</li>
              </ul>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}