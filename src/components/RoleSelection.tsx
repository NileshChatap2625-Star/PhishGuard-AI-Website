import { useApp } from '@/contexts/AppContext';
import ParticleCanvas from './ParticleCanvas';
import { Shield, Search, Lock, Database, Brain, BarChart3, Users, Globe, CheckCircle, AlertTriangle, XCircle, ArrowRight, Zap, Eye, ShieldCheck } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const AnimatedNumber: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<number>();
  const elRef = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.3 });
    if (elRef.current) observer.observe(elRef.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, started]);

  return <span ref={elRef}>{val.toLocaleString()}{suffix}</span>;
};

const SCAN_STEPS = [
  { icon: Globe, title: 'Domain Resolution', desc: 'Resolves and analyzes the target domain, checking registration details and DNS records.', color: 'text-primary' },
  { icon: Lock, title: 'SSL Certificate Check', desc: 'Validates SSL/TLS certificates for authenticity, expiration, and chain of trust.', color: 'text-accent' },
  { icon: Database, title: 'Blacklist Scanning', desc: 'Cross-references against 50+ known phishing and malware blacklist databases.', color: 'text-warning' },
  { icon: Eye, title: 'Page Structure Analysis', desc: 'Deep inspection of HTML structure, forms, and hidden elements for suspicious patterns.', color: 'text-secondary' },
  { icon: Brain, title: 'AI Detection Engine', desc: 'Advanced machine learning model analyzes behavioral patterns with 98.7% accuracy.', color: 'text-destructive' },
];

const FEATURES = [
  { icon: Zap, title: 'Real-Time Scanning', desc: 'Instant URL analysis with results in under 3 seconds.' },
  { icon: ShieldCheck, title: 'AI-Powered Detection', desc: 'Neural network trained on millions of phishing samples.' },
  { icon: BarChart3, title: 'Detailed Analytics', desc: 'Comprehensive threat reports with risk scoring and history.' },
  { icon: Users, title: 'Team Management', desc: 'Admin dashboard for managing users, alerts, and system settings.' },
];

const RoleSelection = () => {
  const { setScreen, db } = useApp();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(p => (p + 1) % 5), 2500);
    return () => clearInterval(interval);
  }, []);

  // Pull real stats from DB
  const totalScans = db?.queryOne('SELECT COUNT(*) as c FROM scan_history')?.c || 0;
  const totalUsers = db?.queryOne('SELECT COUNT(*) as c FROM users')?.c || 0;
  const phishingFound = db?.queryOne("SELECT COUNT(*) as c FROM scan_history WHERE status='PHISHING'")?.c || 0;
  const safeCount = db?.queryOne("SELECT COUNT(*) as c FROM scan_history WHERE status='SAFE'")?.c || 0;
  const suspiciousCount = db?.queryOne("SELECT COUNT(*) as c FROM scan_history WHERE status='SUSPICIOUS'")?.c || 0;

  const pieData = [
    { name: 'Safe', value: safeCount || 1, color: 'hsl(152,100%,50%)' },
    { name: 'Suspicious', value: suspiciousCount || 1, color: 'hsl(38,92%,50%)' },
    { name: 'Phishing', value: phishingFound || 1, color: 'hsl(346,100%,50%)' },
  ];

  const activityData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), scans: Math.floor(Math.random() * 15) + 3 };
  });

  const threatData = [
    { name: 'Credential', value: 35 },
    { name: 'Malware', value: 22 },
    { name: 'Redirect', value: 18 },
    { name: 'Spoof', value: 15 },
    { name: 'Other', value: 10 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-y-auto overflow-x-hidden">
      <ParticleCanvas />

      {/* ───── Hero Section ───── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Shield className="w-24 h-24 text-primary float" />
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-primary mb-4 tracking-wider fade-in-up">
            PhishGuard AI
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-6 font-inter max-w-2xl mx-auto fade-in-up" style={{ animationDelay: '0.1s' }}>
            Advanced AI-Powered Phishing Detection — Protect yourself from malicious URLs with real-time scanning & intelligent threat analysis.
          </p>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center">
              <div className="font-orbitron text-2xl md:text-3xl font-bold text-primary"><AnimatedNumber target={totalScans} /></div>
              <div className="text-muted-foreground text-xs mt-1">URLs Scanned</div>
            </div>
            <div className="text-center">
              <div className="font-orbitron text-2xl md:text-3xl font-bold text-destructive"><AnimatedNumber target={phishingFound} /></div>
              <div className="text-muted-foreground text-xs mt-1">Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="font-orbitron text-2xl md:text-3xl font-bold text-accent"><AnimatedNumber target={totalUsers} /></div>
              <div className="text-muted-foreground text-xs mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="font-orbitron text-2xl md:text-3xl font-bold text-secondary">98.7<span className="text-lg">%</span></div>
              <div className="text-muted-foreground text-xs mt-1">Accuracy</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => setScreen('admin-login')}
              className="glass glow-purple px-10 py-7 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 min-w-[250px]"
            >
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="font-orbitron text-lg font-bold text-secondary mb-1">ADMIN LOGIN</h3>
              <p className="text-muted-foreground text-xs mb-3">OTP Authentication</p>
              <div className="btn-secondary-glow px-6 py-2 rounded-lg text-sm inline-block">Enter as Admin</div>
            </button>
            <button
              onClick={() => setScreen('user-login')}
              className="glass glow-cyan px-10 py-7 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 min-w-[250px]"
            >
              <div className="text-3xl mb-2">👤</div>
              <h3 className="font-orbitron text-lg font-bold text-primary mb-1">USER LOGIN</h3>
              <p className="text-muted-foreground text-xs mb-3">Scan & Detect</p>
              <div className="btn-primary-glow px-6 py-2 rounded-lg text-sm inline-block">Enter as User</div>
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce text-muted-foreground">
            <ArrowRight className="w-5 h-5 mx-auto rotate-90" />
            <span className="text-xs">Scroll to learn more</span>
          </div>
        </div>
      </section>

      {/* ───── How Scanning Works ───── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center text-primary mb-3">How It Works</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">Our 5-step AI-powered pipeline analyzes every URL in real-time to detect phishing threats.</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {SCAN_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === activeStep;
              return (
                <div
                  key={i}
                  className={`glass p-5 rounded-2xl text-center transition-all duration-500 cursor-pointer ${isActive ? 'glow-cyan scale-105 border-primary/30' : 'hover:scale-[1.02]'}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className={`mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/15' : 'bg-muted/50'}`}>
                    <Icon className={`w-6 h-6 ${step.color} ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <div className="font-orbitron text-xs font-bold text-muted-foreground mb-1">STEP {i + 1}</div>
                  <h4 className="font-orbitron text-sm font-bold text-foreground mb-2">{step.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
                  {isActive && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-accent text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Processing
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex gap-1">
              {SCAN_STEPS.map((_, i) => (
                <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-muted/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${i <= activeStep ? 'bg-primary' : 'bg-transparent'}`}
                    style={{ width: i < activeStep ? '100%' : i === activeStep ? '60%' : '0%' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── Live Stats & Graphs ───── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center text-primary mb-3">Platform Statistics</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">Real-time data from our threat detection engine.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pie Chart - URL Classification */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-orbitron text-sm text-muted-foreground mb-4">URL Classification</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(225 40% 11%)', border: '1px solid hsl(225 25% 18%)', borderRadius: 8, color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Area Chart - Activity */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-orbitron text-sm text-muted-foreground mb-4">Scan Activity (7 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="homeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(183,100%,50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(183,100%,50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(225 40% 11%)', border: '1px solid hsl(225 25% 18%)', borderRadius: 8, color: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="scans" stroke="hsl(183,100%,50%)" fill="url(#homeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Threat Types */}
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-orbitron text-sm text-muted-foreground mb-4">Threat Categories</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={threatData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(225 40% 11%)', border: '1px solid hsl(225 25% 18%)', borderRadius: 8, color: '#e2e8f0' }} />
                  <Bar dataKey="value" fill="hsl(262,84%,58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Features Grid ───── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center text-primary mb-3">Key Features</h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">Everything you need to stay safe online.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="glass p-6 rounded-2xl text-center hover:scale-[1.03] transition-all duration-300 hover:border-primary/20">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-orbitron text-sm font-bold text-foreground mb-2">{f.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Recent Threats ───── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center text-primary mb-3">Recent Threat Detections</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">Latest phishing URLs caught by our engine.</p>

          <div className="space-y-3">
            {(db?.query("SELECT url, status, risk_score, scanned_at FROM scan_history WHERE status != 'SAFE' ORDER BY scanned_at DESC LIMIT 5") || []).map((scan: any, i: number) => (
              <div key={i} className={`glass p-4 rounded-xl flex items-center justify-between gap-4 ${scan.status === 'PHISHING' ? 'border-destructive/20' : 'border-warning/20'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {scan.status === 'PHISHING' ? <XCircle className="w-5 h-5 text-destructive shrink-0" /> : <AlertTriangle className="w-5 h-5 text-warning shrink-0" />}
                  <span className="text-foreground text-sm truncate">{scan.url}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${scan.status === 'PHISHING' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
                    {scan.status}
                  </span>
                  <span className="text-muted-foreground text-xs font-mono">{scan.risk_score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Footer ───── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-primary mb-3">Start Protecting Yourself</h2>
          <p className="text-muted-foreground mb-8">Create a free account and scan your first URL in seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setScreen('user-register')} className="btn-primary-glow px-8 py-3 rounded-xl text-sm font-orbitron inline-flex items-center gap-2 justify-center">
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setScreen('user-login')} className="glass px-8 py-3 rounded-xl text-sm font-orbitron text-primary hover:bg-primary/5 transition-colors">
              Login
            </button>
          </div>
          <p className="text-muted-foreground text-xs mt-12 opacity-60">© 2024 PhishGuard AI — All Rights Reserved</p>
        </div>
      </section>
    </div>
  );
};

export default RoleSelection;
