import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   🎬 Motion primitives
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
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
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
        transform: visible ? 'none' : 'translateY(36px)',
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
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
  duration = 1600,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      { threshold: 0.4 }
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
    <div className="relative w-[290px] md:w-[320px] bg-easygo-night rounded-[3rem] p-3 shadow-2xl shadow-easygo-primary/40 border border-easygo-neon/20">
      <div className="relative overflow-hidden rounded-[2.4rem] bg-[#04150C] h-[560px]">
        {/* Screen: map */}
        <svg viewBox="0 0 320 560" className="absolute inset-0 w-full h-full">
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
          <path d={ROUTE} stroke="#6CF8BB" strokeWidth="3.5" fill="none" strokeLinecap="round"
            strokeDasharray="10 8" className="route-dash" />

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
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="ping-slow absolute inline-flex h-full w-full rounded-full bg-easygo-pulse"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-easygo-pulse"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-white/90">LIVE TRACKING</span>
          </div>
          <div className="bg-easygo-pulse text-easygo-primary text-[11px] font-black rounded-full px-3 py-1.5 shadow-lg">
            4 min
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
            <div className="w-9 h-9 rounded-xl bg-easygo-successBg text-easygo-successFg flex items-center justify-center text-sm shrink-0">🛡️</div>
          </div>
          <div className="mt-3 h-1.5 bg-easygo-mist rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-easygo-velocity to-easygo-pulse rounded-full animate-float-slow"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating chips around the phone */}
    <div className="absolute -left-16 top-24 bg-white p-4 rounded-2xl shadow-2xl border border-easygo-line animate-float-slow hidden md:block">
      <div className="text-[10px] font-bold uppercase tracking-widest text-easygo-secondaryText">SOS · Armed</div>
      <div className="flex items-center gap-1 text-easygo-velocity font-black text-sm mt-1">● Protected</div>
    </div>
    <div className="absolute -right-12 bottom-40 bg-easygo-primary text-white p-4 rounded-2xl shadow-2xl animate-float hidden md:block" style={{ animationDelay: '1s' }}>
      <div className="font-display text-xl font-bold">NLe 25</div>
      <div className="text-[10px] text-white/70 uppercase tracking-widest">Fare locked</div>
    </div>
  </div>
);

/* ============================================================
   💬 Testimonials carousel
   ============================================================ */

const TESTIMONIALS = [
  {
    quote: "As a Keh Keh rider, I've waited hours at the stand. EasyGo means less time chasing, more time earning.",
    name: 'Ibrahim Sesay',
    role: 'Driver Partner, Freetown',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: "Booking a ride and knowing the fare up front — with SOS built in — is peace of mind my family finally has.",
    name: 'Fatmata Bangura',
    role: 'Rider, Aberdeen',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  },
  {
    quote: "Orange Money in, ride out. No argument over change, no loose coins, just a receipt. This is dignity.",
    name: 'Aminata Kanu',
    role: 'Rider, Congo Cross',
    img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=100&q=80',
  },
];

/* ============================================================
   ✳️ FAQ accordion
   ============================================================ */

const FAQS = [
  {
    q: 'When does EasyGo launch?',
    a: "We're onboarding our first driver partners and neighborhoods in Freetown now, with public beta rollout following shortly. Join the list above and you'll be the first to ride.",
  },
  {
    q: 'How are payments handled?',
    a: 'Every ride accepts Orange Money, AfriMoney, cash, or your in-app EasyGo Wallet. Fares are shown up front and receipts are automatic.',
  },
  {
    q: 'How do you keep riders safe?',
    a: 'All drivers pass verified onboarding, every trip is tracked live, and a one-tap SOS connects to emergency support from any screen in the app.',
  },
  {
    q: 'What do drivers earn?',
    a: "Drivers keep a market-leading share of every fare, see earnings in real time, and receive weekly payouts to their Mobile Money accounts.",
  },
];

/* ============================================================
   📄 Static content data
   ============================================================ */

const NAV_LINKS = [
  { label: 'Vision', href: '#vision' },
  { label: 'The Network', href: '#ecosystem' },
  { label: 'Experience', href: '#experience' },
  { label: 'Payments', href: '#payments' },
  { label: 'Investors', href: '#investors' },
];

const MARQUEE_ITEMS = [
  'KEH KEH RIDES', 'COMFORT CARS', 'DIGITAL WALLET', 'ONE-TAP SOS',
  'ZERO CASH FRICTION', 'DRIVER PARTNERSHIPS', 'FLEET INTELLIGENCE', 'BUILT FOR FREETOWN',
];

const NUMBERS = [
  { to: 1000, suffix: '+', label: 'Driver partners at launch' },
  { to: 15, suffix: '', label: 'Freetown neighborhoods covered' },
  { to: 3, suffix: '', label: 'Ride classes from day one' },
  { to: 60, suffix: 's', label: 'Average match time target' },
];

const VISION_CARDS = [
  {
    title: 'Deeply Local',
    desc: "We don't copy-paste global apps. EasyGo is tuned to the rhythms of Freetown — Keh Keh culture, local currency, and real street geography.",
    icon: '📍',
    img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Human Safety',
    desc: "Safety isn't a feature; it's the foundation. Real-time SOS, verified onboarding, and transparent trip tracking make every journey feel secure.",
    icon: '🛡️',
    img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Empowering Partners',
    desc: "Drivers aren't just users — they're partners. We give them tools to maximize earnings, track performance, and professionalize their work.",
    icon: '📈',
    img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
  },
];

const ROLES = [
  {
    role: 'Passenger',
    headline: 'Ride with certainty',
    color: 'bg-easygo-container',
    features: [
      'Intelligent route matching across Freetown',
      'Digital wallet with Mobile Money top-ups',
      'One-tap SOS assistance on every trip',
      'Transparent fares, no surprises',
    ],
  },
  {
    role: 'Driver',
    headline: 'Earn with dignity',
    color: 'bg-easygo-velocity',
    features: [
      'Real-time earnings analytics',
      'Verified ride-partner status',
      'Optimized trip dispatch near you',
      'Weekly Mobile Money payouts',
    ],
  },
  {
    role: 'Admin',
    headline: 'Command the network',
    color: 'bg-easygo-night',
    features: [
      'Fleet-wide live visibility',
      'Automated revenue reporting',
      'Strategic demand heatmaps',
      'Verification pipelines',
    ],
  },
];

const STEPS = [
  { title: 'Request a Ride', desc: 'Pick your class — Keh Keh, Comfort Car, or Poya — and see the fare up front.' },
  { title: 'Get Matched Instantly', desc: 'Our dispatch engine connects you to the nearest verified driver heading your way.' },
  { title: 'Ride & Track', desc: 'Follow your journey live in-app and share trip status with family for peace of mind.' },
  { title: 'Pay Your Way', desc: 'Orange Money, AfriMoney, cash, or EasyGo Wallet — your choice, every trip.' },
];

const PAYMENTS = [
  { name: 'Orange Money', color: '#FF6600', desc: 'Instant ride payments and wallet top-ups from your Orange Money balance.' },
  { name: 'AfriMoney', color: '#ED1C24', desc: 'Fast, familiar transfers — pay straight from your AfriMoney account.' },
  { name: 'EasyGo Wallet', color: '#10B981', desc: 'In-app credit with automatic deductions, receipts, and ride history.' },
  { name: 'Cash', color: '#0E6C45', desc: 'Cash is culture. Every ride accepts it — no rider is ever left behind.' },
];

/* ============================================================
   🖥️ The landing page
   ============================================================ */

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [invested, setInvested] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    setInvested(true);
  };

  useEffect(() => {
    const id = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const active = TESTIMONIALS[tIdx];

  return (
    <div className="min-h-screen bg-white text-easygo-ink selection:bg-easygo-neon selection:text-easygo-primary font-sans overflow-x-hidden">
      {/* ======== NAVIGATION ======== */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-easygo-line">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-easygo-primary rounded-xl flex items-center justify-center text-easygo-neon font-black transition-all group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-easygo-velocity/40 font-display">EG</div>
            <span className="text-easygo-primary font-display">EasyGo</span>
          </div>
          <div className="hidden lg:flex gap-10 font-medium text-sm text-easygo-secondaryText">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="relative hover:text-easygo-primary transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-easygo-velocity after:rounded-full after:transition-all hover:after:w-full">{l.label}</a>
            ))}
          </div>
          <a
            href="#investors"
            className="bg-easygo-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-easygo-primary/40 hover:bg-easygo-container hover:scale-105 transition-all active:scale-95"
          >
            Get in Touch
          </a>
        </div>
      </nav>

      {/* ======== HERO ======== */}
      <section className="relative px-6 pt-24 pb-28 overflow-hidden bg-gradient-to-br from-easygo-heroFrom via-easygo-secondary to-easygo-heroTo animate-gradient">
        <div className="glow-orb w-[34rem] h-[34rem] bg-easygo-velocity/40 top-[-10%] right-[-10%] animate-glow-pulse"></div>
        <div className="glow-orb w-[26rem] h-[26rem] bg-easygo-pulse/20 bottom-[-20%] left-[-5%] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* floating maps telemetry */}
        <div className="absolute top-40 right-[12%] hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 animate-float">
          <div className="w-2 h-2 rounded-full bg-easygo-pulse"></div>
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Lumley · Surge ▲</span>
        </div>
        <div className="absolute top-64 right-[6%] hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 animate-float-slow">
          <div className="w-2 h-2 rounded-full bg-easygo-gold animate-pulse"></div>
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Downtown · 32 rides live</span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-wider uppercase bg-easygo-neon/15 text-easygo-neon rounded-full border border-easygo-neon/30 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-easygo-pulse opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-easygo-pulse"></span>
              </span>
              Coming Soon to Freetown 🇸🇱
            </div>

            <h1 className="font-display text-6xl md:text-8xl font-bold leading-[1.05] mb-8 tracking-tight text-white animate-fade-up" style={{ animationDelay: '100ms' }}>
              Moving <span className="text-gradient-neon animate-gradient">Freetown</span><br />
              Forward.<span className="text-easygo-neon">.</span><span className="text-easygo-velocity">.</span>
            </h1>

            <p className="text-xl text-white/80 mb-12 max-w-2xl leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
              We're not just building an app — we're crafting a human-centric transit experience. From Keh Keh to Comfort Cars, EasyGo brings dignity, safety, and efficiency to every journey.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md animate-fade-up" style={{ animationDelay: '300ms' }}>
                <input
                  type="email"
                  required
                  placeholder="Your professional email"
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-easygo-pulse focus:bg-white/15 focus:scale-[1.02] transition-all backdrop-blur-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="bg-easygo-neon text-easygo-primary px-8 py-4 rounded-2xl font-bold hover:bg-white hover:scale-105 transition-all shadow-xl shadow-easygo-deep/40 active:scale-95">
                  Join the Journey
                </button>
              </form>
            ) : (
              <div className="bg-easygo-neon/15 border border-easygo-neon/40 text-easygo-neon p-5 rounded-2xl font-medium inline-block" style={{ animation: 'fade-up 0.5s ease-out both' }}>
                ✨ You're on the list. We'll be in touch soon.
              </div>
            )}
          </div>

          <div className="hidden md:flex gap-4 mt-20 animate-fade-up" style={{ animationDelay: '400ms' }}>
            {[
              { value: <Counter to={3} />, label: 'Ride Classes — Keh Keh to Comfort' },
              { value: <Counter to={100} suffix="%" />, label: 'Verified Driver Onboarding' },
              { value: <Counter to={24} suffix="/7" />, label: 'In-app SOS Monitoring' },
              { value: <Counter to={15} />, label: 'Neighborhoods at Launch' },
            ].map((s, i) => (
              <div key={i} className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300">
                <div className="font-display text-3xl font-bold text-easygo-neon mb-1">{s.value}</div>
                <div className="text-xs font-medium text-white/70 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== MARQUEE STRIP ======== */}
      <div className="bg-easygo-primary text-easygo-mint py-4 overflow-hidden border-y border-easygo-container group/mq">
        <div className="flex whitespace-nowrap animate-marquee w-max group-hover/mq:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {MARQUEE_ITEMS.map((item) => (
                <span key={`${dup}-${item}`} className="flex items-center text-sm font-bold tracking-[0.2em] uppercase">
                  <span className="px-8">{item}</span>
                  <span className="text-easygo-pulse">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ======== NUMBERS BAND ======== */}
      <section className="py-16 px-6 bg-white border-b border-easygo-line">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {NUMBERS.map((n, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="font-display text-5xl font-bold text-easygo-primary tracking-tight">
                <Counter to={n.to} suffix={n.suffix} />
              </div>
              <div className="mt-2 text-sm font-medium text-easygo-secondaryText">{n.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======== VISION ======== */}
      <section id="vision" className="py-32 bg-easygo-mist px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-20">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">Our Vision</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-easygo-ink">Driven by <span className="text-easygo-velocity">Purpose.</span></h2>
            <p className="text-easygo-secondaryText max-w-2xl mx-auto text-lg leading-relaxed">
              We believe transportation is a fundamental right. Our goal is to replace chaos with consistency and uncertainty with trust.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12">
            {VISION_CARDS.map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="group cursor-default">
                  <div className="mb-6 h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white transition-all group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-easygo-velocity/20 duration-500">
                    <img src={item.img} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={item.title} />
                  </div>
                  <div className="text-4xl mb-4 transition-transform duration-500 group-hover:scale-125 group-hover:-translate-y-1 inline-block">{item.icon}</div>
                  <h3 className="font-display text-2xl font-bold mb-3 text-easygo-ink group-hover:text-easygo-velocity transition-colors">{item.title}</h3>
                  <p className="text-easygo-secondaryText leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== ECOSYSTEM ======== */}
      <section id="ecosystem" className="py-32 px-6 max-w-7xl mx-auto">
        <Reveal className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">The Ecosystem</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-easygo-ink">The Synchronized<br />Network</h2>
            <p className="text-easygo-secondaryText text-lg leading-relaxed">
              Three interfaces, one single source of truth. When a rider books, the driver knows, and the admin sees. Total transparency, total control.
            </p>
          </div>
          <div className="text-easygo-primary font-bold text-sm uppercase tracking-widest border-b-2 border-easygo-velocity pb-1 shrink-0">
            Infrastructure Ready
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {ROLES.map((app, i) => (
            <Reveal key={app.role} delay={i * 130}>
              <div className="group relative p-8 rounded-[2rem] bg-white border border-easygo-line shadow-sm hover:shadow-xl hover:shadow-easygo-velocity/10 hover:-translate-y-2 transition-all duration-500 h-full">
                <div className={`w-14 h-14 ${app.color} rounded-2xl mb-8 shadow-lg transform transition-transform group-hover:rotate-12 group-hover:scale-110 flex items-center justify-center text-white font-bold text-xl font-display`}>
                  {app.role[0]}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-2">{app.role} Experience</div>
                <h3 className="font-display text-3xl font-bold mb-8 text-easygo-ink">{app.headline}</h3>
                <ul className="space-y-4">
                  {app.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-easygo-secondaryText group-hover:text-easygo-ink transition-colors">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-easygo-successBg text-easygo-successFg flex items-center justify-center text-[10px] font-bold shrink-0 transition-transform group-hover:scale-110" style={{ transitionDelay: `${j * 40}ms` }}>✓</span>
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======== LIVE EXPERIENCE (phone mockup) ======== */}
      <section id="experience" className="py-32 px-6 bg-easygo-mist overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal className="flex justify-center lg:justify-start">
            <PhoneMockup />
          </Reveal>
          <Reveal delay={150}>
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">The Experience</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight text-easygo-ink">
              Watch your ride <span className="text-easygo-velocity">come alive.</span>
            </h2>
            <p className="text-easygo-secondaryText text-lg leading-relaxed mb-10">
              Live tracking isn't a premium feature — it's the baseline. See your driver approach in real time on a nighttime Freetown map, with the fare locked before you ever step in.
            </p>
            <div className="space-y-6">
              {[
                { icon: '🛰️', title: 'Real-time GPS Tracking', desc: 'Exact location, every second of the trip.', },
                { icon: '🔒', title: 'Locked Fare', desc: 'The price you see at booking is the price you pay.' },
                { icon: '🚨', title: 'SOS on Every Screen', desc: 'One tap alerts emergency support with your live location.' },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-easygo-line shadow-sm flex items-center justify-center text-xl shrink-0 transition-all duration-300 group-hover:bg-easygo-velocity/10 group-hover:border-easygo-velocity/40 group-hover:-translate-y-1">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-bold text-easygo-ink mb-1">{f.title}</div>
                    <div className="text-sm text-easygo-secondaryText leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section id="how" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-20">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">The Journey</div>
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 tracking-tight text-easygo-ink">Four Steps. Zero Friction.</h2>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative bg-white rounded-3xl p-8 border border-easygo-line shadow-sm hover:shadow-xl hover:shadow-easygo-velocity/10 hover:-translate-y-2 transition-all duration-500 group h-full overflow-hidden">
                  <div className="font-display text-6xl font-bold text-easygo-mist absolute top-2 right-5 step-number select-none">
                    {i + 1}
                  </div>
                  <div className="w-12 h-1 bg-easygo-velocity rounded-full mb-6 transition-all duration-500 group-hover:w-20 group-hover:shadow group-hover:shadow-easygo-pulse/50"></div>
                  <h3 className="font-display text-xl font-bold mb-3 text-easygo-ink relative">{step.title}</h3>
                  <p className="text-easygo-secondaryText text-sm leading-relaxed relative">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== PAYMENTS ======== */}
      <section id="payments" className="py-32 px-6 bg-easygo-mist">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">Payments</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight text-easygo-ink">
              Pay the way <span className="text-easygo-velocity">Sierra Leone</span> pays.
            </h2>
            <p className="text-easygo-secondaryText text-lg leading-relaxed mb-10">
              Digital or cash — EasyGo meets riders where they are. We integrate the Mobile Money networks Freetown already trusts, plus our own smart wallet for the cashless future.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {PAYMENTS.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl p-5 border border-easygo-line hover:border-easygo-velocity/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-[2] shadow-lg" style={{ backgroundColor: p.color }}></div>
                    <div className="font-bold text-easygo-ink">{p.name}</div>
                  </div>
                  <p className="text-sm text-easygo-secondaryText leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="absolute inset-4 bg-easygo-primary/10 rounded-[3rem] rotate-3"></div>
              <div className="relative bg-gradient-to-br from-easygo-heroFrom to-easygo-heroTo rounded-[3rem] p-10 text-white shadow-2xl animate-float-slow">
                <div className="text-sm font-bold uppercase tracking-widest text-easygo-neon mb-6">EasyGo Wallet</div>
                <div className="font-display text-5xl font-bold mb-2">NLe 48,250</div>
                <div className="text-white/60 text-sm mb-10">Balance · Freetown, Sierra Leone</div>
                <div className="space-y-3">
                  {[
                    { label: 'Comfort Car · Abton St → Aberdeen', amount: '-NLe 85', time: 'Now' },
                    { label: 'Keh Keh · Fourah Bay Rd', amount: '-NLe 25', time: 'Yesterday' },
                    { label: 'Wallet Top-up · Orange Money', amount: '+NLe 500', time: 'Mon' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/15 transition-colors">
                      <div className="text-sm text-white/80">{tx.label}</div>
                      <div className="flex items-baseline gap-3">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{tx.time}</div>
                        <div className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-easygo-neon' : 'text-white'}`}>{tx.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-[10px] text-white/40 uppercase tracking-widest">Illustrative demo data</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">Voices of Freetown</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-easygo-ink">What early riders <span className="text-easygo-velocity">say.</span></h2>
        </Reveal>

        <Reveal>
          <div className="relative bg-white rounded-[2.5rem] p-10 md:p-14 border border-easygo-line shadow-xl shadow-easygo-velocity/5 overflow-hidden">
            <div className="absolute -top-8 -left-2 font-display text-[12rem] leading-none text-easygo-mist select-none">"</div>
            <div key={tIdx} style={{ animation: 'fade-up 0.6s ease both' }} className="relative">
              <p className="text-xl md:text-2xl font-medium text-easygo-ink leading-relaxed mb-10">{active.quote}</p>
              <div className="flex items-center gap-4">
                <img src={active.img} alt={active.name} className="w-14 h-14 rounded-full object-cover ring-4 ring-easygo-successBg" />
                <div>
                  <div className="font-bold text-easygo-ink">{active.name}</div>
                  <div className="text-sm text-easygo-secondaryText">{active.role}</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 right-10 flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTIdx(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-500 ${i === tIdx ? 'w-8 bg-easygo-velocity' : 'w-2.5 bg-easygo-line hover:bg-easygo-mutedText'}`}
                ></button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======== FAQ ======== */}
      <section className="py-32 px-6 bg-easygo-mist">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-easygo-velocity mb-4">Good to Know</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-easygo-ink">Questions, answered.</h2>
          </Reveal>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="bg-white rounded-2xl border border-easygo-line overflow-hidden transition-shadow hover:shadow-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-7 py-5 text-left"
                  >
                    <span className="font-bold text-easygo-ink pr-4">{f.q}</span>
                    <span className={`w-8 h-8 shrink-0 rounded-full bg-easygo-mist flex items-center justify-center text-easygo-primary transition-transform duration-300 ${openFaq === i ? 'rotate-45 bg-easygo-velocity text-white' : ''}`}>+</span>
                  </button>
                  <div
                    className="px-7 overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openFaq === i ? '320px' : '0', opacity: openFaq === i ? 1 : 0 }}
                  >
                    <p className="text-easygo-secondaryText leading-relaxed pb-6">{f.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======== INVESTORS ======== */}
      <section id="investors" className="py-32 px-6 bg-gradient-to-br from-easygo-heroFrom via-easygo-secondary to-easygo-heroTo relative overflow-hidden">
        <div className="glow-orb w-[28rem] h-[28rem] bg-easygo-pulse/25 top-[-10%] left-[-10%]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-20"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="font-display text-4xl md:text-7xl font-bold mb-8 text-white tracking-tight">Join the <span className="text-gradient-neon">Movement.</span></h2>
            <p className="text-white/70 text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
              We are moving from prototype to beta. We are looking for strategic partners who believe in the economic potential of Sierra Leone.
            </p>
          </Reveal>

          {!invested ? (
            <Reveal delay={150}>
              <form onSubmit={handleInvest} className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl text-left max-w-3xl mx-auto hover:shadow-easygo-velocity/20">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="flex flex-col">
                    <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-2 ml-1">Full Name</label>
                    <input type="text" required className="w-full bg-easygo-mist border border-easygo-line rounded-2xl px-5 py-4 text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:border-transparent transition-all" placeholder="Jane Doe" />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-2 ml-1">Organization</label>
                    <input type="text" className="w-full bg-easygo-mist border border-easygo-line rounded-2xl px-5 py-4 text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:border-transparent transition-all" placeholder="VC / Angel Firm" />
                  </div>
                </div>
                <div className="mb-10 flex flex-col">
                  <label className="block text-xs font-bold uppercase tracking-widest text-easygo-mutedText mb-2 ml-1">Investment Interest</label>
                  <textarea rows={4} className="w-full bg-easygo-mist border border-easygo-line rounded-2xl px-5 py-4 text-easygo-ink focus:outline-none focus:ring-2 focus:ring-easygo-velocity focus:border-transparent transition-all" placeholder="Tell us how you'd like to partner with EasyGo..."></textarea>
                </div>
                <button type="submit" className="w-full bg-easygo-primary text-white font-bold py-5 rounded-2xl hover:bg-easygo-container hover:scale-[1.02] transition-all uppercase tracking-widest text-sm shadow-xl shadow-easygo-primary/30 active:scale-95">
                  Request Investor Package
                </button>
              </form>
            </Reveal>
          ) : (
            <div className="bg-white/10 border border-easygo-neon/40 backdrop-blur-md p-10 rounded-[3rem] max-w-xl mx-auto text-easygo-neon font-medium text-lg" style={{ animation: 'fade-up 0.5s ease both' }}>
              🌍 Thank you. Our partnerships team will reach out with the investor package shortly.
            </div>
          )}
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="py-20 px-6 bg-easygo-night text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
            <div className="w-10 h-10 bg-easygo-primary rounded-xl flex items-center justify-center text-easygo-neon font-black transition-transform group-hover:rotate-12">EG</div>
            <div className="font-display text-2xl font-bold text-white">EasyGo</div>
          </div>
          <div className="flex justify-center flex-wrap gap-8 mb-10 text-sm font-medium text-easygo-mutedText">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-easygo-neon transition-colors">{l.label}</a>
            ))}
          </div>
          <p className="text-white/30 text-xs">
            © 2026 EasyGo Mobility. All rights reserved. Freetown, Sierra Leone. 🇸🇱
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
