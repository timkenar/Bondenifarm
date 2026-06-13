import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

/* ── Custom logomark — premium SVG emblem, no dependency on a file ── */
const BondeniFarmLogo: React.FC<{ size?: number }> = ({ size = 72 }) => (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="72" rx="20" fill="url(#lg-bg)" />
        {/* Stem */}
        <path d="M36 52 L36 32" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        {/* Left leaf */}
        <path d="M36 40 C30 36 22 36 20 28 C28 26 34 30 36 38" fill="white" fillOpacity="0.9"/>
        {/* Right leaf */}
        <path d="M36 34 C42 30 50 30 52 22 C44 20 38 24 36 32" fill="white" fillOpacity="0.7"/>
        {/* Ground arc */}
        <path d="M28 52 Q36 48 44 52" stroke="white" strokeWidth="2.4" strokeLinecap="round" fillOpacity="0"/>
        <defs>
            <linearGradient id="lg-bg" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4D7C0F"/>
                <stop offset="1" stopColor="#365A0A"/>
            </linearGradient>
        </defs>
    </svg>
);

/* ── Official brand logos (canonical SVG paths) ── */
const GoogleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);

const AppleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
);

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="6" y="1.5" width="8" height="17" rx="2.2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="15.5" r="0.9" fill="currentColor"/>
        <path d="M8.6 4h2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [comingSoon, setComingSoon] = useState<string | null>(null);
    const [farmLogo, setFarmLogo] = useState<string | null>(null);
    const [farmName, setFarmName] = useState<string>('Bondeni Farm');
    const { login } = useAuth();
    const navigate = useNavigate();

    const pageRef    = useRef<HTMLDivElement>(null);
    const logoRef    = useRef<HTMLDivElement>(null);
    const cardRef    = useRef<HTMLDivElement>(null);
    const orb1Ref    = useRef<HTMLDivElement>(null);
    const orb2Ref    = useRef<HTMLDivElement>(null);
    const toastRef   = useRef<HTMLDivElement>(null);

    // Entrance animation
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo(orb1Ref.current,  { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, 0)
          .fromTo(orb2Ref.current,  { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, 0.1)
          .fromTo(logoRef.current,  { y: -24, opacity: 0 },     { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.2)
          .fromTo(cardRef.current,  { y: 32, opacity: 0 },      { y: 0, opacity: 1, duration: 0.6 }, 0.4);

        // Orbs idle float
        gsap.to(orb1Ref.current, { y: 30, x: -20, duration: 8,  ease: 'sine.inOut', repeat: -1, yoyo: true });
        gsap.to(orb2Ref.current, { y: -25, x: 18, duration: 10, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });
    }, []);

    // Pull the farm's branding (logo + name) set in Settings — public endpoint.
    useEffect(() => {
        api.get('/farm/profile/')
            .then((res) => {
                if (res.data?.logo) setFarmLogo(res.data.logo);
                if (res.data?.name) setFarmName(res.data.name);
            })
            .catch(() => { /* fall back to default logomark */ });
    }, []);

    // Coming-soon toast
    const showComingSoonFor = (label: string) => {
        setComingSoon(label);
        if (toastRef.current) {
            gsap.fromTo(toastRef.current,
                { y: 12, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
            );
        }
        setTimeout(() => {
            if (toastRef.current) {
                gsap.to(toastRef.current, {
                    y: -8, opacity: 0, duration: 0.25, ease: 'power2.in',
                    onComplete: () => setComingSoon(null)
                });
            }
        }, 2200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const btn = e.currentTarget.querySelector('button[type="submit"]') as HTMLElement;
        if (btn) gsap.to(btn, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 });

        try {
            const response = await api.post('/auth/login/', { username: email, password });
            await login(response.data.token);
            if (cardRef.current) {
                gsap.to(cardRef.current, {
                    opacity: 0, y: -20, duration: 0.3, ease: 'power2.in',
                    onComplete: () => { navigate('/app', { replace: true }); }
                });
            } else {
                navigate('/app', { replace: true });
            }
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 400 || status === 401) {
                setError('Invalid credentials. Please try again.');
            } else if (err?.request) {
                setError('Cannot reach the server. Check your connection.');
            } else {
                setError(`Login failed${status ? ` (${status})` : ''}. Please try again.`);
            }
            if (cardRef.current) {
                gsap.to(cardRef.current, {
                    keyframes: { x: [-10, 10, -7, 7, -3, 3, 0] },
                    duration: 0.5, ease: 'power2.out',
                });
            }
            setIsLoading(false);
        }
    };

    return (
        <div ref={pageRef} className="lp-page">
            {/* Ambient orbs */}
            <div ref={orb1Ref} className="lp-orb lp-orb-1" />
            <div ref={orb2Ref} className="lp-orb lp-orb-2" />

            {/* Coming-soon toast */}
            {comingSoon && (
                <div ref={toastRef} className="lp-toast">
                    ✦ {comingSoon} — Coming Soon
                </div>
            )}

            <div className="lp-wrap">
                {/* Logo block — reflects the logo uploaded in Settings */}
                <div ref={logoRef} className="lp-brand">
                    {farmLogo ? (
                        <img src={farmLogo} alt={farmName} className="lp-logo-img" />
                    ) : (
                        <BondeniFarmLogo size={72} />
                    )}
                    <h1 className="lp-name">{farmName}</h1>
                    <p className="lp-tagline">Smart Farm Management</p>
                </div>

                {/* Glass card */}
                <div ref={cardRef} className="lp-card">
                    <div className="lp-card-inner">
                        <h2 className="lp-heading">Welcome back</h2>
                        <p className="lp-sub">Sign in to continue managing your farm</p>

                        {/* Brand auth — horizontal, icon-only */}
                        <div className="lp-social">
                            <button
                                type="button"
                                className="lp-social-btn lp-btn-apple"
                                onClick={() => showComingSoonFor('Apple')}
                                aria-label="Continue with Apple"
                                title="Continue with Apple"
                            >
                                <AppleIcon />
                            </button>
                            <button
                                type="button"
                                className="lp-social-btn lp-btn-google"
                                onClick={() => showComingSoonFor('Google')}
                                aria-label="Continue with Google"
                                title="Continue with Google"
                            >
                                <GoogleIcon />
                            </button>
                            <button
                                type="button"
                                className="lp-social-btn lp-btn-phone"
                                onClick={() => showComingSoonFor('Phone')}
                                aria-label="Continue with Phone"
                                title="Continue with Phone"
                            >
                                <PhoneIcon />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="lp-divider">
                            <span>or continue with email</span>
                        </div>

                        {/* Credentials form */}
                        <form onSubmit={handleSubmit} className="lp-form">
                            <div className="lp-field">
                                <label className="lp-label">Email address</label>
                                <input
                                    type="email"
                                    className="lp-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="farmer@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="lp-field">
                                <label className="lp-label">Password</label>
                                <div className="lp-input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="lp-input lp-input-pw"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="lp-eye"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                        aria-label="Toggle password"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="lp-error" role="alert">{error}</div>
                            )}

                            <button type="submit" className="lp-submit" disabled={isLoading}>
                                {isLoading
                                    ? <span className="lp-spinner" />
                                    : <><span>Sign In</span><ArrowRight size={17} /></>
                                }
                            </button>
                        </form>
                    </div>
                </div>

                <p className="lp-footer">
                    Livestock · Crops · Workforce · Commerce
                </p>
            </div>

            <style>{`
                /* ── Page shell ── */
                .lp-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(ellipse 90% 55% at 50% -10%, #1a3409 0%, transparent 55%),
                                radial-gradient(ellipse 70% 50% at 85% 100%, #0a1f12 0%, transparent 55%),
                                linear-gradient(170deg, #0a1505 0%, #05080a 55%, #02040a 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 1.5rem 1rem;
                }
                [data-theme='light'] .lp-page {
                    background: radial-gradient(ellipse 80% 60% at 20% 10%, #ECFCE5 0%, transparent 60%),
                                radial-gradient(ellipse 60% 50% at 80% 90%, #EFF6FF 0%, transparent 60%),
                                #F5FFF4;
                }

                /* ── Ambient orbs ── */
                .lp-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(70px);
                }
                .lp-orb-1 {
                    width: 420px; height: 420px;
                    top: -120px; left: -80px;
                    background: radial-gradient(circle, rgba(77,124,15,0.35) 0%, transparent 70%);
                }
                .lp-orb-2 {
                    width: 360px; height: 360px;
                    bottom: -100px; right: -60px;
                    background: radial-gradient(circle, rgba(59,130,246,0.20) 0%, transparent 70%);
                }
                [data-theme='light'] .lp-orb-1 {
                    background: radial-gradient(circle, rgba(77,124,15,0.18) 0%, transparent 70%);
                }
                [data-theme='light'] .lp-orb-2 {
                    background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
                }

                /* ── Coming-soon toast ── */
                .lp-toast {
                    position: fixed;
                    top: 1.5rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #1e2d12, #2a3f18);
                    border: 1px solid rgba(77,124,15,0.4);
                    color: #a3e635;
                    font-size: 0.82rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                    padding: 0.6rem 1.2rem;
                    border-radius: 99px;
                    z-index: 999;
                    white-space: nowrap;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                }
                [data-theme='light'] .lp-toast {
                    background: linear-gradient(135deg, #ecfce5, #f0fdf4);
                    border-color: rgba(77,124,15,0.3);
                    color: #3f6212;
                }

                /* ── Centered wrapper ── */
                .lp-wrap {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.75rem;
                }

                /* ── Brand block ── */
                .lp-brand {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.6rem;
                }
                .lp-logo-img {
                    width: 72px;
                    height: 72px;
                    border-radius: 20px;
                    object-fit: cover;
                    background: #fff;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
                }
                .lp-name {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    background: linear-gradient(135deg, #a3e635 20%, #4D7C0F 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                [data-theme='light'] .lp-name {
                    background: linear-gradient(135deg, #3f6212 20%, #4D7C0F 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .lp-tagline {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                /* ── Glass card ── */
                .lp-card {
                    width: 100%;
                    border-radius: 24px;
                    background: color-mix(in srgb, var(--bg-card) 72%, transparent);
                    backdrop-filter: blur(20px) saturate(160%);
                    -webkit-backdrop-filter: blur(20px) saturate(160%);
                    border: 1px solid color-mix(in srgb, var(--text-main) 10%, transparent);
                    box-shadow:
                        0 24px 64px rgba(0,0,0,0.35),
                        inset 0 1px 0 color-mix(in srgb, #fff 14%, transparent);
                }
                [data-theme='light'] .lp-card {
                    box-shadow: 0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
                }
                .lp-card-inner {
                    padding: 2rem 2rem 2.25rem;
                }
                .lp-heading {
                    margin: 0 0 0.2rem;
                    font-size: 1.375rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }
                .lp-sub {
                    margin: 0 0 1.5rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                /* ── Brand auth buttons — horizontal, icon-only ── */
                .lp-social {
                    display: flex;
                    flex-direction: row;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                .lp-social-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 1;
                    height: 52px;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                .lp-social-btn:active { transform: scale(0.96); }

                /* Apple — monochrome dark */
                .lp-btn-apple {
                    background: #000;
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.16);
                }
                .lp-btn-apple:hover { filter: brightness(1.25); }
                [data-theme='light'] .lp-btn-apple {
                    background: #000;
                    color: #fff;
                    border-color: transparent;
                }

                /* Google — white surface, brand-approved */
                .lp-btn-google {
                    background: #fff;
                    border: 1px solid #dadce0;
                }
                .lp-btn-google:hover {
                    box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15);
                }

                /* Phone — neutral glass outline */
                .lp-btn-phone {
                    background: color-mix(in srgb, var(--bg-main) 55%, transparent);
                    color: var(--text-main);
                    border: 1px solid color-mix(in srgb, var(--text-main) 14%, transparent);
                }
                .lp-btn-phone:hover {
                    background: color-mix(in srgb, var(--bg-card-hover) 75%, transparent);
                    border-color: color-mix(in srgb, var(--text-main) 24%, transparent);
                }

                /* ── Divider ── */
                .lp-divider {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .lp-divider::before,
                .lp-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border);
                }

                /* ── Form ── */
                .lp-form { display: flex; flex-direction: column; gap: 1.1rem; }
                .lp-field { display: flex; flex-direction: column; gap: 0.45rem; }
                .lp-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .lp-input-wrap { position: relative; display: flex; align-items: center; }
                .lp-input {
                    width: 100%;
                    padding: 0.85rem 1rem;
                    background: color-mix(in srgb, var(--bg-main) 80%, transparent);
                    border: 1.5px solid var(--border);
                    border-radius: 14px;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .lp-input::placeholder { color: var(--text-muted); opacity: 0.55; }
                .lp-input:focus {
                    border-color: #4D7C0F;
                    box-shadow: 0 0 0 3px rgba(77,124,15,0.18);
                }
                .lp-input-pw { padding-right: 3rem; }
                .lp-eye {
                    position: absolute; right: 0.85rem;
                    background: none; border: none;
                    color: var(--text-muted);
                    cursor: pointer; padding: 0.25rem;
                    display: flex; align-items: center;
                    border-radius: 6px;
                    transition: color 0.2s;
                }
                .lp-eye:hover { color: #4D7C0F; }

                /* ── Error ── */
                .lp-error {
                    padding: 0.7rem 1rem;
                    background: rgba(239,68,68,0.09);
                    border: 1px solid rgba(239,68,68,0.22);
                    border-radius: 12px;
                    color: #EF4444;
                    font-size: 0.83rem;
                }

                /* ── Submit ── */
                .lp-submit {
                    margin-top: 0.25rem;
                    width: 100%;
                    height: 52px;
                    border: none;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #65a30d 0%, #4D7C0F 55%, #3f6212 100%);
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: transform 0.18s ease, box-shadow 0.25s ease, filter 0.2s ease;
                    box-shadow:
                        0 0 0 1px rgba(132,204,22,0.25),
                        0 8px 24px rgba(77,124,15,0.40),
                        0 0 36px rgba(101,163,13,0.25),
                        inset 0 1px 0 rgba(255,255,255,0.18);
                }
                .lp-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.06);
                    box-shadow:
                        0 0 0 1px rgba(132,204,22,0.4),
                        0 12px 32px rgba(77,124,15,0.5),
                        0 0 56px rgba(101,163,13,0.4),
                        inset 0 1px 0 rgba(255,255,255,0.22);
                }
                .lp-submit:active:not(:disabled) { transform: scale(0.98); }
                .lp-submit:disabled { opacity: 0.65; cursor: not-allowed; }

                /* ── Spinner ── */
                .lp-spinner {
                    width: 18px; height: 18px;
                    border: 2.5px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: lp-spin 0.65s linear infinite;
                }
                @keyframes lp-spin { to { transform: rotate(360deg); } }

                /* ── Footer ── */
                .lp-footer {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    text-align: center;
                    opacity: 0.55;
                    letter-spacing: 0.03em;
                }

                /* ── Mobile: card slides up from the bottom ── */
                @media (max-width: 480px) {
                    .lp-page {
                        padding: 0;
                        align-items: flex-end;
                        justify-content: flex-start;
                        flex-direction: column;
                    }
                    .lp-wrap {
                        max-width: 100%;
                        min-height: 100svh;
                        justify-content: flex-end;
                        gap: 0;
                        padding: 0;
                    }
                    .lp-brand {
                        padding: 2.5rem 1.5rem 1.75rem;
                        width: 100%;
                    }
                    .lp-card {
                        border-radius: 28px 28px 0 0;
                        border-bottom: none;
                        box-shadow: 0 -12px 48px rgba(0,0,0,0.35),
                                    inset 0 1px 0 color-mix(in srgb, #fff 14%, transparent);
                    }
                    .lp-card-inner {
                        padding: 1.75rem 1.5rem calc(2.5rem + env(safe-area-inset-bottom, 0px));
                    }
                    .lp-footer {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
