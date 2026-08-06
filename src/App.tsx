/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Category, Channel, Language, Province, Theme, ThemeContext, getThemeClasses } from './types';
import { afghanChannels } from './data/channels';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelGrid } from './components/ChannelGrid';
import { ChannelCard } from './components/ChannelCard';
import { RadioPlayer } from './components/RadioPlayer';
import { RemoteControl } from './components/RemoteControl';
import { CustomStreamModal } from './components/CustomStreamModal';
import { ReportModal } from './components/ReportModal';
import { ShareModal } from './components/ShareModal';
import { AdminPanel } from './components/AdminPanel';
import { PremiumModal } from './components/PremiumModal';
import { SettingsModal } from './components/SettingsModal';
import { MoviesSection } from './components/MoviesSection';
import { Footer } from './components/Footer';
import { Radio, Tv, Flame, Star, Sparkles, Filter, ChevronUp, Film } from 'lucide-react';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [language, setLanguage] = useState<Language>('ps'); // Pashto as default
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Channels state loaded from localStorage if custom modifications exist
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem('zama_channels_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse zama_channels_db from localStorage', e);
    }
    return afghanChannels;
  });

  // Automatically sync channels list to localStorage on every update
  useEffect(() => {
    try {
      localStorage.setItem('zama_channels_db', JSON.stringify(channels));
    } catch (e) {
      console.warn('Failed to save channels to localStorage', e);
    }
  }, [channels]);

  const [activeChannelId, setActiveChannelId] = useState<string>('rta-pashto');
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedProvince, setSelectedProvince] = useState<Province>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  
  const [activeQuality, setActiveQuality] = useState<string>('Auto');
  const [isRadioAudioPlaying, setIsRadioAudioPlaying] = useState<boolean>(true);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zama_favorites');
      return saved ? JSON.parse(saved) : ['rta-pashto', 'tolo-tv', 'lemar-tv'];
    } catch {
      return ['rta-pashto', 'tolo-tv', 'lemar-tv'];
    }
  });

  // Likes state map
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    afghanChannels.forEach((c) => {
      initial[c.id] = c.likes;
    });
    return initial;
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('zama_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Synchronize authentication state using Firebase Auth onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const firestoreData = userSnap.data();
            setCurrentUser(firestoreData);
            localStorage.setItem('zama_current_user', JSON.stringify(firestoreData));
          } else {
            // Check local users list for fallback
            const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
            const localUser = users.find((u: any) => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase() || u.id === firebaseUser.uid);
            if (localUser) {
              setCurrentUser(localUser);
              localStorage.setItem('zama_current_user', JSON.stringify(localUser));
            } else {
              const fallbackUser = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                isVip: false
              };
              setCurrentUser(fallbackUser);
              localStorage.setItem('zama_current_user', JSON.stringify(fallbackUser));
            }
          }
        } catch (err) {
          console.warn('Error fetching Firestore user on auth change:', err);
        }
      } else {
        // Keep current saved user if present, or fallback
        const saved = localStorage.getItem('zama_current_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {
            setCurrentUser(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Persist currentUser in localStorage so user stays logged in across refreshes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('zama_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('zama_current_user');
      }
    } catch (e) {
      console.warn('Failed to save currentUser to localStorage', e);
    }
  }, [currentUser]);

  // Periodically synchronize user object from zama_users array
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem('zama_users') || '[]');
      const updatedUser = users.find((u: any) => u.email === currentUser.email || u.id === currentUser.id);
      if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }
  }, [isPremiumModalOpen, isAdminOpen]);

  // Modal states
  const [isRemoteOpen, setIsRemoteOpen] = useState(false);
  const [isCustomStreamOpen, setIsCustomStreamOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Check URL path, query string, or hash for admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const href = window.location.href.toLowerCase();

      if (
        path.includes('/admin') ||
        hash.includes('admin') ||
        search.includes('admin') ||
        href.includes('/admin')
      ) {
        setIsAdminOpen(true);
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash.includes('admin')) {
      window.history.pushState(null, '', window.location.pathname);
    } else if (window.location.pathname.includes('/admin')) {
      window.history.pushState(null, '', './');
    } else if (window.location.search.includes('admin')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Sync RTL / LTR document direction based on language
  useEffect(() => {
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = language;
  }, [language]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('zama_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  // Active channel object
  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || channels[0];
  }, [channels, activeChannelId]);

  // Handle Channel Selection
  const handleSelectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next / Previous Channel Surfing
  const handleNextChannel = () => {
    const currentIndex = channels.findIndex((c) => c.id === activeChannelId);
    const nextIndex = (currentIndex + 1) % channels.length;
    setActiveChannelId(channels[nextIndex].id);
  };

  const handlePrevChannel = () => {
    const currentIndex = channels.findIndex((c) => c.id === activeChannelId);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    setActiveChannelId(channels[prevIndex].id);
  };

  const handleSelectByNumber = (num: number) => {
    const found = channels.find((c) => c.number === num);
    if (found) {
      setActiveChannelId(found.id);
    }
  };

  const toggleFavorite = (channelId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId]
    );
  };

  const handleLikeChannel = () => {
    if (!activeChannel) return;
    setLikesMap((prev) => ({
      ...prev,
      [activeChannel.id]: (prev[activeChannel.id] || activeChannel.likes) + 1,
    }));
  };

  const handleAddCustomStream = (newChannel: Channel) => {
    setChannels([newChannel, ...channels]);
    setActiveChannelId(newChannel.id);
  };

  // Filtered Channels for Live TV / Radio
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Exclude movies from standard live TV grids
      if (channel.isMovie || channel.category === 'movies') {
        return false;
      }

      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(channel.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory === 'all') {
        // show all live TV and radio
      } else if (selectedCategory === 'radio') {
        if (!channel.isRadio) return false;
      } else {
        if (channel.category !== selectedCategory) return false;
      }

      // Province filter
      if (selectedProvince !== 'all' && channel.province !== selectedProvince) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesDr = channel.nameDr?.toLowerCase().includes(query);
        const matchesEn = channel.nameEn?.toLowerCase().includes(query);
        const matchesLocation = channel.location.toLowerCase().includes(query);
        const matchesNum = channel.number.toString() === query;

        return matchesName || matchesDr || matchesEn || matchesLocation || matchesNum;
      }

      return true;
    });
  }, [channels, selectedCategory, selectedProvince, searchQuery, showFavoritesOnly, favorites]);

  // Movies list
  const movieChannels = useMemo(() => {
    return channels.filter((channel) => channel.isMovie || channel.category === 'movies');
  }, [channels]);

  const t = translations[language];

  const themeClasses = getThemeClasses(theme);

  return (
    <ThemeContext.Provider value={{ theme, isLight: theme === 'light' }}>
      <div className={`min-h-screen flex flex-col font-sans transition-colors ${themeClasses.appBg}`}>
      
      {/* Header Bar */}
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenRemote={() => setIsRemoteOpen(true)}
        onOpenCustomStream={() => setIsCustomStreamOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        totalChannels={channels.filter(c => !c.isRadio && !c.isMovie).length}
        totalRadio={channels.filter(c => c.isRadio).length}
        currentUser={currentUser}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-16 sm:pb-20 space-y-6">
        
        {/* Main Player Area or Empty State */}
        {activeChannel ? (
          <section className="space-y-4">
            {activeChannel.isRadio ? (
              <RadioPlayer
                channel={activeChannel}
                language={language}
                isPlaying={isRadioAudioPlaying}
                onTogglePlay={() => setIsRadioAudioPlaying(!isRadioAudioPlaying)}
              />
            ) : (
              <VideoPlayer
                channel={activeChannel}
                language={language}
                onNextChannel={handleNextChannel}
                onPrevChannel={handlePrevChannel}
                isFavorite={favorites.includes(activeChannel.id)}
                onToggleFavorite={() => toggleFavorite(activeChannel.id)}
                onOpenShare={() => setIsShareOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
                likesCount={likesMap[activeChannel.id] || activeChannel.likes}
                onLikeChannel={handleLikeChannel}
                activeQuality={activeQuality}
                setActiveQuality={setActiveQuality}
                currentUser={currentUser}
                onOpenPremium={() => setIsPremiumModalOpen(true)}
              />
            )}
          </section>
        ) : null}

        {/* Dedicated Movies Section vs Channels Grid */}
        {selectedCategory === 'movies' ? (
          <MoviesSection
            movies={movieChannels}
            activeChannel={activeChannel}
            onSelectMovie={handleSelectChannel}
            language={language}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        ) : (
          <section className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <Tv className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  <bdi dir="auto">{showFavoritesOnly ? t.favoriteChannels : t.featuredChannels}</bdi>
                </h2>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                {filteredChannels.length} / {channels.filter(c => !c.isMovie).length} {t.totalChannels}
              </span>
            </div>

            <ChannelGrid
              channels={filteredChannels}
              activeChannel={activeChannel}
              onSelectChannel={handleSelectChannel}
              language={language}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
            />
          </section>
        )}

      </main>

      {/* Footer */}
      <Footer
        language={language}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        totalChannels={channels.length}
      />

      {/* Interactive Overlay Modals */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        channels={channels}
        setChannels={setChannels}
        language={language}
      />

      <RemoteControl
        isOpen={isRemoteOpen}
        onClose={() => setIsRemoteOpen(false)}
        channels={channels}
        onSelectChannelByNumber={handleSelectByNumber}
        language={language}
      />

      <CustomStreamModal
        isOpen={isCustomStreamOpen}
        onClose={() => setIsCustomStreamOpen(false)}
        onAddStream={handleAddCustomStream}
        language={language}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        channel={activeChannel}
        language={language}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        channel={activeChannel}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        language={language}
        onUserUpdate={(user) => {
          setCurrentUser(user);
          if (user) {
            localStorage.setItem('zama_current_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('zama_current_user');
          }
        }}
      />

      </div>
    </ThemeContext.Provider>
  );
}
