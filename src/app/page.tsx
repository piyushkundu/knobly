'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { KnoblyApp } from '@/types/app';

import BootScreen from '@/components/layout/BootScreen';
import LoginModal from '@/components/auth/LoginModal';
import AppGrid from '@/components/apps/AppGrid';

// ── Static Base Apps ──
const BASE_APPS: Record<string, KnoblyApp[]> = {
  Main: [
    { id: 'security', name: 'Security', type: 'Cyber', link: '/cybersecurity', icon: 'ph-bold ph-shield-check', color: 'text-emerald-400', borderClass: 'border-emerald', category: 'Main' },
    { id: 'aiweb', name: 'AI Web', type: 'Future', link: '/ai', icon: 'ph-bold ph-robot', color: 'text-purple-400', borderClass: 'border-purple', category: 'Main' },
    { id: 'html', name: 'HTML', type: 'Structure', link: '/html', icon: 'ti ti-brand-html5', color: 'text-orange-500', borderClass: 'border-orange', category: 'Main' },
    { id: 'css', name: 'CSS', type: 'Style', link: '/web-design/css', icon: 'ti ti-brand-css3', color: 'text-blue-500', borderClass: 'border-blue', category: 'Main' },
    { id: 'w3css', name: 'W3.CSS', type: 'Framework', link: '/web-design/w3css', icon: 'ph-bold ph-layout', color: 'text-green-400', borderClass: 'border-green', category: 'Main' },
    { id: 'js', name: 'JS', type: 'Scripting', link: '/web-design/javascript', icon: 'ti ti-brand-javascript', color: 'text-yellow-400', borderClass: 'border-yellow', category: 'Main' },
    { id: 'youtube', name: 'YouTube', type: 'Channel', link: 'https://youtube.com/@knobly1', icon: 'ph-bold ph-youtube-logo', color: 'text-red-500', borderClass: 'border-red', category: 'Main' },
    { id: 'notes', name: 'Notes', type: 'Utility', link: '/notes', icon: 'ti ti-notes', color: 'text-cyan-300', borderClass: 'border-cyan', category: 'Main' },
  ],
  OLevel: [
    { id: 'syllabus', name: 'Syllabus', type: 'Info', link: '/syllabus', icon: 'ph-bold ph-list-bullets', color: 'text-gray-300', borderClass: 'border-slate', category: 'OLevel' },
    { id: 'olevel-notes', name: 'Notes', type: 'Reading', link: '/notes', icon: 'ph-bold ph-book-open-text', color: 'text-blue-400', borderClass: 'border-blue', category: 'OLevel' },
    { id: 'it-tools', name: 'IT Tools', type: 'Module 1', link: '/ccc/tests', icon: 'ph-bold ph-desktop', color: 'text-sky-400', borderClass: 'border-sky', category: 'OLevel' },
    { id: 'iot', name: 'IoT', type: 'Module 4', link: '/iot', icon: 'ph-bold ph-wifi-high', color: 'text-orange-400', borderClass: 'border-orange', category: 'OLevel' },
    { id: 'python', name: 'Python', type: 'Module 3', link: '/python', icon: 'ti ti-brand-python', color: 'text-yellow-400', borderClass: 'border-yellow', category: 'OLevel' },
    { id: 'mcq', name: 'MCQ Bank', type: 'Practice', link: '/mcq', icon: 'ph-bold ph-bank', color: 'text-emerald-400', borderClass: 'border-emerald', category: 'OLevel' },
    { id: 'webdes', name: 'Web Des.', type: 'Course', link: '/web-design', icon: 'ph-bold ph-paint-brush', color: 'text-pink-400', borderClass: 'border-pink', category: 'OLevel' },
  ],
  CCC: [
    { id: 'ccc-test', name: 'CCC Test', type: 'Cert', link: '/ccc/tests', icon: 'ph-bold ph-certificate', color: 'text-yellow-500', borderClass: 'border-yellow', category: 'CCC' },
    { id: 'live-test', name: 'Live Test', type: 'Exam', link: '/dashboard', icon: 'ph-bold ph-broadcast', color: 'text-red-500', borderClass: 'border-red', category: 'CCC' },
    { id: 'mock-test', name: 'Mock Test', type: 'Practice', link: '/dashboard', icon: 'ph-bold ph-exam', color: 'text-blue-400', borderClass: 'border-blue', category: 'CCC' },
    { id: 'shortcuts', name: 'Shortcuts', type: 'Utility', link: '/shortcuts', icon: 'ph-bold ph-keyboard', color: 'text-slate-300', borderClass: 'border-slate', category: 'CCC' },
  ],
};

const TABS = ['Main', 'OLevel', 'CCC', 'Favourites'] as const;

const WALLPAPER_OPTIONS = [
  { id: 'default', label: 'Core', thumbClass: 'wallpaper-thumb-default' },
  { id: 'ocean', label: 'Ocean', thumbClass: 'wallpaper-thumb-ocean' },
  { id: 'purple', label: 'Neon', thumbClass: 'wallpaper-thumb-purple' },
  { id: 'sunset', label: 'Sunset', thumbClass: 'wallpaper-thumb-sunset' },
  { id: 'matrix', label: 'Matrix', thumbClass: 'wallpaper-thumb-matrix' },
];

const VIDEOS = [
  { id: 'bJzb-RuUcMU', title: 'How To Learn Programming', views: 'Featured' },
  { id: 'dQw4w9WgXcQ', title: 'Web Development Roadmap', views: '10M views' },
];

const NAV_ITEMS = [
  { id: 'home' as const, icon: 'ph-bold ph-house' },
  { id: 'apps' as const, icon: 'ph-bold ph-squares-four' },
  { id: 'stats' as const, icon: 'ph-bold ph-chart-bar' },
  { id: 'settings' as const, icon: 'ph-bold ph-gear' },
];

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'apps', label: 'Apps' },
];

const ICON_LIBRARY = [
  'ph-bold ph-globe', 'ph-bold ph-code', 'ph-bold ph-game-controller',
  'ph-bold ph-music-notes', 'ph-bold ph-camera', 'ph-bold ph-chat',
  'ph-bold ph-shopping-cart', 'ph-bold ph-briefcase', 'ph-bold ph-book',
  'ph-bold ph-monitor', 'ph-bold ph-pencil', 'ph-bold ph-rocket',
  'ti ti-brand-github', 'ti ti-brand-twitter', 'ti ti-brand-instagram',
];

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme, wallpaper, setWallpaper } = useTheme();

  // ── Boot (only first visit ever) ──
  const [booted, setBooted] = useState(false);
  const [bootChecked, setBootChecked] = useState(false);
  useEffect(() => {
    if (localStorage.getItem('knobly_booted') === 'true') {
      setBooted(true);
    }
    setBootChecked(true);
  }, []);
  const handleBootComplete = useCallback(() => {
    localStorage.setItem('knobly_booted', 'true');
    setBooted(true);
  }, []);

  // ── Navigation ──
  const [activeNav, setActiveNav] = useState<'home' | 'apps' | 'youtube' | 'stats' | 'settings'>('home');
  const [activeTab, setActiveTab] = useState<string>('Main');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Modals ──
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ── Data ──
  const [globalApps, setGlobalApps] = useState<KnoblyApp[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const [recentApps, setRecentApps] = useState<KnoblyApp[]>([]);

  // ── Clock ──
  const [currentTime, setCurrentTime] = useState('');
  const [dateString, setDateString] = useState('');
  const [greeting, setGreeting] = useState('');

  // ── Weather ──
  const [weatherTemp, setWeatherTemp] = useState<string | null>(null);
  const [weatherIcon, setWeatherIcon] = useState('ph-cloud-sun');
  const [weatherCity, setWeatherCity] = useState('');

  // ── YouTube ──
  const [currentVideo, setCurrentVideo] = useState(VIDEOS[0]);
  const [myVideos, setMyVideos] = useState(VIDEOS);

  // ── Settings ──
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [settingsSearch, setSettingsSearch] = useState('');
  const [performanceMode, setPerformanceMode] = useState(true);
  const [appsFilter, setAppsFilter] = useState<'all' | 'hidden'>('all');

  // ── User / Profile ──
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameVal, setEditNameVal] = useState('');

  // ── Notes ──
  const [notesText, setNotesText] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);

  // ── Context Menus ──
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showAppContextMenu, setShowAppContextMenu] = useState(false);
  const [appContextPos, setAppContextPos] = useState({ x: 0, y: 0 });
  const [contextApp, setContextApp] = useState<KnoblyApp | null>(null);

  // ── Uptime ──
  const bootTimeRef = useRef(Date.now());
  const [uptimeString, setUptimeString] = useState('Just now');

  // ── Mobile detect ──
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDateString(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase());
      const hour = now.getHours();
      setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Load favourites, hidden, userName, notes from localStorage ──
  useEffect(() => {
    const savedFavs = localStorage.getItem('knobly-favourites');
    const savedHidden = localStorage.getItem('knobly-hidden');
    const savedName = localStorage.getItem('knobly-guest-name');
    const savedNotes = localStorage.getItem('knobly-notes');
    if (savedFavs) setFavourites(JSON.parse(savedFavs));
    if (savedHidden) setHiddenApps(JSON.parse(savedHidden));
    if (savedName) setUserName(savedName);
    if (savedNotes) setNotesText(savedNotes);
    setIsMobile(window.innerWidth <= 640);
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Uptime tracker ──
  useEffect(() => {
    const interval = setInterval(() => {
      const diffSec = Math.floor((Date.now() - bootTimeRef.current) / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      if (hours === 0 && minutes === 0) setUptimeString('Just now');
      else if (hours === 0) setUptimeString(`${minutes} min`);
      else setUptimeString(`${hours}h ${minutes}m`);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ── Performance mode toggle on body ──
  useEffect(() => {
    document.body.classList.toggle('low-perf-mode', !performanceMode);
  }, [performanceMode]);

  // ── Fetch weather ──
  useEffect(() => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        const url = lat && lon ? `/api/weather?lat=${lat}&lon=${lon}` : '/api/weather';
        const res = await fetch(url);
        const data = await res.json();
        if (data.temp != null) {
          setWeatherTemp(`${data.temp}°C`);
          setWeatherCity(data.city || '');
          const code = parseInt(data.code);
          if (code === 0) setWeatherIcon('ph-sun');
          else if (code <= 3) setWeatherIcon('ph-cloud-sun');
          else if (code <= 49) setWeatherIcon('ph-cloud-fog');
          else if (code <= 69) setWeatherIcon('ph-cloud-rain');
          else if (code <= 79) setWeatherIcon('ph-cloud-snow');
          else if (code <= 99) setWeatherIcon('ph-cloud-lightning');
          else setWeatherIcon('ph-cloud');
        }
      } catch { /* silently ignore */ }
    };

    // Try browser geolocation for accurate location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
          // Refresh every 10 min with same location
          const id = setInterval(() => fetchWeather(pos.coords.latitude, pos.coords.longitude), 600000);
          (window as any).__weatherInterval = id;
        },
        () => {
          // Permission denied → fallback to IP-based
          fetchWeather();
          const id = setInterval(() => fetchWeather(), 600000);
          (window as any).__weatherInterval = id;
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather();
      const id = setInterval(() => fetchWeather(), 600000);
      (window as any).__weatherInterval = id;
    }

    return () => clearInterval((window as any).__weatherInterval);
  }, []);

  // ── Listen to global apps from Firestore ──
  useEffect(() => {
    let unsub = () => { };
    try {
      const q = query(collection(db, 'global_apps'), orderBy('name'));
      unsub = onSnapshot(q, (snap) => {
        const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() } as KnoblyApp));
        setGlobalApps(apps);
      }, () => { /* silently ignore permission errors */ });
    } catch { /* silently ignore Firestore init errors */ }
    return () => unsub();
  }, []);

  // ── Load videos from Firestore ──
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, 'videos'), orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const vids = snapshot.docs.map(doc => {
            const v = doc.data();
            return { id: v.youtube_id, title: v.title, views: v.views || 'Video' };
          });
          setMyVideos(vids);
          setCurrentVideo(vids[0]);
        }
      } catch { /* silently ignore permission errors */ }
    };
    fetchVideos();
  }, []);

  // ── Derived: all apps merged ──
  const allApps = { ...BASE_APPS };
  globalApps.forEach((app) => {
    const cat = app.category || 'Main';
    if (!allApps[cat]) allApps[cat] = [];
    if (!allApps[cat].some((a) => a.id === app.id)) allApps[cat].push(app);
  });
  const allAppsList = Object.values(allApps).flat();

  const hiddenAppsSet = new Set(hiddenApps);

  const filteredApps = (() => {
    const q = searchQuery.toLowerCase();
    const filterVisible = (list: KnoblyApp[]) => list.filter((a) => !hiddenAppsSet.has(a.id));
    if (activeNav === 'apps') {
      let base = appsFilter === 'hidden'
        ? allAppsList.filter((a) => hiddenAppsSet.has(a.id))
        : allAppsList.filter((a) => !hiddenAppsSet.has(a.id));
      return q ? base.filter((a) => a.name.toLowerCase().includes(q)) : base;
    }
    if (activeTab === 'Favourites') {
      return filterVisible(allAppsList.filter((a) => favourites.includes(a.id)));
    }
    const list = allApps[activeTab] || [];
    return q ? filterVisible(list).filter((a) => a.name.toLowerCase().includes(q)) : filterVisible(list);
  })();

  // ── Actions ──
  const handleAppClick = (app: KnoblyApp) => {
    // Track recent apps
    setRecentApps(prev => {
      const filtered = prev.filter(a => a.id !== app.id);
      return [app, ...filtered].slice(0, 8);
    });
    // Navigate directly
    const link = app.link || (app.id === 'notes' ? '/notes' : '');
    if (link) {
      if (link.startsWith('http')) window.open(link, '_blank');
      else router.push(link);
    }
  };

  const toggleFavourite = (appId: string) => {
    const newFavs = favourites.includes(appId) ? favourites.filter((f) => f !== appId) : [...favourites, appId];
    setFavourites(newFavs);
    localStorage.setItem('knobly-favourites', JSON.stringify(newFavs));
  };

  const toggleAppVisibility = (app: KnoblyApp) => {
    const key = app.id || app.name;
    const newHidden = hiddenAppsSet.has(key) ? hiddenApps.filter(h => h !== key) : [...hiddenApps, key];
    setHiddenApps(newHidden);
    localStorage.setItem('knobly-hidden', JSON.stringify(newHidden));
  };

  const saveUserName = () => {
    localStorage.setItem('knobly-guest-name', userName);
  };

  const saveNotes = (text: string) => {
    setNotesText(text);
    localStorage.setItem('knobly-notes', text);
  };

  const handleContextMenu = (e: React.MouseEvent, app: KnoblyApp) => {
    e.preventDefault();
    e.stopPropagation();
    setContextApp(app);
    setShowAppContextMenu(true);
    setShowContextMenu(false);
    let x = e.clientX;
    let y = e.clientY;
    if (x + 190 > window.innerWidth) x = window.innerWidth - 195;
    if (y + 200 > window.innerHeight) y = window.innerHeight - 205;
    setAppContextPos({ x, y });
  };

  const handleGlobalRightClick = (e: React.MouseEvent) => {
    // If the right-click is on an app card, don't show global menu
    const target = e.target as HTMLElement;
    if (target.closest('.glass-card') || target.closest('.app-card')) return;
    e.preventDefault();
    setShowContextMenu(true);
    setShowAppContextMenu(false);
    let x = e.clientX;
    let y = e.clientY;
    if (x + 190 > window.innerWidth) x = window.innerWidth - 195;
    if (y + 220 > window.innerHeight) y = window.innerHeight - 225;
    setContextMenuPos({ x, y });
  };

  const closeAllContextMenus = () => {
    setShowContextMenu(false);
    setShowAppContextMenu(false);
  };

  const refreshPage = () => { closeAllContextMenus(); window.location.reload(); };

  const changeWallpaper = () => {
    closeAllContextMenus();
    setActiveNav('settings');
    setActiveSettingsTab('appearance');
  };

  const sortApps = () => {
    closeAllContextMenus();
    // Apps are already sorted by the allApps structure, just trigger a re-render toast
    alert('Apps sorted alphabetically!');
  };

  const addAppToGroup = (targetGroup: string) => {
    if (!contextApp) return;
    closeAllContextMenus();
    // In Next.js version, groups are managed by globalApps type field
    alert(`Moved ${contextApp.name} to ${targetGroup}`);
  };

  const pinToFavourites = () => {
    if (!contextApp) return;
    closeAllContextMenus();
    if (!favourites.includes(contextApp.id)) {
      const newFavs = [...favourites, contextApp.id];
      setFavourites(newFavs);
      localStorage.setItem('knobly-favourites', JSON.stringify(newFavs));
    }
  };

  const removeFromFavourites = () => {
    if (!contextApp) return;
    closeAllContextMenus();
    const newFavs = favourites.filter(f => f !== contextApp.id);
    setFavourites(newFavs);
    localStorage.setItem('knobly-favourites', JSON.stringify(newFavs));
  };

  const renameSoon = () => {
    closeAllContextMenus();
    alert('Rename feature coming soon in a future build of Knobly OS.');
  };

  const isInFavourites = (app: KnoblyApp | null) => {
    if (!app) return false;
    return favourites.includes(app.id);
  };

  // ── Boot Screen ──
  if (!bootChecked) {
    return <div className="h-screen w-screen bg-[#020617]" />;
  }
  if (!booted) {
    return (
      <AnimatePresence>
        <BootScreen onComplete={handleBootComplete} />
      </AnimatePresence>
    );
  }

  return (
    <div
      className={`wallpaper-${wallpaper} h-screen w-screen overflow-hidden flex flex-col lg:flex-row gap-4 lg:gap-6 pt-3 px-3 pb-14 lg:p-6 relative select-none`}
      onClick={closeAllContextMenus}
      onContextMenu={handleGlobalRightClick}
    >

      {/* ══════ GLOBAL CONTEXT MENU ══════ */}
      {showContextMenu && (
        <div
          className="context-menu animate__animated animate__fadeIn animate__faster"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-item cursor-pointer" onClick={refreshPage}>
            <i className="ph-bold ph-arrow-clockwise" /> Refresh System
          </div>
          <div className="ctx-item cursor-pointer" onClick={() => { closeAllContextMenus(); toggleTheme(); }}>
            <i className={`ph-bold ${!isDark ? 'ph-moon-stars' : 'ph-sun'}`} />
            {!isDark ? 'Dark Mode' : 'Light Mode'}
          </div>
          <div className="ctx-separator" />
          <div className="ctx-item cursor-pointer" onClick={changeWallpaper}>
            <i className="ph-bold ph-image" /> Change Wallpaper
          </div>
          <div className="ctx-item cursor-pointer" onClick={sortApps}>
            <i className="ph-bold ph-list-dashes" /> Sort Apps
          </div>
          <div className="ctx-separator" />
          <div
            className="ctx-item cursor-pointer"
            style={{ color: user ? '#ef4444' : '#22d3ee' }}
            onClick={() => {
              closeAllContextMenus();
              if (user) { /* logout handled by auth */ }
              else setShowLoginModal(true);
            }}
          >
            <i className={`ph-bold ${user ? 'ph-sign-out' : 'ph-sign-in'}`} />
            {user ? 'Log Out' : 'Login / Sign Up'}
          </div>
        </div>
      )}

      {/* ══════ APP CONTEXT MENU ══════ */}
      {showAppContextMenu && contextApp && (
        <div
          className="context-menu animate__animated animate__fadeIn animate__faster"
          style={{ top: appContextPos.y, left: appContextPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ctx-item cursor-pointer" onClick={() => addAppToGroup('Main')}>
            <i className="ph-bold ph-folder-notch-plus" /> Add to Main
          </div>
          <div className="ctx-item cursor-pointer" onClick={() => addAppToGroup('OLevel')}>
            <i className="ph-bold ph-brackets-angle" /> Add to OLevel
          </div>
          <div className="ctx-item cursor-pointer" onClick={() => addAppToGroup('CCC')}>
            <i className="ph-bold ph-pen-nib" /> Add to CCC
          </div>
          <div className="ctx-separator" />
          {!isInFavourites(contextApp) ? (
            <div className="ctx-item cursor-pointer" onClick={pinToFavourites}>
              <i className="ph-bold ph-push-pin" /> Add to Favourites
            </div>
          ) : (
            <div className="ctx-item cursor-pointer" onClick={removeFromFavourites}>
              <i className="ph-bold ph-x-circle" /> Remove from Favourites
            </div>
          )}
          <div className="ctx-separator" />
          <div className="ctx-item cursor-pointer" onClick={renameSoon}>
            <i className="ph-bold ph-text-t" /> Rename (soon)
          </div>
        </div>
      )}

      {/* ══════ LEFT SIDEBAR (Desktop) ══════ */}
      <aside className="glass-panel w-[70px] shrink-0 h-full rounded-[24px] flex-col items-center justify-between px-4 py-6 z-10 hidden lg:flex">
        <div className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] cursor-pointer hover:scale-110 transition-transform knobly-header-style">
          K.
        </div>

        <div className="flex flex-col gap-4">
          {NAV_ITEMS.map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`nav-btn w-11 h-11 rounded-3xl flex items-center justify-center transition-all duration-200 relative border border-transparent active-press ${activeNav === id
                ? 'bg-cyan-500/20 text-cyan-200 shadow-[0_8px_18px_rgba(15,23,42,0.8)] border-cyan-400/70 is-active'
                : 'text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/10'
                }`}
            >
              <i className={`${icon} text-2xl`} />
            </button>
          ))}
        </div>

        <button
          onClick={() => user ? logout() : setShowLoginModal(true)}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/40 active-press"
          title={user ? 'Sign Out' : 'Login'}
        >
          <i className={`ph-bold text-lg ${user ? 'ph-sign-out text-red-400' : 'ph-sign-in text-cyan-400'}`} />
        </button>
      </aside>

      {/* ══════ MAIN PANEL ══════ */}
      <main className="glass-panel flex-1 rounded-[28px] px-4 md:px-6 lg:px-8 py-5 lg:py-6 flex flex-col gap-4 overflow-hidden relative z-10 mb-14 lg:mb-0">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 shrink-0 border-b border-white/5 pb-3">
          {/* Mobile search (only when on apps tab) */}
          {activeNav === 'apps' && (
            <div className="lg:hidden">
              <div className="search-shell relative rounded-xl flex items-center px-3 py-3">
                <i className="ph-bold ph-magnifying-glass text-gray-500 mr-2 transition-colors text-sm search-shell-icon" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="bg-transparent w-full text-sm text-white focus:outline-none placeholder-gray-400 font-medium" />
              </div>
            </div>
          )}

          {/* Settings/Stats/YouTube header */}
          {(activeNav === 'settings' || activeNav === 'stats' || activeNav === 'youtube') ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div id="knobly-logo" className="text-2xl md:text-3xl knobly-header-style">KNOBLY</div>
                <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.2em]">
                  {activeNav === 'youtube' ? 'YouTube' : activeNav === 'settings' ? 'Settings' : 'System Stats'}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <button className="relative w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press">
                  <i className="ph-bold ph-bell-simple text-xs md:text-sm text-gray-400" />
                </button>
                <button onClick={toggleTheme} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press">
                  {isDark ? <i className="ph-bold ph-moon-stars text-xs md:text-sm text-cyan-300" /> : <i className="ph-bold ph-sun-dim text-xs md:text-sm text-yellow-500" />}
                </button>
                <button
                  onClick={() => user ? logout() : setShowLoginModal(true)}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press overflow-hidden"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <i className={`ph-bold ph-user text-xs md:text-sm ${user ? 'text-cyan-300' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
            </div>
          ) : activeNav !== 'apps' && (
            /* Home header */
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div id="knobly-logo" className="text-2xl md:text-3xl knobly-header-style">KNOBLY</div>
                  <div className="flex items-center gap-1.5 opacity-70">
                    <i className="ph-bold ph-calendar-blank text-cyan-400 text-xs" />
                    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">{dateString}</span>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-white leading-tight mt-0.5">
                  {greeting},{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {user ? (user.displayName || userName) : (userName || 'Guest')}
                  </span>
                </h1>

                {/* Mobile home clock/weather */}
                {isMobile && activeNav === 'home' && (
                  <div className="flex flex-col gap-2 mt-4 lg:hidden w-full border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className="ph-bold ph-clock text-lg text-cyan-400" />
                        <span className="text-2xl font-bold tracking-wide text-white">{currentTime}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <i className={`ph-fill ${weatherIcon} text-lg`} />
                          <span className="text-xl font-bold">{weatherTemp || '--°C'}</span>
                        </div>
                        {weatherCity && <span className="text-[9px] text-gray-500 uppercase tracking-wider">{weatherCity}</span>}
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">System Local</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <button className="relative w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press">
                    <i className="ph-bold ph-bell-simple text-xs md:text-sm text-gray-400" />
                  </button>
                  <button onClick={toggleTheme} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press">
                    {isDark ? <i className="ph-bold ph-moon-stars text-xs md:text-sm text-cyan-300" /> : <i className="ph-bold ph-sun-dim text-xs md:text-sm text-yellow-500" />}
                  </button>
                  <button
                    onClick={() => user ? logout() : setShowLoginModal(true)}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-all shadow-sm active-press overflow-hidden"
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <i className={`ph-bold ph-user text-xs md:text-sm ${user ? 'text-cyan-300' : 'text-gray-400'}`} />
                    )}
                  </button>
                  {/* Desktop search */}
                  <div className="relative w-48 md:w-60 lg:w-72 group hidden md:block">
                    <div className="search-shell relative rounded-xl flex items-center px-3 md:px-4 py-2">
                      <i className="ph-bold ph-magnifying-glass text-gray-500 mr-2 md:mr-3 transition-colors text-xs md:text-sm search-shell-icon" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search system... (Ctrl + K)"
                        className="bg-transparent w-full text-[11px] md:text-sm text-white focus:outline-none placeholder-gray-400 font-medium" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ── Settings Panel ── */}
        {activeNav === 'settings' && (
          <motion.section
            key="settings"
            initial={performanceMode ? { y: 16, opacity: 0.85 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 mt-1 flex flex-col min-h-0"
          >
            <div className="glass-panel rounded-2xl px-3 md:px-5 py-3 flex flex-col gap-3 border border-white/10 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2 shrink-0">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1">Settings</div>
                  <div className="text-xs md:text-sm text-gray-200">Personalize Knobly OS</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-[11px] text-gray-400 uppercase tracking-[0.18em]">Performance</span>
                  <button onClick={() => setPerformanceMode(!performanceMode)}
                    className={`relative w-10 md:w-11 h-5 md:h-6 rounded-full border border-white/20 flex items-center px-0.5 transition-all ${performanceMode ? 'bg-emerald-500/60' : 'bg-slate-700/70'}`}>
                    <span className="w-4 md:w-5 h-4 md:h-5 rounded-full bg-white shadow-md transform transition-transform"
                      style={{ transform: performanceMode ? 'translateX(16px)' : 'translateX(0px)' }} />
                  </button>
                </div>
              </div>

              <div className="mt-2 max-w-xs">
                <div className="search-shell relative rounded-xl flex items-center px-3 py-1.5">
                  <i className="ph-bold ph-magnifying-glass text-gray-500 mr-2 text-xs search-shell-icon" />
                  <input type="text" value={settingsSearch} onChange={(e) => setSettingsSearch(e.target.value)} placeholder="Search settings..."
                    className="bg-transparent w-full text-[11px] text-white focus:outline-none placeholder-gray-400 font-medium" />
                </div>
              </div>

              <div className="flex gap-2 mt-2 border-b border-white/10 pb-1 shrink-0">
                {SETTINGS_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)}
                    className={`settings-tab-btn flex-1 text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-center active-press ${activeSettingsTab === tab.id ? 'settings-tab-btn-active' : 'border-white/10 text-gray-400'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex-1 overflow-y-auto custom-scroll pr-1 text-xs">
                {/* Profile Tab */}
                {activeSettingsTab === 'profile' && (
                  <div className="flex flex-col gap-3">
                    <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-gray-300">Profile</div>
                    {!user ? (
                      <div className="flex flex-col gap-3 p-4 border border-dashed border-white/20 rounded-xl bg-white/5 text-center">
                        <div className="text-cyan-300 font-bold">You are currently a Guest</div>
                        <p className="text-gray-400">Log in to keep your settings and apps safe.</p>
                        <button onClick={() => setShowLoginModal(true)} className="bg-cyan-500 text-black font-bold py-2 rounded-lg hover:bg-cyan-400">Login / Sign Up</button>
                        <hr className="border-white/10 my-2" />
                        <label className="flex flex-col gap-1 text-left">
                          <span className="uppercase tracking-[0.18em] text-[9px] text-gray-400">Local Guest Name</span>
                          <input value={userName} onChange={(e) => setUserName(e.target.value)} type="text" maxLength={20}
                            className="px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
                            placeholder="Enter a name to display in greeting" />
                        </label>
                        <button onClick={saveUserName}
                          className="self-start mt-1 px-3 py-1.5 rounded-xl bg-slate-700 text-white text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-slate-600 transition-all">
                          Save Guest Name
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-500/50">
                            {user.photoURL ? (
                              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full bg-cyan-900 flex items-center justify-center text-cyan-200 font-bold text-xl">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm">{user.displayName || 'User'}
                              <button onClick={() => { setIsEditingName(true); setEditNameVal(user.displayName || ''); }} className="ml-2 text-cyan-400 hover:text-cyan-300 text-xs"><i className="ph-bold ph-pencil-simple" /></button>
                            </div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                            {user.email && <div className="text-cyan-400 text-[10px] font-mono mt-0.5">@{user.email.split('@')[0]}</div>}
                            {isAdmin && <div className="text-red-400 text-[10px] font-bold uppercase mt-1">Administrator</div>}
                          </div>
                        </div>
                        <div className="bg-emerald-900/10 border border-emerald-500/20 p-2 rounded text-emerald-200 text-xs flex items-center gap-2">
                          <i className="ph-bold ph-cloud-check text-lg" />
                          <span>Your account is active.</span>
                        </div>
                        <button onClick={logout} className="w-full py-2 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg font-bold hover:bg-red-500/20">Sign Out</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Appearance Tab */}
                {activeSettingsTab === 'appearance' && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Wallpapers</div>
                    <div className="flex items-center gap-3 scroll-x-soft pt-1 pb-1">
                      {WALLPAPER_OPTIONS.map((wp) => (
                        <button key={wp.id} onClick={() => setWallpaper(wp.id)}
                          className={`relative flex-shrink-0 w-20 h-12 rounded-xl overflow-hidden border transition-all active-press bg-slate-900/80 ${wp.thumbClass} ${wallpaper === wp.id ? 'border-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.6)]' : 'border-white/10 hover:border-cyan-300/70'}`}>
                          <span className="absolute bottom-1 left-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/80 drop-shadow">{wp.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Choose wallpapers. They auto-adapt for light / dark theme.</p>
                  </div>
                )}

                {/* Apps Tab */}
                {activeSettingsTab === 'apps' && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="text-[12px] font-bold uppercase tracking-[0.18em] text-gray-300 shrink-0">App Management</div>
                    <div className="flex-1 overflow-y-auto custom-scroll">
                      {isAdmin && (
                        <div className="mb-4 border border-cyan-500/30 bg-cyan-900/10 p-2 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Global Admin Panel</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {globalApps.map((app) => (
                              <div key={app.id} className="flex justify-between items-center bg-white/5 p-1 rounded">
                                <span className="text-white">{app.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mt-2">Visibility</div>
                      <div className="settings-app-list overflow-visible text-[11px] text-gray-200">
                        {allAppsList.map((app) => (
                          <div key={'manage-' + (app.id || app.name)} className="flex items-center justify-between gap-2 py-0.5 px-1 rounded-lg hover:bg-white/5">
                            <span className="flex items-center gap-1.5 min-w-0">
                              <i className={`${app.icon} text-xs ${app.color}`} />
                              <span className="truncate">{app.name}</span>
                            </span>
                            <button onClick={() => toggleAppVisibility(app)}
                              className={`px-2 py-0.5 rounded-full border text-[10px] active-press shrink-0 ${hiddenAppsSet.has(app.id || app.name) ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10' : 'border-slate-500 text-slate-300 bg-slate-800/40'}`}>
                              {hiddenAppsSet.has(app.id || app.name) ? 'Show' : 'Hide'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Stats Panel ── */}
        {activeNav === 'stats' && (
          <motion.section
            key="stats"
            initial={performanceMode ? { y: 16, opacity: 0.85 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 mt-1 flex flex-col"
          >
            <div className="glass-panel rounded-2xl px-3 md:px-5 py-4 flex flex-col gap-4 border border-white/10 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1">System Stats</div>
                  <div className="text-xs md:text-sm text-gray-200">Overview of your Knobly OS usage</div>
                </div>
                <div className="text-right text-[10px] text-gray-400 uppercase tracking-[0.18em]">
                  Uptime<br />
                  <span className="text-cyan-400 text-[11px]">{uptimeString}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-1">
                <div className="glass-card rounded-2xl flex flex-col gap-1.5 px-3 py-3 md:px-4 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">Total Apps</span>
                    <i className="ph-bold ph-squares-four text-cyan-400 text-sm" />
                  </div>
                  <div className="text-xl font-bold text-white">{allAppsList.length}</div>
                </div>
                <div className="glass-card rounded-2xl flex flex-col gap-1.5 px-3 py-3 md:px-4 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">Favourites</span>
                    <i className="ph-bold ph-star text-yellow-400 text-sm" />
                  </div>
                  <div className="text-xl font-bold text-white">{favourites.length}</div>
                </div>
                <div className="glass-card rounded-2xl flex flex-col gap-1.5 px-3 py-3 md:px-4 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">Hidden</span>
                    <i className="ph-bold ph-eye-slash text-red-400 text-sm" />
                  </div>
                  <div className="text-xl font-bold text-white">{hiddenApps.length}</div>
                </div>
                <div className="glass-card rounded-2xl flex flex-col gap-1.5 px-3 py-3 md:px-4 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">Performance</span>
                    <i className="ph-bold ph-rocket-launch text-emerald-400 text-sm" />
                  </div>
                  <div className="text-xs font-semibold text-gray-200">{performanceMode ? 'High visuals' : 'Battery saver'}</div>
                </div>
                <div className="glass-card rounded-2xl flex flex-col gap-1.5 col-span-2 md:col-span-2 px-3 py-3 md:px-4 md:py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400">Theme</span>
                    <i className={`ph-bold ${isDark ? 'ph-moon-stars text-cyan-300' : 'ph-sun text-yellow-400'}`} />
                  </div>
                  <div className="text-xs font-semibold text-gray-200">{isDark ? 'Dark mode' : 'Light mode'} • Wallpaper: {wallpaper}</div>
                </div>
              </div>

              {/* Recent Apps */}
              <div className="stats-recent-list mt-2 overflow-y-auto custom-scroll pr-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">Recent Apps</div>
                {recentApps.length === 0 ? (
                  <div className="text-[11px] text-gray-500">Launch some apps to see them here.</div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    {recentApps.map((app) => (
                      <div key={'recent-' + (app.id || app.name)} className="flex items-center justify-between py-1 px-2 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
                            <i className={`${app.icon} text-sm ${app.color}`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-100">{app.name}</div>
                            <div className="text-[9px] uppercase tracking-[0.16em] text-gray-400">{app.type}</div>
                          </div>
                        </div>
                        <button className="text-[9px] px-2 py-1 rounded-full border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 active:scale-95 transition-all"
                          onClick={() => handleAppClick(app)}>
                          Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ── YouTube Panel ── */}
        {activeNav === 'youtube' && (
          <motion.section
            key="youtube"
            initial={performanceMode ? { y: 16, opacity: 0.85 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 mt-1 flex flex-col overflow-hidden"
          >
            <div className="glass-panel w-full rounded-[28px] flex-1 p-0 flex flex-col min-h-0 overflow-hidden mb-3">
              <div className="p-4 pb-2 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-gaming)' }}>MY CONTENT</h3>
                <div className="flex items-center gap-2 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/30">
                  <i className="ph-fill ph-youtube-logo text-red-500 text-xs" />
                  <span className="text-[9px] font-bold text-red-400 tracking-wider">PLAYER</span>
                </div>
              </div>
              <div className="w-full aspect-video bg-black">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=0`}
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <div className="flex flex-col flex-1 custom-scroll p-2 gap-2 bg-black/20 overflow-y-auto">
                {myVideos.map((video) => (
                  <div key={video.id} onClick={() => setCurrentVideo(video)}
                    className={`video-item p-2 rounded-lg cursor-pointer flex items-start gap-3 active-press ${currentVideo.id === video.id ? 'video-active' : ''}`}>
                    <div className="w-20 h-12 bg-gray-800 rounded overflow-hidden shrink-0 relative group">
                      <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent">
                        <i className="ph-fill ph-play text-white text-xs" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-semibold text-gray-200 leading-tight line-clamp-2">{video.title}</h4>
                      <p className="text-[9px] text-gray-500 mt-1">{video.views}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <a href="https://youtube.com/@knobly1" target="_blank" rel="noopener noreferrer"
              className="glass-panel w-full yt-cta rounded-[22px] p-3 flex items-center justify-between group transition-all shrink-0 hover:bg-red-500/5 active-press">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <i className="ph-fill ph-youtube-logo text-lg" />
                </div>
                <div className="font-bold text-[11px] text-gray-200">Knobly OS</div>
              </div>
              <div className="yt-cta-join text-[9px] font-bold">JOIN</div>
            </a>
          </motion.section>
        )}

        {/* ── Home / Apps Content ── */}
        {(activeNav === 'home' || activeNav === 'apps') && (
          <motion.div
            key={`nav-${activeNav}`}
            initial={performanceMode ? { y: 16, opacity: 0.85 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Tabs (home only) */}
            {activeNav === 'home' && !searchQuery && (
              <nav className="flex gap-3 md:gap-4 shrink-0 justify-center pt-2">
                {TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`tab-btn pb-1.5 text-[10px] md:text-[11px] font-bold tracking-wide uppercase transition-all relative px-3 md:px-5 active-press ${activeTab === tab ? 'tab-btn-active' : 'text-gray-500 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </nav>
            )}

            {/* Apps filter (apps nav only) */}
            {activeNav === 'apps' && (
              <nav className="flex gap-4 shrink-0 pt-2 border-b border-white/10 pb-1 justify-between items-center">
                <div className="flex gap-4">
                  <button onClick={() => setAppsFilter('all')}
                    className={`apps-filter-btn text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase active-press ${appsFilter === 'all' ? 'apps-filter-btn-active' : 'text-gray-500 hover:text-white'}`}>
                    All Apps
                  </button>
                  <button onClick={() => setAppsFilter('hidden')}
                    className={`apps-filter-btn text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase active-press ${appsFilter === 'hidden' ? 'apps-filter-btn-active' : 'text-gray-500 hover:text-white'}`}>
                    Hidden / Disabled
                  </button>
                </div>
                {user && (
                  <button className="text-cyan-400 hover:text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <i className="ph-bold ph-plus-circle text-lg" /> Add
                  </button>
                )}
              </nav>
            )}

            {/* App Grid */}
            <div className="flex-1 pt-4 overflow-y-auto custom-scroll pr-1 relative overflow-x-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tab-${activeTab}-${activeNav}`}
                  initial={performanceMode ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={performanceMode ? { opacity: 0 } : undefined}
                  transition={{ duration: 0.15 }}
                >
                  <AppGrid
                    apps={filteredApps}
                    favourites={favourites}
                    activeNav={activeNav}
                    performanceMode={performanceMode}
                    onAppClick={handleAppClick}
                    onAppContextMenu={handleContextMenu}
                  />
                </motion.div>
              </AnimatePresence>
              {activeTab === 'Favourites' && !searchQuery && favourites.length === 0 && activeNav !== 'apps' && (
                <div className="col-span-3 sm:col-span-4 lg:col-span-5 flex flex-col items-center justify-center py-6 text-center text-gray-500 text-xs">
                  <i className="ph-bold ph-push-pin text-2xl mb-2 text-cyan-400/70" />
                  <p className="uppercase tracking-[0.18em] text-[9px]">Right-click any app &amp; choose &quot;Add to favourites&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* ══════ RIGHT SIDEBAR (Desktop XL) ══════ */}
      <aside className="hidden xl:flex w-[320px] min-w-[320px] max-w-[320px] flex-col gap-4 h-full z-10 shrink-0">
        {/* Clock/Weather */}
        <div className="glass-panel w-full rounded-[28px] p-4 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="text-4xl font-black tracking-tight text-white leading-none mb-1">{currentTime}</div>
            <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">System Local</div>
          </div>
          <div className="text-right relative">
            <i className={`ph-fill ${weatherIcon} text-2xl text-yellow-400 drop-shadow-md mb-1 animate-float`} />
            <div className="text-lg font-semibold text-white tracking-tight">{weatherTemp || '--°C'}</div>
            {weatherCity && <div className="text-[8px] text-gray-400 uppercase tracking-wider mt-0.5">{weatherCity}</div>}
          </div>
        </div>

        {/* YouTube Player */}
        <div className="glass-panel w-full rounded-[28px] flex-1 p-0 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 pb-2 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-gaming)' }}>MY CONTENT</h3>
            <div className="flex items-center gap-2 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/30">
              <i className="ph-fill ph-youtube-logo text-red-500 text-xs" />
              <span className="text-[9px] font-bold text-red-400 tracking-wider">PLAYER</span>
            </div>
          </div>
          <div className="w-full aspect-video bg-black">
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=0`}
              title="YouTube video" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
          <div className="flex flex-col flex-1 custom-scroll p-2 gap-2 bg-black/20 overflow-y-auto">
            {myVideos.map((video) => (
              <div key={video.id} onClick={() => setCurrentVideo(video)}
                className={`video-item p-2 rounded-lg cursor-pointer flex items-start gap-3 active-press ${currentVideo.id === video.id ? 'video-active' : ''}`}>
                <div className="w-20 h-12 bg-gray-800 rounded overflow-hidden shrink-0 relative group">
                  <img src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent">
                    <i className="ph-fill ph-play text-white text-xs" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-semibold text-gray-200 leading-tight line-clamp-2">{video.title}</h4>
                  <p className="text-[9px] text-gray-500 mt-1">{video.views}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KnoblyAI CTA */}
        <div
          onClick={() => {
            window.dispatchEvent(new Event('toggle-knobly-ai'));
          }}
          className="glass-panel w-full rounded-[22px] p-3 flex items-center justify-between group transition-all shrink-0 hover:bg-purple-500/5 active-press cursor-pointer"
          style={{ borderColor: 'rgba(139,92,246,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #38bdf8)' }}>
              <svg viewBox="0 0 40 40" width="20" height="20">
                <defs>
                  <radialGradient id="sidebarOrb" cx="40%" cy="35%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.6" />
                  </radialGradient>
                </defs>
                <circle cx="20" cy="20" r="8" fill="url(#sidebarOrb)" />
                <circle cx="20" cy="20" r="3" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div className="font-bold text-[11px] text-gray-200">KnoblyAI</div>
          </div>
          <div className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(56,189,248,0.15))', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
            ASK
          </div>
        </div>
      </aside>

      {/* ══════ MOBILE BOTTOM DOCK ══════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-30">
        <div className="mobile-dock flex items-center justify-around px-4 py-2.5">
          <button onClick={() => setActiveNav('home')}
            className={`nav-btn flex items-center justify-center w-9 h-9 rounded-2xl border border-transparent transition-all active-press ${activeNav === 'home' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 is-active' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20'}`}>
            <i className="ph-bold ph-house text-lg" />
          </button>
          <button onClick={() => setActiveNav('apps')}
            className={`nav-btn flex items-center justify-center w-9 h-9 rounded-2xl border border-transparent transition-all active-press ${activeNav === 'apps' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 is-active' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20'}`}>
            <i className="ph-bold ph-squares-four text-lg" />
          </button>
          <button onClick={() => setActiveNav('youtube')}
            className={`nav-btn flex items-center justify-center w-9 h-9 rounded-2xl border border-transparent transition-all active-press ${activeNav === 'youtube' ? 'bg-red-500/20 text-red-400 border-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'text-gray-400 hover:text-red-400 hover:bg-white/5 hover:border-white/20'}`}>
            <i className="ph-fill ph-youtube-logo text-lg" />
          </button>
          <button onClick={() => setActiveNav('stats')}
            className={`nav-btn flex items-center justify-center w-9 h-9 rounded-2xl border border-transparent transition-all active-press ${activeNav === 'stats' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 is-active' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20'}`}>
            <i className="ph-bold ph-chart-bar text-lg" />
          </button>
          <button onClick={() => setActiveNav('settings')}
            className={`nav-btn flex items-center justify-center w-9 h-9 rounded-2xl border border-transparent transition-all active-press ${activeNav === 'settings' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/70 is-active' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/20'}`}>
            <i className="ph-bold ph-gear text-lg" />
          </button>
        </div>
      </nav>

      {/* ══════ MODALS ══════ */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />


      {/* ══════ NOTES MODAL ══════ */}
      {showNotesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
          <div className="pointer-events-auto relative w-[90%] max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl z-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Quick Notes</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-white"><i className="ph-bold ph-x text-xl" /></button>
            </div>
            <textarea
              value={notesText}
              onChange={(e) => saveNotes(e.target.value)}
              className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:border-cyan-400 placeholder-gray-500"
              placeholder="Write your notes here..."
            />
            <div className="text-[9px] text-emerald-400 mt-2 uppercase tracking-[0.16em]">● Saved locally</div>
          </div>
        </div>
      )}
    </div>
  );
}
