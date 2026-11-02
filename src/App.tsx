import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   🎬 Motion & animation primitives
   ============================================================ */

/** Scroll-reveal wrapper — fades/floats content in as it enters the viewport */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(32px)',
        transition: `opacity 0.85s ease ${delay}ms, transform 0.85s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/** Animated number counter that runs when scrolled into view */
const Counter: React.FC<{ to: number; suffix?: string; prefix?: string; duration?: number }> = ({
  to,
  suffix = '',
  prefix = '',
  duration = 1500,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setValue(to);
      return;
    }
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ============================================================
   📱 Live-tracking phone mockup (SVG route with moving vehicle)
   ============================================================ */

const ROUTE = 'M 70 520 C 120 470, 90 420, 120 380 C 160 330, 210 350, 230 300 C 250 250, 200 210, 190 160';

const PhoneMockup = () => (
  <div className="relative animate-float">
    <div className="absolute -inset-8 bg-easygo-velocity/25 rounded-[4rem] blur-3xl"></div>
    <div className="relative w-[290px] sm:w-[320px] bg-easygo-night rounded-[3rem] p-3 shadow-2xl shadow-easygo-primary/40 border border-easygo-neon/20 mx-auto">
      <div className="relative overflow-hidden rounded-[2.4rem] bg-[#04150C] h-[560px]">
        {/* Screen: map streets */}
        <svg viewBox="0 0 320 560" className="absolute inset-0 w-full h-full" aria-hidden="true">
          {/* streets */}
          {[
            'M0 80 H320', 'M0 160 H320', 'M0 240 H320', 'M0 380 H320', 'M0 460 H320',
            'M40 0 V560', 'M110 0 V560', 'M180 0 V560', 'M280 0 V560',
          ].map((d, i) => (
            <path key={i} d={d} stroke="#0E6C45" strokeOpacity="0.18" strokeWidth="6" fill="none" />
          ))}
          {/* blocks */}
          <rect x="120" y="170" width="50" height="60" rx="6" fill="#0E6C45" fillOpacity="0.08" />
          <rect x="190" y="390" width="70" height="55" rx="6" fill="#0E6C45" fillOpacity="0.08" />
          <rect x="50" y="270" width="45" height="90" rx="6" fill="#0E6C45" fillOpacity="0.08" />

          {/* route */}
          <path d={ROUTE} stroke="#00E676" strokeOpacity="0.25" strokeWidth="10" fill="none" strokeLinecap="round" />
          <path
            d={ROUTE}
            stroke="#6CF8BB"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="10 8"
            className="route-dash"
          />

          {/* destination pin */}
          <g transform="translate(190 160)">
            <circle r="16" fill="#00E676" fillOpacity="0.15">
              <animate attributeName="r" values="8;18;8" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.35;0;0.35" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle r="7" fill="#00E676" />
          </g>

          {/* pickup dot */}
          <circle cx="70" cy="520" r="7" fill="#FFFFFF" stroke="#6CF8BB" strokeWidth="3" />

          {/* moving vehicle */}
          <g>
            <circle r="9" fill="#ffffff" />
            <circle r="5" fill="#005232" />
            <animateMotion dur="7s" repeatCount="indefinite" path={ROUTE} rotate="auto" />
          </g>
        </svg>

        {/* HUD chips */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-easygo-pulse"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-easygo-pulse"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/90">OFFICIAL RADAR</span>
          </div>
          <div className="bg-easygo-pulse text-easygo-primary text-[11px] font-black rounded-full px-3 py-1.5 shadow-lg">
            3 min away
          </div>
        </div>

        {/* Driver sheet */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
              alt="Verified driver"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-easygo-velocity"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-easygo-ink truncate">Mohamed K. · Verified</div>
              <div className="text-xs text-easygo-secondaryText">Keh Keh · Red Plate · ★ 4.98</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-easygo-successBg text-easygo-successFg flex items-center justify-center text-sm shrink-0 font-bold" title="SLRSA Verified Driver">
              🛡️
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-easygo-mist rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-easygo-velocity to-easygo-pulse rounded-full animate-float-slow"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating chips around the phone */}
    <div className="absolute -left-8 md:-left-16 top-24 bg-white p-4 rounded-2xl shadow-2xl border border-easygo-line animate-float-slow hidden sm:block">
      <div className="text-[10px] font-bold uppercase tracking-widest text-easygo-secondaryText">SOS · Safety Shield</div>
      <div className="flex items-center gap-1.5 text-easygo-velocity font-black text-sm mt-1">
        <span className="w-2 h-2 rounded-full bg-easygo-velocity animate-ping"></span>
        Protected Trip
      </div>
    </div>
    <div className="absolute -right-6 md:-right-12 bottom-40 bg-easygo-primary text-white p-4 rounded-2xl shadow-2xl animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
      <div className="font-display text-xl font-bold">NLe 25</div>
      <div className="text-[10px] text-white/70 uppercase tracking-widest">Locked Fare Upfront</div>
    </div>
  </div>
);

/* ============================================================
   💬 Testimonials data
   ============================================================ */

const TESTIMONIALS = [
  {
    quote: "As a Keh Keh rider, I've waited hours at the stand. EasyGo means less time chasing, more time earning. Can't wait for the official rollout!",
    name: 'Ibrahim Sesay',
    role: 'Founding Driver Partner, Lumley',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: "Booking a ride and knowing the fare up front — with SOS built in — is peace of mind my family has always needed in Freetown.",
    name: 'Fatmata Bangura',
    role: 'Beta Rider, Aberdeen',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: "Orange Money in, ride out. No argument over change, no loose coins, just an instant receipt. This is the future of Sierra Leone transit.",
    name: 'Aminata Kanu',
    role: 'Early Passenger, Congo Cross',
    img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80',
  },
];

/* ============================================================
   ✳️ FAQ data
   ============================================================ */

const FAQS = [
  {
    q: 'When is the official EasyGo launch in Freetown?',
    a: "The official launch is coming very soon! We are completing final fleet partner verification and regulator coordination across Freetown. Pre-registered passengers and drivers will receive immediate priority access as soon as the official app is released on iOS & Android.",
  },
  {
    q: 'Can I download the official EasyGo app right now?',
    a: 'The apps are currently in closed pilot testing with verified driver partners in Aberdeen, Lumley, and Congo Cross. Pre-register on this page with your phone or email, and we will send you the direct download link and VIP launch credits the moment it goes live on the App Store and Google Play.',
  },
  {
    q: 'How do I pre-register as a Driver Partner before the official launch?',
    a: 'Switch the toggle in our Pre-Registration section above to "Driver Partner", enter your details and vehicle type (Keh Keh, Bike, or Comfort Car). Founding drivers who join before official launch enjoy 0% commission for their first 30 days and an official EasyGo starter pack.',
  },
  {
    q: 'How are payments handled on the official platform?',
    a: 'EasyGo natively supports Orange Money, AfriMoney, cash, and the integrated in-app EasyGo Wallet. You see the transparent, fixed fare before requesting the ride, with automatic digital receipts.',
  },
  {
    q: 'What safety features are active on official launch day?',
    a: 'Every single driver undergoes in-person SLRSA license and vehicle verification. Every trip is monitored in real-time with GPS telemetry, and our one-tap emergency SOS button connects directly to our 24/7 Freetown operations dispatch team.',
  },
];

/* ============================================================
   📄 Static Navigation & Content
   ============================================================ */

const NAV_LINKS = [
  { label: 'Vision', href: '#vision' },
  { label: 'Official Apps', href: '#apps' },
  { label: 'Launch Roadmap', href: '#roadmap' },
  { label: 'Live Experience', href: '#experience' },
  { label: 'Payments', href: '#payments' },
  { label: 'FAQ', href: '#faq' },
];

const MARQUEE_ITEMS = [
  'OFFICIAL LAUNCH COMING VERY SOON 🇸🇱',
  'PRE-REGISTER FOR VIP ACCESS',
  'KEH KEH RIDES',
  'COMFORT CARS',
  'ORANGE MONEY & AFRIMONEY',
  'ONE-TAP SOS DISPATCH',
  'ZERO CASH FRICTION',
  'FOUNDING DRIVER SLOTS OPEN',
  'BUILT FOR FREETOWN',
];

const NUMBERS = [
  { to: 1000, suffix: '+', label: 'Drivers pre-registered in Freetown' },
  { to: 15, suffix: '+', label: 'Corridors ready for launch rollout' },
  { to: 3, suffix: '', label: 'Ride classes: Keh Keh, Bike, Comfort' },
  { to: 100, suffix: '%', label: 'Verified background & vehicle checks' },
];

const LAUNCH_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Core Engine & Safety Architecture',
    desc: 'Dispatcher infrastructure, SOS emergency protocols, and localized Freetown tariff calculation fully completed.',
    status: 'Completed',
    statusBadge: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    icon: '✅',
  },
  {
    phase: 'Phase 2',
    title: 'Fleet & Driver Onboarding in Freetown',
    desc: 'In-person documentation, vehicle inspection, and training for Keh Keh and car driver partners across Aberdeen, Lumley, and Central.',
    status: 'Active Now',
    statusBadge: 'bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold animate-pulse',
    icon: '⚡',
  },
  {
    phase: 'Phase 3',
    title: 'Official Public Launch & App Store Drop',
    desc: 'Official EasyGo Passenger and Driver apps release publicly on the Apple App Store and Google Play. VIP waitlist members get first ride perks.',
    status: 'Coming Very Soon 🚀',
    statusBadge: 'bg-easygo-velocity/20 text-easygo-velocity border-easygo-velocity/40 font-black',
    icon: '🎉',
    highlight: true,
  },
  {
    phase: 'Phase 4',
    title: 'Greater Western Area Corridor Expansion',
    desc: 'Extending network coverage to Waterloo, Jui, Hastings, and long-distance intercity transit corridors.',
    status: 'Scheduled',
    statusBadge: 'bg-slate-200 text-slate-600 border-slate-300',
    icon: '📍',
  },
];

const ROLES = [
  {
    role: 'Passenger App',
    badge: 'Official App Store & Play Store',
    headline: 'Ride with total certainty',
    color: 'bg-easygo-container',
    tag: 'Official Launching Soon',
    features: [
      'Instant Keh Keh & Comfort Car hailing',
      'Guaranteed locked fares before you board',
      'One-tap SOS safety monitored 24/7',
      'Direct Orange Money, AfriMoney & Cash',
    ],
  },
  {
    role: 'Driver Partner App',
    badge: 'EasyGo Riders',
    headline: 'Earn with pride and dignity',
    color: 'bg-easygo-velocity',
    tag: 'Pre-Registration Open',
    features: [
      'High fare retention with 0% launch commission',
      'Instant ride notifications heading your route',
      'Direct weekly Orange Money / AfriMoney payouts',
      'Official verified driver badge & credentials',
    ],
  },
  {
    role: 'Operations Admin',
    badge: 'Fleet Intelligence',
    headline: 'City-wide network command',
    color: 'bg-easygo-night',
    tag: 'Ready for Operations',
    features: [
      'Live fleet telemetry and emergency SOS dispatch',
      'Freetown demand heatmaps & route monitoring',
      'Driver compliance & verification pipeline',
      'Automated financial settlement & reporting',
    ],
  },
];

const VISION_CARDS = [
  {
    title: 'Deeply Local to Sierra Leone',
    desc: 'Tuned specifically to the terrain and culture of Freetown — Keh Keh culture, local street geography, and native Sierra Leone Leone (NLe) pricing.',
    icon: '📍',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Human Safety from Day One',
    desc: 'Safety is our bedrock. In-app SOS button, verified driver identities, and real-time trip sharing with family ensure you ride with total confidence.',
    icon: '🛡️',
    img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Empowering Driver Dignity',
    desc: 'Drivers are respected founding partners. We provide higher take-home pay, transparent accounting, and support so they grow sustainable businesses.',
    icon: '🤝',
    img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
  },
];

const PAYMENTS = [
  { name: 'Orange Money', color: '#FF6600', desc: 'Instant ride payments and wallet top-ups directly from your Orange Money balance.' },
  { name: 'AfriMoney', color: '#ED1C24', desc: 'Fast, secure mobile wallet payments directly connected to your Africell line.' },
  { name: 'EasyGo Wallet', color: '#10B981', desc: 'In-app digital balance with automated deduction, trip receipts, and bonus cashback.' },
  { name: 'Cash', color: '#0E6C45', desc: 'Cash is integral to Freetown life. Every driver partner happily accepts exact or standard cash.' },
];

/* ============================================================
   🖥️ Main Landing Page Component
   ============================================================ */

const LandingPage: React.FC = () => {
  // Pre-registration state
  const [userRole, setUserRole] = useState<'rider' | 'driver'>('rider');
  const [contact, setContact] = useState('');
  const [fullName, setFullName] = useState('');
  const [neighborhood, setNeighborhood] = useState('Aberdeen');
  const [vehicleType, setVehicleType] = useState('Keh Keh');
  const [submitted, setSubmitted] = useState(false);
  const [passId, setPassId] = useState('');

  // Investor form state
  const [investorName, setInvestorName] = useState('');
  const [investorOrg, setInvestorOrg] = useState('');
  const [investorNote, setInvestorNote] = useState('');
  const [invested, setInvested] = useState(false);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Testimonial rotator
  useEffect(() => {
    const id = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);

  const handlePreRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setPassId(`EG-2026-${userRole === 'rider' ? 'VIP' : 'DVR'}-${randomCode}`);
    setSubmitted(true);
  };

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    setInvested(true);
  };

  const active = TESTIMONIALS[tIdx];

  return (
    <div className="min-h-screen bg-white text-easygo-ink selection:bg-easygo-neon selection:text-easygo-primary font-sans overflow-x-hidden">
      {/* ============================================================
          🚨 TOP ANNOUNCEMENT RIBBON: OFFICIAL LAUNCH COMING VERY SOON
          ============================================================ */}
      <div className="bg-gradient-to-r from-easygo-deep via-easygo-primary to-easygo-heroTo text-white text-xs sm:text-sm py-2.5 px-4 sticky top-0 z-[60] border-b border-easygo-pulse/30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-easygo-pulse opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-easygo-pulse"></span>
            </span>
            <span className="font-semibold tracking-wide truncate">
              <strong className="text-easygo-neon font-black uppercase tracking-wider mr-1.5">Official Launch Notice:</strong>
              The official EasyGo platform is coming very soon to Freetown! Pre-registration is now open.
            </span>
          </div>
          <a
            href="#pre-register"
            className="hidden md:inline-flex items-center gap-1.5 bg-easygo-neon text-easygo-primary px-3 py-1 rounded-full text-xs font-bold hover:bg-white transition-all shrink-0 active:scale-95 shadow-sm"
          >
            Claim VIP Spot →
          </a>
        </div>
      </div>

      {/* ============================================================
          🧭 NAVIGATION
          ============================================================ */}
      <nav className="sticky top-[41px] z-50 backdrop-blur-md bg-white/90 border-b border-easygo-line shadow-sm transition-all">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 bg-easygo-primary rounded-xl flex items-center justify-center text-easygo-neon font-black transition-all group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-easygo-velocity/40 font-display text-lg">
              EG
            </div>
            <div className="flex flex-col">
              <span className="text-easygo-primary font-display font-black text-xl tracking-tight leading-none">
                EasyGo
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-easygo-velocity">
                Official Launching Soon 🇸🇱
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-easygo-secondaryText">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative hover:text-easygo-primary transition-colors py-1 after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-easygo-velocity after:rounded-full after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="#pre-register"
              className="hidden sm:inline-flex items-center gap-2 bg-easygo-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-easygo-container hover:shadow-lg hover:shadow-easygo-primary/30 hover:scale-105 transition-all active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-easygo-pulse animate-pulse"></span>
              Pre-Register Free
            </a>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-easygo-ink hover:bg-easygo-mist transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-easygo-line px-6 py-6 shadow-xl animate-fade-up">
            <div className="flex flex-col gap-4 text-base font-medium text-easygo-secondaryText">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-easygo-primary py-2 border-b border-slate-100 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#pre-register"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full text-center bg-easygo-velocity text-white py-3 rounded-xl font-bold shadow-md"
              >
                Pre-Register for Official Launch 🚀
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================
          🌟 HERO SECTION: THE OFFICIAL LAUNCH IS COMING VERY SOON
          ============================================================ */}
      <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-br from-easygo-heroFrom via-easygo-secondary to-easygo-heroTo animate-gradient text-white">
        <div className="glow-orb w-[36rem] h-[36rem] bg-easygo-velocity/30 top-[-10%] right-[-10%] animate-glow-pulse"></div>
        <div className="glow-orb w-[28rem] h-[28rem] bg-easygo-pulse/20 bottom-[-20%] left-[-5%] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Floating telemetry pills */}
        <div className="absolute top-28 right-[10%] hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 animate-float shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-easygo-pulse animate-pulse"></div>
          <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Aberdeen & Lumley · Fleet Primed</span>
        </div>
        <div className="absolute top-52 right-[4%] hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 animate-float-slow shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-easygo-gold"></div>
          <span className="text-xs font-bold text-white/90 uppercase tracking-widest">1,000+ Drivers in Pre-Launch Queue</span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Pitch */}
            <div className="lg:col-span-7">
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 text-xs sm:text-sm font-extrabold tracking-wider uppercase bg-easygo-neon/15 text-easygo-neon rounded-full border border-easygo-neon/40 shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-easygo-pulse opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-easygo-pulse"></span>
                </span>
                <span>The Official Platform is Coming Very Soon 🇸🇱</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.08] mb-6 tracking-tight">
                The Official Transit Network for <span className="text-gradient-neon animate-gradient">Freetown</span> is Almost Here.
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-2xl leading-relaxed">
                We are building the definitive ride-hailing and mobility experience for Sierra Leone. From reliable Keh Keh hailing and Comfort Cars to in-app SOS safety and instant Mobile Money payments — the official launch is coming very soon.
              </p>

              {/* Official Store Badges (Teaser) */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-sm">
                  {/* Apple Icon */}
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.67 1.37-.58.66-1.1 1.73-.96 2.76 1.03.08 2.08-.53 2.71-1.28z" />
                  </svg>
                  <div>
                    <div className="text-[10px] text-white/60 uppercase font-semibold leading-none">Official iOS App</div>
                    <div className="text-xs font-bold text-white leading-tight mt-0.5">App Store · Coming Very Soon</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-sm">
                  {/* Google Play Icon */}
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 01-.61-1.61V3.424c0-.62.227-1.19.609-1.61zm11.233 11.234l2.48 2.48-11.83 6.84 9.35-9.32zm0-2.096L5.49 1.632l11.832 6.84-2.48 2.48zm1.486 1.048l3.14 1.816a1.44 1.44 0 010 2.496l-3.14 1.816-1.74-1.74 1.74-2.388z" />
                  </svg>
                  <div>
                    <div className="text-[10px] text-white/60 uppercase font-semibold leading-none">Official Android App</div>
                    <div className="text-xs font-bold text-white leading-tight mt-0.5">Google Play · Coming Very Soon</div>
                  </div>
                </div>
              </div>

              {/* Quick stats badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { value: <Counter to={1000} suffix="+" />, label: 'Pre-Registered Drivers' },
                  { value: <Counter to={100} suffix="%" />, label: 'Verified Vehicle Checks' },
                  { value: <Counter to={24} suffix="/7" />, label: 'In-App SOS Protection' },
                  { value: <Counter to={15} suffix="+" />, label: 'Launch Corridors' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 hover:bg-white/15 transition-all">
                    <div className="font-display text-2xl font-bold text-easygo-neon mb-0.5">{s.value}</div>
                    <div className="text-[11px] font-medium text-white/75 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Pre-Registration VIP Pass Form */}
            <div id="pre-register" className="lg:col-span-5">
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 text-easygo-ink shadow-2xl border-2 border-easygo-neon/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-easygo-neon to-easygo-velocity text-easygo-primary font-black text-[10px] tracking-wider uppercase py-1 px-4 rounded-bl-xl shadow-sm">
                  Official Launch VIP Pass
                </div>

                {!submitted ? (
                  <div>
                    <div className="mb-6">
                      <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-1">
                        Pre-Register Today
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-easygo-ink">
                        Reserve Your Launch Access
                      </h2>
                      <p className="text-xs sm:text-sm text-easygo-secondaryText mt-1">
                        Be among the first to ride or drive when the official app drops.
                      </p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="flex bg-easygo-mist p-1 rounded-2xl mb-5 border border-easygo-line">
                      <button
                        type="button"
                        onClick={() => setUserRole('rider')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          userRole === 'rider'
                            ? 'bg-easygo-primary text-white shadow-md'
                            : 'text-easygo-secondaryText hover:text-easygo-ink'
                        }`}
                      >
                        <span>🎒</span> I Want to Ride (Passenger)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole('driver')}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          userRole === 'driver'
                            ? 'bg-easygo-velocity text-white shadow-md'
                            : 'text-easygo-secondaryText hover:text-easygo-ink'
                        }`}
                      >
                        <span>🛺</span> I Want to Drive (Partner)
                      </button>
                    </div>

                    {/* Perk callout */}
                    <div className="bg-easygo-successBg border border-easygo-velocity/30 rounded-xl p-3 mb-5 text-xs text-easygo-successFg font-medium flex items-center gap-2">
                      <span className="text-base">🎁</span>
                      {userRole === 'rider' ? (
                        <span>
                          <strong>Passenger Launch Perk:</strong> 20% OFF your first 3 official rides + priority matching.
                        </span>
                      ) : (
                        <span>
                          <strong>Driver Launch Perk:</strong> 0% commission for your first 30 days + verified founding badge.
                        </span>
                      )}
                    </div>

                    <form onSubmit={handlePreRegister} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-easygo-secondaryText mb-1.5 ml-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Samuel Koroma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-4 py-3 text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:bg-white transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-easygo-secondaryText mb-1.5 ml-1">
                          Phone Number or Email (Orange / Africell)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="+232 76 000 000 or you@email.com"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-4 py-3 text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:bg-white transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-easygo-secondaryText mb-1.5 ml-1">
                            Primary Area
                          </label>
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-3 py-3 text-xs sm:text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:bg-white"
                          >
                            <option value="Aberdeen">Aberdeen</option>
                            <option value="Lumley">Lumley</option>
                            <option value="Congo Cross">Congo Cross</option>
                            <option value="Wilberforce">Wilberforce</option>
                            <option value="Central Freetown">Central Freetown</option>
                            <option value="Fourah Bay">Fourah Bay</option>
                            <option value="Kissy">Kissy</option>
                            <option value="Goderich">Goderich</option>
                          </select>
                        </div>

                        {userRole === 'driver' ? (
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-easygo-secondaryText mb-1.5 ml-1">
                              Vehicle Type
                            </label>
                            <select
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                              className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-3 py-3 text-xs sm:text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:bg-white"
                            >
                              <option value="Keh Keh">Keh Keh (Tricycle)</option>
                              <option value="Comfort Car">Comfort Car (Sedan)</option>
                              <option value="Express Bike">Express Bike</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-easygo-secondaryText mb-1.5 ml-1">
                              Preferred Ride
                            </label>
                            <select
                              defaultValue="Keh Keh"
                              className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-3 py-3 text-xs sm:text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:bg-white"
                            >
                              <option value="Keh Keh">Keh Keh</option>
                              <option value="Comfort Car">Comfort Car</option>
                              <option value="Any Available">Any Available</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-2 bg-easygo-primary hover:bg-easygo-container text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-easygo-primary/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>🚀</span>
                        {userRole === 'rider'
                          ? 'Get Official VIP Rider Access'
                          : 'Pre-Register as Founding Driver'}
                      </button>

                      <p className="text-[11px] text-center text-easygo-mutedText">
                        🔒 No payment required. You will be notified the moment the official app drops.
                      </p>
                    </form>
                  </div>
                ) : (
                  /* ================= CONFIRMATION VIP PASS ================= */
                  <div className="text-center py-4 animate-fade-up">
                    <div className="w-16 h-16 bg-easygo-successBg text-easygo-velocity rounded-full flex items-center justify-center text-3xl mx-auto mb-4 ring-8 ring-easygo-successBg/50">
                      ✓
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-easygo-velocity">
                      Official Pre-Registration Confirmed
                    </span>
                    <h3 className="font-display text-2xl font-bold text-easygo-ink mt-1 mb-2">
                      Welcome to the EasyGo Inner Circle!
                    </h3>
                    <p className="text-xs sm:text-sm text-easygo-secondaryText mb-6 max-w-sm mx-auto">
                      Thank you, <strong>{fullName || 'Friend'}</strong>. Your official launch reservation is secured. We will text or email you your direct download link when the app goes live.
                    </p>

                    {/* Visual VIP Pass Badge */}
                    <div className="bg-gradient-to-br from-easygo-primary to-easygo-deep text-white p-5 rounded-2xl text-left shadow-xl border border-easygo-neon/30 relative overflow-hidden mb-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-[10px] text-easygo-neon font-mono uppercase tracking-widest">
                            {userRole === 'rider' ? 'PASSENGER VIP PASS' : 'FOUNDING DRIVER PASS'}
                          </div>
                          <div className="font-display text-lg font-bold">{fullName || 'VIP Member'}</div>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-easygo-neon text-xs">
                          EG
                        </div>
                      </div>
                      <div className="flex justify-between items-end border-t border-white/15 pt-3 text-xs">
                        <div>
                          <div className="text-[10px] text-white/50 uppercase">Access Code</div>
                          <div className="font-mono font-bold text-easygo-neon">{passId}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-white/50 uppercase">Launch Area</div>
                          <div className="font-semibold text-white">{neighborhood}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-easygo-velocity hover:underline"
                    >
                      ← Register another passenger or driver
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ⚡ MARQUEE STRIP
          ============================================================ */}
      <div className="bg-easygo-night text-easygo-mint py-3.5 overflow-hidden border-y border-easygo-container group/mq">
        <div className="flex whitespace-nowrap animate-marquee w-max group-hover/mq:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {MARQUEE_ITEMS.map((item, idx) => (
                <span key={`${dup}-${idx}`} className="flex items-center text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
                  <span className="px-6">{item}</span>
                  <span className="text-easygo-pulse">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          📊 KEY NUMBERS BAND
          ============================================================ */}
      <section className="py-14 px-6 bg-white border-b border-easygo-line">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {NUMBERS.map((n, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="font-display text-4xl sm:text-5xl font-bold text-easygo-primary tracking-tight">
                <Counter to={n.to} suffix={n.suffix} />
              </div>
              <div className="mt-2 text-xs sm:text-sm font-medium text-easygo-secondaryText">{n.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================================================
          🚀 OFFICIAL LAUNCH ROADMAP: WHERE WE ARE
          ============================================================ */}
      <section id="roadmap" className="py-24 px-6 bg-white border-b border-easygo-line">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 text-xs font-bold uppercase tracking-widest text-easygo-velocity bg-easygo-velocity/10 rounded-full border border-easygo-velocity/20">
              Launch Timeline
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-easygo-ink">
              The Path to the <span className="text-easygo-velocity">Official Launch</span>
            </h2>
            <p className="text-easygo-secondaryText max-w-2xl mx-auto text-base sm:text-lg mt-3 leading-relaxed">
              We are in the final countdown before public availability. Here is how we are transitioning from driver onboarding to full city-wide launch.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-6">
            {LAUNCH_PHASES.map((p, i) => (
              <Reveal key={i} delay={i * 120}>
                <div
                  className={`h-full rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between ${
                    p.highlight
                      ? 'bg-gradient-to-b from-easygo-mist to-white border-easygo-velocity shadow-xl shadow-easygo-velocity/10 ring-2 ring-easygo-velocity/20 -translate-y-1'
                      : 'bg-white border-easygo-line shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{p.icon}</span>
                      <span className={`text-[11px] px-3 py-1 rounded-full border uppercase tracking-wider ${p.statusBadge}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-easygo-mutedText uppercase tracking-widest mb-1">
                      {p.phase}
                    </div>
                    <h3 className="font-display text-lg font-bold text-easygo-ink mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-easygo-secondaryText leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  {p.highlight && (
                    <div className="mt-5 pt-4 border-t border-easygo-line/60">
                      <a
                        href="#pre-register"
                        className="text-xs font-bold text-easygo-velocity flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Get VIP Access For This Phase →
                      </a>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          📱 THE 3 OFFICIAL APPS (ECOSYSTEM)
          ============================================================ */}
      <section id="apps" className="py-28 px-6 bg-easygo-mist">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-3">
                The Network Architecture
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-easygo-ink">
                Three Official Apps.<br />One Unified Platform.
              </h2>
              <p className="text-easygo-secondaryText text-base sm:text-lg mt-3 leading-relaxed">
                When a passenger taps request, the nearest verified driver is matched, and our central operations console monitors the route for absolute safety.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-easygo-line shadow-sm text-xs font-bold text-easygo-primary">
              <span className="w-2 h-2 rounded-full bg-easygo-pulse animate-pulse"></span>
              All 3 Native Surfaces Coming Soon
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {ROLES.map((app, i) => (
              <Reveal key={app.role} delay={i * 130}>
                <div className="group relative p-8 rounded-[2rem] bg-white border border-easygo-line shadow-sm hover:shadow-xl hover:shadow-easygo-velocity/10 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 ${app.color} rounded-2xl shadow-lg transform transition-transform group-hover:rotate-12 group-hover:scale-110 flex items-center justify-center text-white font-bold text-xl font-display`}>
                        {app.role[0]}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-easygo-mist text-easygo-primary rounded-full border border-easygo-line">
                        {app.tag}
                      </span>
                    </div>

                    <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-1.5">
                      {app.badge}
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-6 text-easygo-ink">
                      {app.headline}
                    </h3>

                    <ul className="space-y-3.5 mb-8">
                      {app.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-3 text-easygo-secondaryText group-hover:text-easygo-ink transition-colors text-sm">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-easygo-successBg text-easygo-successFg flex items-center justify-center text-[10px] font-bold shrink-0">
                            ✓
                          </span>
                          <span className="leading-snug">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#pre-register"
                    className="w-full text-center py-3 rounded-xl border border-easygo-primary/20 text-easygo-primary font-bold text-xs hover:bg-easygo-primary hover:text-white transition-all"
                  >
                    Pre-Register For {app.role.split(' ')[0]} →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          📸 OFFICIAL CAMPAIGN PREVIEW FLYERS SHOWCASE
          ============================================================ */}
      <section className="py-24 px-6 bg-white border-y border-easygo-line overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-2">
              Official Media Preview
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-easygo-ink">
              The Official Launch Campaign
            </h2>
            <p className="text-easygo-secondaryText max-w-xl mx-auto text-sm sm:text-base mt-2">
              Sneak peek of the official promotional campaign rolling out across Freetown transit stands and billboards.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Flyer 1 */}
            <Reveal delay={100}>
              <div className="bg-easygo-mist rounded-[2.5rem] p-4 sm:p-6 border border-easygo-line shadow-lg hover:shadow-2xl transition-all duration-500 group">
                <div className="overflow-hidden rounded-2xl bg-easygo-night relative aspect-[3/4] max-h-[500px] flex items-center justify-center">
                  <img
                    src="/assets/flyer1.jpeg"
                    alt="EasyGo Official Launch Flyer 1"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-xs font-bold uppercase tracking-widest bg-easygo-primary/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      Official Launching Soon 🇸🇱
                    </span>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <h4 className="font-display font-bold text-lg text-easygo-ink">Official Passenger Edition</h4>
                  <p className="text-xs text-easygo-secondaryText mt-1">
                    Safe, dignified, fixed-fare rides across Aberdeen, Lumley, and Central Freetown.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Flyer 2 */}
            <Reveal delay={200}>
              <div className="bg-easygo-mist rounded-[2.5rem] p-4 sm:p-6 border border-easygo-line shadow-lg hover:shadow-2xl transition-all duration-500 group">
                <div className="overflow-hidden rounded-2xl bg-easygo-night relative aspect-[3/4] max-h-[500px] flex items-center justify-center">
                  <img
                    src="/assets/fly2.jpeg"
                    alt="EasyGo Official Launch Flyer 2"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <span className="text-white text-xs font-bold uppercase tracking-widest bg-easygo-velocity/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white">
                      Driver Partner Onboarding Active
                    </span>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <h4 className="font-display font-bold text-lg text-easygo-ink">Official Driver Partner Edition</h4>
                  <p className="text-xs text-easygo-secondaryText mt-1">
                    Keep your hard-earned fares with zero commission for your first launch month.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================
          📱 LIVE EXPERIENCE (PHONE MOCKUP & RADAR)
          ============================================================ */ }
      <section id="experience" className="py-28 px-6 bg-easygo-mist overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal className="flex justify-center lg:justify-start">
            <PhoneMockup />
          </Reveal>

          <Reveal delay={150}>
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-3">
              The In-App Experience
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 tracking-tight text-easygo-ink">
              Watch your ride <span className="text-easygo-velocity">come alive.</span>
            </h2>
            <p className="text-easygo-secondaryText text-base sm:text-lg leading-relaxed mb-8">
              Live tracking isn't an afterthought — it's the core guarantee of the official EasyGo platform. See your verified Keh Keh or Comfort Car driver approach in real-time, with locked fares agreed before you step in.
            </p>
            <div className="space-y-5">
              {[
                { icon: '🛰️', title: 'Real-time GPS Tracking', desc: 'Pinpoint pickup and drop-off navigation tailored to Freetown streets.' },
                { icon: '🔒', title: 'Locked Upfront Pricing', desc: 'No bargaining or surprise surcharges. The price you see is the price you pay.' },
                { icon: '🚨', title: 'One-Tap SOS Protection', desc: 'Instant emergency alert button connects with our 24/7 dispatch control room.' },
                { icon: '🛡️', title: 'SLRSA & Police Verified Drivers', desc: 'Strict identity, vehicle, and background verification before any driver takes trips.' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-easygo-line shadow-sm flex items-center justify-center text-xl shrink-0 transition-all duration-300 group-hover:bg-easygo-velocity/10 group-hover:border-easygo-velocity/40 group-hover:-translate-y-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-bold text-easygo-ink text-sm sm:text-base mb-0.5">{f.title}</div>
                    <div className="text-xs sm:text-sm text-easygo-secondaryText leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          🌿 VISION & LOCAL PURPOSE
          ============================================================ */}
      <section id="vision" className="py-28 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-20">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-3">
              Rooted in Sierra Leone
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-4 tracking-tight text-easygo-ink">
              Driven by <span className="text-easygo-velocity">Purpose.</span>
            </h2>
            <p className="text-easygo-secondaryText max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              We believe transportation is a fundamental economic lifeline. EasyGo is built to replace uncertainty with trust and chaos with consistency.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-10">
            {VISION_CARDS.map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="group cursor-default">
                  <div className="mb-6 h-60 rounded-3xl overflow-hidden shadow-lg border-4 border-easygo-mist transition-all group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-easygo-velocity/20 duration-500">
                    <img
                      src={item.img}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                      alt={item.title}
                    />
                  </div>
                  <div className="text-3xl mb-3 transition-transform duration-500 group-hover:scale-125 inline-block">{item.icon}</div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold mb-2 text-easygo-ink group-hover:text-easygo-velocity transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-easygo-secondaryText text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          💳 PAYMENTS SECTION: BUILT FOR SIERRA LEONE
          ============================================================ */}
      <section id="payments" className="py-28 px-6 bg-easygo-mist">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-3">
              Seamless Financial Infrastructure
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 tracking-tight text-easygo-ink">
              Pay the way <span className="text-easygo-velocity">Freetown</span> pays.
            </h2>
            <p className="text-easygo-secondaryText text-base sm:text-lg leading-relaxed mb-8">
              Digital or cash — the official EasyGo platform integrates natively with Sierra Leone's trusted Mobile Money systems, alongside our smart in-app wallet and full cash support.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {PAYMENTS.map((p) => (
                <div
                  key={p.name}
                  className="bg-white rounded-2xl p-5 border border-easygo-line hover:border-easygo-velocity/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full transition-transform duration-300 group-hover:scale-[1.8] shadow-md"
                      style={{ backgroundColor: p.color }}
                    ></div>
                    <div className="font-bold text-easygo-ink text-sm sm:text-base">{p.name}</div>
                  </div>
                  <p className="text-xs sm:text-sm text-easygo-secondaryText leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* EasyGo Wallet Mockup */}
          <Reveal delay={150}>
            <div className="relative">
              <div className="absolute inset-4 bg-easygo-primary/10 rounded-[3rem] rotate-2"></div>
              <div className="relative bg-gradient-to-br from-easygo-heroFrom to-easygo-heroTo rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl animate-float-slow border border-easygo-neon/20">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-easygo-neon">
                    Official EasyGo Wallet
                  </div>
                  <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-easygo-mint">
                    Freetown, SL 🇸🇱
                  </span>
                </div>

                <div className="font-display text-4xl sm:text-5xl font-bold mb-1">NLe 48,250</div>
                <div className="text-white/60 text-xs sm:text-sm mb-8">Available Balance · Sierra Leone Leone</div>

                <div className="space-y-3">
                  {[
                    { label: 'Comfort Car · Wilberforce → Aberdeen', amount: '-NLe 85', time: 'Today' },
                    { label: 'Keh Keh · Lumley Roundabout', amount: '-NLe 25', time: 'Yesterday' },
                    { label: 'Orange Money Instant Top-up', amount: '+NLe 500', time: 'Monday' },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/15 transition-colors"
                    >
                      <div className="text-xs sm:text-sm text-white/90">{tx.label}</div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{tx.time}</div>
                        <div className={`font-bold text-xs sm:text-sm ${tx.amount.startsWith('+') ? 'text-easygo-neon' : 'text-white'}`}>
                          {tx.amount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between text-[10px] text-white/50 uppercase tracking-widest">
                  <span>Instant Mobile Settlement</span>
                  <span>SSL Encrypted</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================
          💬 EARLY VOICES & TESTIMONIALS
          ============================================================ */}
      <section className="py-28 px-6 max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-2">
            Early Feedback
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-easygo-ink">
            What Freetown is <span className="text-easygo-velocity">saying.</span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="relative bg-white rounded-[2.5rem] p-8 md:p-14 border border-easygo-line shadow-xl shadow-easygo-velocity/5 overflow-hidden">
            <div className="absolute -top-10 -left-2 font-display text-[12rem] leading-none text-easygo-mist select-none opacity-80 pointer-events-none">
              "
            </div>
            <div key={tIdx} style={{ animation: 'fade-up 0.5s ease both' }} className="relative z-10">
              <p className="text-lg sm:text-2xl font-medium text-easygo-ink leading-relaxed mb-8">
                {active.quote}
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={active.img}
                  alt={active.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-easygo-successBg"
                />
                <div>
                  <div className="font-bold text-easygo-ink text-base sm:text-lg">{active.name}</div>
                  <div className="text-xs sm:text-sm text-easygo-secondaryText">{active.role}</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-2 z-10">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTIdx(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    i === tIdx ? 'w-8 bg-easygo-velocity' : 'w-2.5 bg-easygo-line hover:bg-easygo-mutedText'
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============================================================
          ❓ FAQ ACCORDION (OFFICIAL LAUNCH SPECIFIC)
          ============================================================ */}
      <section id="faq" className="py-28 px-6 bg-easygo-mist">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-2">
              Frequently Asked Questions
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-easygo-ink">
              Official Launch Answers
            </h2>
          </Reveal>

          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-easygo-line overflow-hidden transition-shadow hover:shadow-md">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
                  >
                    <span className="font-bold text-easygo-ink pr-4 text-sm sm:text-base">{f.q}</span>
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full bg-easygo-mist flex items-center justify-center text-easygo-primary transition-transform duration-300 font-bold ${
                        openFaq === i ? 'rotate-45 bg-easygo-velocity text-white' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className="px-6 overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openFaq === i ? '240px' : '0', opacity: openFaq === i ? 1 : 0 }}
                  >
                    <p className="text-easygo-secondaryText text-sm leading-relaxed pb-6">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          🤝 STRATEGIC PARTNERS & INVESTORS
          ============================================================ */}
      <section id="investors" className="py-28 px-6 bg-gradient-to-br from-easygo-heroFrom via-easygo-secondary to-easygo-heroTo relative overflow-hidden text-white">
        <div className="glow-orb w-[28rem] h-[28rem] bg-easygo-pulse/25 top-[-10%] left-[-10%]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-20 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-wider bg-easygo-neon/15 text-easygo-neon rounded-full border border-easygo-neon/30">
              Partnerships & Growth
            </div>
            <h2 className="font-display text-3xl sm:text-6xl font-bold mb-6 tracking-tight">
              Shape the Future of Transit with <span className="text-gradient-neon">EasyGo.</span>
            </h2>
            <p className="text-white/80 text-base sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              We are moving towards the official launch in Freetown and looking for strategic fleet partners, corporate travel accounts, and investors.
            </p>
          </Reveal>

          {!invested ? (
            <Reveal delay={120}>
              <form onSubmit={handleInvest} className="bg-white p-6 sm:p-12 rounded-[2.5rem] shadow-2xl text-left max-w-2xl mx-auto text-easygo-ink">
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-1.5 ml-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={investorName}
                      onChange={(e) => setInvestorName(e.target.value)}
                      className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-4 py-3 text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-1.5 ml-1">
                      Organization / Firm
                    </label>
                    <input
                      type="text"
                      value={investorOrg}
                      onChange={(e) => setInvestorOrg(e.target.value)}
                      className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-4 py-3 text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity"
                      placeholder="Organization or Angel"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-1.5 ml-1">
                    Partnership Note
                  </label>
                  <textarea
                    rows={3}
                    value={investorNote}
                    onChange={(e) => setInvestorNote(e.target.value)}
                    className="w-full bg-easygo-mist border border-easygo-line rounded-xl px-4 py-3 text-sm text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity"
                    placeholder="Tell us how you would like to collaborate or partner with EasyGo..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-easygo-primary text-white font-bold py-4 rounded-xl hover:bg-easygo-container hover:scale-[1.01] transition-all uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-easygo-primary/30 active:scale-95"
                >
                  Request Official Partner Package →
                </button>
              </form>
            </Reveal>
          ) : (
            <div className="bg-white/10 border border-easygo-neon/40 backdrop-blur-md p-8 rounded-3xl max-w-xl mx-auto text-easygo-neon font-medium text-base animate-fade-up">
              🌍 Thank you! Our partnerships leadership team will reach out with the official brief shortly.
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          ⚓ FOOTER
          ============================================================ */}
      <footer className="py-16 px-6 bg-easygo-night text-center text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-2.5 mb-6 group cursor-pointer">
            <div className="w-10 h-10 bg-easygo-primary rounded-xl flex items-center justify-center text-easygo-neon font-black transition-transform group-hover:rotate-12">
              EG
            </div>
            <div className="font-display text-2xl font-bold">EasyGo</div>
          </div>

          <p className="text-white/70 text-xs sm:text-sm max-w-md mx-auto mb-8">
            The official human-centric mobility platform for Sierra Leone. Built for riders, driver partners, and cities.
          </p>

          <div className="flex justify-center flex-wrap gap-6 mb-8 text-xs sm:text-sm font-medium text-easygo-mutedText">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-easygo-neon transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-white/40 text-xs gap-4">
            <div>© 2026 EasyGo Mobility Sierra Leone Ltd. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-easygo-pulse"></span>
              <span>The Official Platform is Coming Very Soon · Freetown 🇸🇱</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
