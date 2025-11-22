import React, { useState, useEffect, useRef } from 'react';
import { 
    Settings, 
    Search, 
    Plus, 
    X, 
    Globe, 
    Palette, 
    Droplets, 
    Sparkles, 
    Clock, 
    LayoutGrid, 
    Type,
    Trash2,
    Monitor,
    MousePointer
} from 'lucide-react';

// --- Starfield Component ---
const Starfield = ({ settings }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        
        // Initial resize
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const count = settings.particleCount;
        
        // Initialize Particles
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * settings.particleSpeed * 0.5,
                vy: (Math.random() - 0.5) * settings.particleSpeed * 0.5,
                size: Math.random() * settings.particleSize,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw Particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.fillStyle = settings.particleColor + Math.floor(p.alpha * 255).toString(16).padStart(2,'0');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Connections
                if (settings.particleLinks) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = p.x - particles[j].x;
                        const dy = p.y - particles[j].y;
                        const dist = Math.sqrt(dx*dx + dy*dy);

                        if (dist < 150) {
                            // Hex opacity logic
                            const opacity = Math.floor((1 - dist/150) * 50).toString(16).padStart(2,'0');
                            ctx.strokeStyle = settings.particleColor + opacity;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        if (settings.showParticles) {
            animate();
        } else {
            ctx.clearRect(0,0,width,height);
        }

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [
        settings.particleCount, 
        settings.particleSpeed, 
        settings.particleSize, 
        settings.particleColor, 
        settings.particleLinks, 
        settings.showParticles
    ]);

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// --- Main App ---
export default function App() {
    // --- DEFAULT SETTINGS ---
    const defaultSettings = {
        // Visuals
        bgColor: '#050505',
        bgGradient: true,
        bgGradientEnd: '#1a1a2e',
        fontFamily: 'Inter',
        textColor: '#ffffff',
        accentColor: '#3b82f6',
        uiScale: 1,
        
        // Glassmorphism
        glassBlur: 16,
        glassOpacity: 0.05,
        glassBorder: true,

        // Particles
        showParticles: true,
        particleCount: 80,
        particleSpeed: 1,
        particleSize: 2,
        particleColor: '#ffffff',
        particleLinks: true,

        // Clock & Date
        showClock: true,
        use24Hour: false,
        showSeconds: false,
        clockSize: 6, // rem scale factor
        clockWeight: '100', // font-weight
        showDate: true,
        dateFormat: 'long', // 'long' or 'short'
        
        // Greeting
        showGreeting: true,
        customGreeting: '', // Empty = auto
        
        // Search
        showSearch: true,
        searchEngine: 'google', // google, bing, ddg
        searchPlaceholder: 'Search the universe...',
        searchRoundness: 'full', // none, md, full
        autoFocusSearch: true,

        // Grid
        shortcutSize: 100,
        shortcutGap: 24,
        showLabels: true,
        openNewTab: false,
    };

    // --- STATE ---
    const [time, setTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('aether-settings-v2');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    });

    const [shortcuts, setShortcuts] = useState(() => {
        try {
            const saved = localStorage.getItem('aether-shortcuts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    
    const [newShortcut, setNewShortcut] = useState({ name: '', url: '' });

    // --- EFFECTS ---
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('aether-settings-v2', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('aether-shortcuts', JSON.stringify(shortcuts));
    }, [shortcuts]);

    // --- LOGIC ---
    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            let url = '';
            const q = encodeURIComponent(searchQuery);
            switch(settings.searchEngine) {
                case 'bing': url = `https://www.bing.com/search?q=${q}`; break;
                case 'ddg': url = `https://duckduckgo.com/?q=${q}`; break;
                case 'youtube': url = `https://www.youtube.com/results?search_query=${q}`; break;
                default: url = `https://www.google.com/search?q=${q}`;
            }
            window.location.href = url;
        }
    };

    const addShortcut = (e) => {
        e.preventDefault();
        if (!newShortcut.name || !newShortcut.url) return;
        let url = newShortcut.url;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        setShortcuts([...shortcuts, { ...newShortcut, url, id: Date.now() }]);
        setNewShortcut({ name: '', url: '' });
        setShowAddModal(false);
    };

    const getGreeting = () => {
        if (settings.customGreeting) return settings.customGreeting;
        const h = time.getHours();
        return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
    };

    // --- STYLES HELPERS ---
    const glassStyle = {
        background: `rgba(255, 255, 255, ${settings.glassOpacity})`,
        backdropFilter: `blur(${settings.glassBlur}px)`,
        WebkitBackdropFilter: `blur(${settings.glassBlur}px)`,
        border: settings.glassBorder ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        color: settings.textColor
    };

    const containerStyle = {
        color: settings.textColor,
        fontFamily: settings.fontFamily,
        background: settings.bgGradient 
            ? `linear-gradient(to bottom right, ${settings.bgColor}, ${settings.bgGradientEnd})`
            : settings.bgColor,
    };

    const activeToggleStyle = {
        backgroundColor: settings.accentColor
    };

    // --- COMPONENT HELPERS ---
    const SettingItem = ({ label, children }) => (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-sm opacity-80">{label}</span>
            <div className="w-1/2 flex justify-end">{children}</div>
        </div>
    );

    const SettingSection = ({ title, icon: Icon, children }) => (
        <div className="mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2">
                <Icon className="w-4 h-4" /> {title}
            </h4>
            {children}
        </div>
    );

    const Toggle = ({ value, onChange }) => (
        <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full relative transition-colors ${value ? '' : 'bg-white/20'}`} style={value ? activeToggleStyle : {}}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${value ? 'left-6' : 'left-1'}`} />
        </button>
    );

    const Slider = ({ min, max, step, value, onChange }) => (
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" style={{ accentColor: settings.accentColor }} />
    );

    const Select = ({ options, value, onChange }) => (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs outline-none text-white focus:border-white/30 transition-colors">
            {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
    );

    const ColorPicker = ({ value, onChange }) => (
        <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 bg-transparent border-0 p-0 cursor-pointer" />
            <span className="text-xs opacity-50 uppercase">{value}</span>
        </div>
    );

    return (
        <div className={`relative min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-500 overflow-hidden ${isSearchFocused ? 'scale-[0.99]' : ''}`}
             style={containerStyle}>
            
            {/* Global Styles Injection */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Roboto:wght@300;400;500&family=JetBrains+Mono:wght@300;400&family=Lora:ital@0;1&display=swap');
                
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-enter { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                
                /* Override selection color based on accent */
                ::selection { background: ${settings.accentColor}40; color: white; }
            `}</style>

            <div style={{ transform: `scale(${settings.uiScale})`, width: '100%', height: '100%', position: 'absolute', pointerEvents: 'none' }}></div>

            <Starfield settings={settings} />

            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 flex gap-2 z-50">
                 <button onClick={() => setShowSettings(true)} className="p-3 rounded-full hover:bg-white/10 transition-colors" style={{ color: settings.textColor }}>
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-10" style={{ transform: `scale(${settings.uiScale})` }}>
                
                {/* Clock Header */}
                <div className="text-center flex flex-col items-center animate-enter">
                    {settings.showGreeting && (
                        <h2 className="text-xl md:text-2xl font-light opacity-60 tracking-[0.2em] uppercase mb-2">
                            {getGreeting()}
                        </h2>
                    )}
                    {settings.showClock && (
                        <h1 className="leading-none select-none" 
                            style={{ 
                                fontSize: `${settings.clockSize}rem`, 
                                fontWeight: settings.clockWeight,
                                textShadow: '0 0 40px rgba(255,255,255,0.1)'
                            }}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: settings.showSeconds ? '2-digit' : undefined, hour12: !settings.use24Hour })}
                        </h1>
                    )}
                    {settings.showDate && (
                        <p className="text-lg opacity-50 tracking-widest uppercase mt-4">
                            {time.toLocaleDateString([], { weekday: 'long', month: settings.dateFormat === 'long' ? 'long' : 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* Search Bar */}
                {settings.showSearch && (
                    <div className="w-full max-w-xl relative animate-enter delay-100 group">
                        <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: settings.accentColor }}></div>
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-50">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder={settings.searchPlaceholder}
                            className="w-full py-4 pl-14 pr-4 text-lg outline-none transition-all shadow-2xl"
                            style={{ 
                                ...glassStyle, 
                                borderRadius: settings.searchRoundness === 'full' ? '9999px' : settings.searchRoundness === 'md' ? '12px' : '0px'
                            }}
                            autoFocus={settings.autoFocusSearch}
                        />
                    </div>
                )}

                {/* Shortcuts */}
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 animate-enter delay-200" style={{ gap: `${settings.shortcutGap}px` }}>
                    {shortcuts.map(site => (
                        <a key={site.id} href={site.url} 
                           target={settings.openNewTab ? "_blank" : "_self"}
                           className="group relative flex flex-col items-center justify-center transition-transform hover:-translate-y-1"
                           style={{ width: `${settings.shortcutSize}px`, height: `${settings.shortcutSize}px`, ...glassStyle, borderRadius: '24px' }}>
                            
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShortcuts(shortcuts.filter(s => s.id !== site.id)) }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                                <X className="w-3 h-3" />
                            </button>
                            
                            <Globe className="w-8 h-8 mb-2 opacity-70 group-hover:opacity-100" />
                            
                            {settings.showLabels && (
                                <span className="text-xs opacity-60 group-hover:opacity-100 font-medium truncate w-11/12 text-center">
                                    {site.name}
                                </span>
                            )}
                        </a>
                    ))}
                    
                    {/* Add Button */}
                    <button onClick={() => setShowAddModal(true)}
                            className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:bg-white/5"
                            style={{ width: `${settings.shortcutSize}px`, height: `${settings.shortcutSize}px`, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '24px', color: settings.textColor }}>
                        <Plus className="w-8 h-8 opacity-30" />
                    </button>
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm animate-enter" onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
                    <div className="h-full w-full max-w-md p-8 overflow-y-auto custom-scrollbar shadow-2xl text-white" style={{ background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-light">Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="hover:opacity-70"><X className="w-6 h-6" /></button>
                        </div>

                        {/* Visuals Section */}
                        <SettingSection title="Visuals & Theme" icon={Palette}>
                            <SettingItem label="Background Color">
                                <ColorPicker value={settings.bgColor} onChange={v => setSettings({...settings, bgColor: v})} />
                            </SettingItem>
                            <SettingItem label="Enable Gradient">
                                <Toggle value={settings.bgGradient} onChange={v => setSettings({...settings, bgGradient: v})} />
                            </SettingItem>
                            {settings.bgGradient && (
                                <SettingItem label="Gradient End Color">
                                    <ColorPicker value={settings.bgGradientEnd} onChange={v => setSettings({...settings, bgGradientEnd: v})} />
                                </SettingItem>
                            )}
                            <SettingItem label="Text Color">
                                <ColorPicker value={settings.textColor} onChange={v => setSettings({...settings, textColor: v})} />
                            </SettingItem>
                            <SettingItem label="Accent Color">
                                <ColorPicker value={settings.accentColor} onChange={v => setSettings({...settings, accentColor: v})} />
                            </SettingItem>
                            <SettingItem label="Font Family">
                                <Select value={settings.fontFamily} options={[
                                    {val: 'Inter', label: 'Inter (Clean)'},
                                    {val: 'Roboto', label: 'Roboto (Standard)'},
                                    {val: 'JetBrains Mono', label: 'Mono (Code)'},
                                    {val: 'Lora', label: 'Lora (Serif)'},
                                ]} onChange={v => setSettings({...settings, fontFamily: v})} />
                            </SettingItem>
                            <SettingItem label="UI Scale">
                                <Slider min={0.5} max={1.5} step={0.05} value={settings.uiScale} onChange={v => setSettings({...settings, uiScale: v})} />
                            </SettingItem>
                        </SettingSection>

                        {/* Glassmorphism Section */}
                        <SettingSection title="Glass Effect" icon={Droplets}>
                            <SettingItem label="Blur Amount">
                                <Slider min={0} max={50} step={1} value={settings.glassBlur} onChange={v => setSettings({...settings, glassBlur: v})} />
                            </SettingItem>
                            <SettingItem label="Opacity">
                                <Slider min={0} max={1} step={0.05} value={settings.glassOpacity} onChange={v => setSettings({...settings, glassOpacity: v})} />
                            </SettingItem>
                            <SettingItem label="Show Borders">
                                <Toggle value={settings.glassBorder} onChange={v => setSettings({...settings, glassBorder: v})} />
                            </SettingItem>
                        </SettingSection>

                        {/* Particles Section */}
                        <SettingSection title="Starfield" icon={Sparkles}>
                            <SettingItem label="Show Particles">
                                <Toggle value={settings.showParticles} onChange={v => setSettings({...settings, showParticles: v})} />
                            </SettingItem>
                            <SettingItem label="Particle Count">
                                <Slider min={10} max={300} step={10} value={settings.particleCount} onChange={v => setSettings({...settings, particleCount: v})} />
                            </SettingItem>
                            <SettingItem label="Speed">
                                <Slider min={0} max={5} step={0.1} value={settings.particleSpeed} onChange={v => setSettings({...settings, particleSpeed: v})} />
                            </SettingItem>
                            <SettingItem label="Size">
                                <Slider min={1} max={5} step={0.5} value={settings.particleSize} onChange={v => setSettings({...settings, particleSize: v})} />
                            </SettingItem>
                            <SettingItem label="Color">
                                <ColorPicker value={settings.particleColor} onChange={v => setSettings({...settings, particleColor: v})} />
                            </SettingItem>
                            <SettingItem label="Show Connections">
                                <Toggle value={settings.particleLinks} onChange={v => setSettings({...settings, particleLinks: v})} />
                            </SettingItem>
                        </SettingSection>

                        {/* Clock Section */}
                        <SettingSection title="Time & Date" icon={Clock}>
                            <SettingItem label="Show Clock">
                                <Toggle value={settings.showClock} onChange={v => setSettings({...settings, showClock: v})} />
                            </SettingItem>
                            <SettingItem label="Clock Size">
                                <Slider min={2} max={12} step={0.5} value={settings.clockSize} onChange={v => setSettings({...settings, clockSize: v})} />
                            </SettingItem>
                            <SettingItem label="Font Weight">
                                <Select value={settings.clockWeight} options={[
                                    {val: '100', label: 'Thin'},
                                    {val: '300', label: 'Light'},
                                    {val: '400', label: 'Regular'},
                                    {val: '700', label: 'Bold'},
                                    {val: '900', label: 'Black'},
                                ]} onChange={v => setSettings({...settings, clockWeight: v})} />
                            </SettingItem>
                            <SettingItem label="24-Hour Mode">
                                <Toggle value={settings.use24Hour} onChange={v => setSettings({...settings, use24Hour: v})} />
                            </SettingItem>
                            <SettingItem label="Show Seconds">
                                <Toggle value={settings.showSeconds} onChange={v => setSettings({...settings, showSeconds: v})} />
                            </SettingItem>
                            <SettingItem label="Show Date">
                                <Toggle value={settings.showDate} onChange={v => setSettings({...settings, showDate: v})} />
                            </SettingItem>
                            <SettingItem label="Show Greeting">
                                <Toggle value={settings.showGreeting} onChange={v => setSettings({...settings, showGreeting: v})} />
                            </SettingItem>
                            <SettingItem label="Custom Greeting Name">
                                <input type="text" value={settings.customGreeting} onChange={e => setSettings({...settings, customGreeting: e.target.value})} placeholder="Leave blank for auto" className="w-32 bg-transparent border-b border-white/20 text-right outline-none text-sm focus:border-white/50 transition-colors" />
                            </SettingItem>
                        </SettingSection>

                        {/* Search Section */}
                        <SettingSection title="Search" icon={Search}>
                            <SettingItem label="Show Search">
                                <Toggle value={settings.showSearch} onChange={v => setSettings({...settings, showSearch: v})} />
                            </SettingItem>
                            <SettingItem label="Search Engine">
                                <Select value={settings.searchEngine} options={[
                                    {val: 'google', label: 'Google'},
                                    {val: 'bing', label: 'Bing'},
                                    {val: 'ddg', label: 'DuckDuckGo'},
                                    {val: 'youtube', label: 'YouTube'},
                                ]} onChange={v => setSettings({...settings, searchEngine: v})} />
                            </SettingItem>
                            <SettingItem label="Shape">
                                <Select value={settings.searchRoundness} options={[
                                    {val: 'none', label: 'Square'},
                                    {val: 'md', label: 'Rounded'},
                                    {val: 'full', label: 'Pill'},
                                ]} onChange={v => setSettings({...settings, searchRoundness: v})} />
                            </SettingItem>
                            <SettingItem label="Auto Focus">
                                <Toggle value={settings.autoFocusSearch} onChange={v => setSettings({...settings, autoFocusSearch: v})} />
                            </SettingItem>
                        </SettingSection>

                        {/* Grid Section */}
                        <SettingSection title="Grid & Shortcuts" icon={LayoutGrid}>
                            <SettingItem label="Icon Size">
                                <Slider min={60} max={150} step={10} value={settings.shortcutSize} onChange={v => setSettings({...settings, shortcutSize: v})} />
                            </SettingItem>
                            <SettingItem label="Grid Gap">
                                <Slider min={10} max={50} step={5} value={settings.shortcutGap} onChange={v => setSettings({...settings, shortcutGap: v})} />
                            </SettingItem>
                            <SettingItem label="Show Labels">
                                <Toggle value={settings.showLabels} onChange={v => setSettings({...settings, showLabels: v})} />
                            </SettingItem>
                            <SettingItem label="Open in New Tab">
                                <Toggle value={settings.openNewTab} onChange={v => setSettings({...settings, openNewTab: v})} />
                            </SettingItem>
                        </SettingSection>

                        {/* Danger Zone */}
                        <div className="mt-8 pt-6 border-t border-red-500/20">
                            <button onClick={() => { if(confirm('Reset all settings to default?')) setSettings(defaultSettings); }} className="w-full py-3 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-bold flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> RESET TO DEFAULTS
                            </button>
                        </div>
                        <div className="h-10"></div> {/* Padding for scroll */}
                    </div>
                </div>
            )}

            {/* Add Shortcut Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-enter">
                    <div className="p-8 rounded-2xl w-full max-w-md relative border border-white/10 shadow-2xl text-white" style={{ background: '#111' }}>
                        <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-light mb-6">Add Shortcut</h3>
                        <form onSubmit={addShortcut} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Name</label>
                                <input type="text" className="w-full p-3 rounded-xl text-white outline-none bg-white/5 focus:bg-white/10 transition-colors" placeholder="e.g., Reddit" value={newShortcut.name} onChange={e => setNewShortcut({...newShortcut, name: e.target.value})} autoFocus />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">URL</label>
                                <input type="text" className="w-full p-3 rounded-xl text-white outline-none bg-white/5 focus:bg-white/10 transition-colors" placeholder="reddit.com" value={newShortcut.url} onChange={e => setNewShortcut({...newShortcut, url: e.target.value})} />
                            </div>
                            <button type="submit" className="mt-4 text-white py-3 rounded-xl font-medium hover:brightness-110 transition-all" style={{ backgroundColor: settings.accentColor }}>Add to Dashboard</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
