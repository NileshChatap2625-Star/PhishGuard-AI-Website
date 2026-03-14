import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ADMIN_EMAILS, maskEmail } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';
import ParticleCanvas from './ParticleCanvas';
import { ArrowLeft, Shield, Mail, Loader2, Copy, Check, Lock, Eye, EyeOff } from 'lucide-react';

const VISHNU_EMAIL = 'vishnubabalsure@gmail.com';
const NILESH_EMAIL = 'nileshchatap25@gmail.com';
const NILESH_PASSWORD = 'Nilesh@2625';
const VISHNU_FALLBACK_PASSWORD = 'vishnu@1923';

const AdminLogin = () => {
  const { setScreen, setSession, showToast, setSection } = useApp();
  // 'select' | 'otp' | 'password'
  const [step, setStep] = useState<'select' | 'otp' | 'password'>('select');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [adminInfo, setAdminInfo] = useState<{ name: string; level: string } | null>(null);
  const [timer, setTimer] = useState(300);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpFailCount, setOtpFailCount] = useState(0);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  useEffect(() => {
    if (!locked || lockTimer <= 0) return;
    const id = setInterval(() => {
      setLockTimer(t => {
        if (t <= 1) { setLocked(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [locked, lockTimer]);

  const invokeOtpAction = async (payload: { action: 'send' | 'verify'; email: string; otp?: string }) => {
    const maxAttempts = 2;
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const { data, error } = await supabase.functions.invoke('send-admin-otp', { body: payload });
      if (!error) return { data, error: null };
      lastError = error;
      const message = String(error.message || '').toLowerCase();
      const isTransient = message.includes('failed to send a request to the edge function') || message.includes('failed to fetch') || message.includes('network');
      if (!isTransient || attempt === maxAttempts) break;
      await new Promise(resolve => setTimeout(resolve, 700));
    }
    return { data: null, error: lastError };
  };

  const getFriendlyErrorMessage = (err: any, fallback: string) => {
    const raw = String(err?.message || fallback);
    if (raw.toLowerCase().includes('failed to send a request to the edge function') || raw.toLowerCase().includes('failed to fetch')) {
      return 'Temporary network issue. Please retry once.';
    }
    return raw;
  };

  const loginSuccess = (info: { name: string; level: string }, adminEmail: string) => {
    setVerified(true);
    showToast(`Welcome, ${info.name}!`, 'success');
    setTimeout(() => {
      setSession({
        loggedIn: true, role: 'admin', userId: null,
        username: info.name, name: info.name,
        email: adminEmail, avatarColor: '#7c3aed',
        adminLevel: info.level, loginTime: Date.now()
      });
      setSection('dashboard');
      setScreen('admin-dashboard');
    }, 1500);
  };

  // Vishnu: Send OTP via email
  const handleSendOTP = async () => {
    const info = ADMIN_EMAILS[VISHNU_EMAIL];
    setEmail(VISHNU_EMAIL);
    setAdminInfo(info);
    setLoading(true);
    try {
      const { data, error } = await invokeOtpAction({ action: 'send', email: VISHNU_EMAIL });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTimer(300);
      showToast(data.emailSent ? `OTP sent to ${maskEmail(VISHNU_EMAIL)}. Check your inbox!` : 'OTP generated! Check your email.', 'success');
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      showToast(getFriendlyErrorMessage(err, 'Failed to send OTP'), 'error');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Nilesh: Show password step
  const handleNileshClick = () => {
    const info = ADMIN_EMAILS[NILESH_EMAIL];
    setEmail(NILESH_EMAIL);
    setAdminInfo(info);
    setStep('password');
  };

  // Nilesh: Verify password
  const handlePasswordLogin = () => {
    if (password === NILESH_PASSWORD) {
      loginSuccess(adminInfo || ADMIN_EMAILS[NILESH_EMAIL], NILESH_EMAIL);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      showToast('Invalid password', 'error');
    }
  };

  const handleOTPChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }, [otp]);

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    text.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    if (locked) return;
    const code = otp.join('');
    if (timer <= 0) {
      showToast('OTP expired. Please resend.', 'error');
      setOtp(['', '', '', '', '', '']);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await invokeOtpAction({ action: 'verify', email: VISHNU_EMAIL, otp: code });
      if (error) throw error;
      if (data?.locked) {
        setLocked(true);
        setLockTimer(120);
        showToast('Too many attempts. Locked for 2 minutes.', 'error');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
      if (data?.error) {
        const newFails = otpFailCount + 1;
        setOtpFailCount(newFails);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        if (newFails >= 5) {
          setShowPasswordFallback(true);
          showToast('Too many failed attempts. Use password to login.', 'warning');
        } else {
          showToast(`${data.error} (${5 - newFails} attempts left)`, 'error');
        }
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
        return;
      }
      const verifiedInfo = data.adminInfo || adminInfo!;
      loginSuccess(verifiedInfo, VISHNU_EMAIL);
    } catch (err: any) {
      const newFails = otpFailCount + 1;
      setOtpFailCount(newFails);
      showToast(getFriendlyErrorMessage(err, 'Verification failed'), 'error');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      if (newFails >= 5) {
        setShowPasswordFallback(true);
      }
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { data, error } = await invokeOtpAction({ action: 'send', email: VISHNU_EMAIL });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
      showToast('New OTP sent! Check your email.', 'success');
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      showToast(getFriendlyErrorMessage(err, 'Failed to resend OTP'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (verified) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <ParticleCanvas />
        <div className="relative z-10 text-center fade-in-up">
          <div className="text-6xl mb-4 scale-in">✅</div>
          <h2 className="font-orbitron text-2xl text-accent mb-2">Verified Successfully!</h2>
          <p className="text-muted-foreground">Welcome, {adminInfo?.name}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      <ParticleCanvas />
      <div className="relative z-10 w-full max-w-md px-4">
        <button onClick={() => step === 'select' ? setScreen('role-selection') : setStep('select')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition mb-6">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="glass-strong p-8 rounded-2xl glow-purple">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-secondary mx-auto mb-3" />
            <h2 className="font-orbitron text-xl text-secondary">Admin Access Portal</h2>
          </div>

          {/* Step 1: Select admin account */}
          {step === 'select' && (
            <div className={`space-y-3 ${shaking ? 'shake' : ''}`}>
              <label className="text-sm text-muted-foreground mb-1 block">Select your admin account</label>
              {/* Vishnu - OTP login */}
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex items-center gap-3 bg-input border border-border rounded-lg p-4 text-left hover:border-secondary transition disabled:opacity-40"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <Mail className="text-secondary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Vishnu Babalsure</p>
                  <p className="text-xs text-muted-foreground">OTP via Email</p>
                </div>
                <span className="text-xs text-secondary font-medium shrink-0">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send OTP →'}
                </span>
              </button>
              {/* Nilesh - Password login */}
              <button
                onClick={handleNileshClick}
                className="w-full flex items-center gap-3 bg-input border border-border rounded-lg p-4 text-left hover:border-secondary transition"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <Lock className="text-secondary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Nilesh Chatap</p>
                  <p className="text-xs text-muted-foreground">Password Login</p>
                </div>
                <span className="text-xs text-secondary font-medium shrink-0">Login →</span>
              </button>
            </div>
          )}

          {/* Step: Nilesh password login */}
          {step === 'password' && (
            <div className={shaking ? 'shake' : ''}>
              <p className="text-center text-muted-foreground text-sm mb-4">
                Login as <span className="text-primary font-semibold">Nilesh Chatap</span>
              </p>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                  placeholder="Enter password"
                  className="w-full bg-input border border-border rounded-lg py-3 pl-10 pr-10 text-foreground glow-input focus:border-secondary"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handlePasswordLogin}
                disabled={!password}
                className="w-full btn-secondary-glow py-3 rounded-lg font-semibold disabled:opacity-40"
              >
                Login
              </button>
            </div>
          )}

          {/* Step: Vishnu OTP verification */}
          {step === 'otp' && (
            <div>
              <p className="text-center text-muted-foreground text-sm mb-4">
                OTP sent to <span className="text-primary">{maskEmail(VISHNU_EMAIL)}</span>. Check your inbox!
              </p>

              <div className={`flex justify-center gap-2 mb-4 ${shaking ? 'shake' : ''}`} onPaste={handleOTPPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" maxLength={1} value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    className={`otp-box ${shaking ? 'error' : ''}`}
                    disabled={locked || loading}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className={`${timer <= 60 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  ⏱ {formatTime(timer)}
                </span>
                {locked && <span className="text-destructive">🔒 Locked {lockTimer}s</span>}
              </div>
              <button
                onClick={handleVerify}
                disabled={otp.join('').length !== 6 || locked || loading}
                className="w-full btn-primary-glow py-3 rounded-lg font-semibold disabled:opacity-40 mb-3 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : locked ? `Locked (${lockTimer}s)` : 'Verify OTP'}
              </button>
              <button
                onClick={handleResend} disabled={timer > 0 || loading}
                className="w-full text-sm text-muted-foreground hover:text-primary transition disabled:opacity-30"
              >
                Resend OTP
              </button>

              {/* Vishnu password fallback after 5 failed OTP attempts */}
              {showPasswordFallback && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 text-center">OTP not working? Login with password:</p>
                  <div className="relative mb-3">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && password === VISHNU_FALLBACK_PASSWORD) {
                          loginSuccess(adminInfo || ADMIN_EMAILS[VISHNU_EMAIL], VISHNU_EMAIL);
                        } else if (e.key === 'Enter') {
                          setShaking(true);
                          setTimeout(() => setShaking(false), 500);
                          showToast('Invalid password', 'error');
                        }
                      }}
                      placeholder="Enter admin password"
                      className="w-full bg-input border border-border rounded-lg py-3 pl-10 pr-10 text-foreground glow-input"
                    />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (password === VISHNU_FALLBACK_PASSWORD) {
                        loginSuccess(adminInfo || ADMIN_EMAILS[VISHNU_EMAIL], VISHNU_EMAIL);
                      } else {
                        setShaking(true);
                        setTimeout(() => setShaking(false), 500);
                        showToast('Invalid password', 'error');
                      }
                    }}
                    disabled={!password}
                    className="w-full btn-secondary-glow py-2.5 rounded-lg font-semibold disabled:opacity-40"
                  >
                    Login with Password
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
