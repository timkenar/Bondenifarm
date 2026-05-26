import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Sprout, Eye, EyeOff, ArrowRight, Leaf, Sun, CloudRain, Wheat } from 'lucide-react';
import gsap from 'gsap';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(logoRef.current,
            { opacity: 0, y: -30, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
        )
        .fromTo(formRef.current,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
            '-=0.3'
        );

        if (floatingRef.current) {
            const icons = floatingRef.current.querySelectorAll('.floating-icon');
            icons.forEach((icon, i) => {
                gsap.to(icon, {
                    y: `random(-20, 20)`,
                    x: `random(-10, 10)`,
                    rotation: `random(-15, 15)`,
                    duration: `random(3, 5)`,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.5,
                });
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const btn = e.currentTarget.querySelector('button[type="submit"]');
        if (btn) gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });

        try {
            const response = await api.post('/auth/login/', { username: email, password });
            await login(response.data.token);

            if (formRef.current) {
                gsap.to(formRef.current, {
                    opacity: 0, y: -20, duration: 0.3, ease: 'power2.in',
                    onComplete: () => { navigate('/'); }
                });
            } else {
                navigate('/');
            }
        } catch (err: any) {
            if (err?.response) {
                const status = err.response.status;
                if (status === 400 || status === 401) {
                    setError('Invalid credentials. Please try again.');
                } else {
                    setError(`Login failed (${status}). Please try again.`);
                }
            } else if (err?.request) {
                setError('Cannot reach the server. Check your connection or CORS settings.');
            } else {
                setError('Unexpected error. Please try again.');
            }
            if (formRef.current) {
                gsap.to(formRef.current, {
                    keyframes: { x: [-8, 8, -6, 6, -3, 3, 0] },
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="login-page">
            <div ref={floatingRef} className="login-floating-bg">
                <div className="floating-icon" style={{ top: '10%', left: '10%' }}>
                    <Leaf size={32} style={{ opacity: 0.15, color: '#4D7C0F' }} />
                </div>
                <div className="floating-icon" style={{ top: '20%', right: '15%' }}>
                    <Sun size={28} style={{ opacity: 0.12, color: '#F59E0B' }} />
                </div>
                <div className="floating-icon" style={{ bottom: '30%', left: '8%' }}>
                    <Wheat size={36} style={{ opacity: 0.1, color: '#4D7C0F' }} />
                </div>
                <div className="floating-icon" style={{ bottom: '15%', right: '12%' }}>
                    <CloudRain size={30} style={{ opacity: 0.1, color: '#3B82F6' }} />
                </div>
                <div className="floating-icon" style={{ top: '50%', left: '5%' }}>
                    <Sprout size={24} style={{ opacity: 0.12, color: '#4D7C0F' }} />
                </div>
                <div className="floating-icon" style={{ top: '40%', right: '5%' }}>
                    <Leaf size={20} style={{ opacity: 0.08, color: '#4D7C0F' }} />
                </div>
            </div>

            <div className="login-container">
                <div ref={logoRef} className="login-header">
                    <div className="login-logo">
                        <div className="login-logo-circle">
                            <Sprout size={36} color="white" />
                        </div>
                    </div>
                    <h1 className="login-title">Bondeni Farm</h1>
                    <p className="login-subtitle">Smart Farm Management</p>
                </div>

                <div ref={formRef} className="login-card">
                    <div className="login-card-accent" />
                    <div className="login-card-content">
                        <h2 className="login-welcome">Welcome back</h2>
                        <p className="login-desc">Sign in to continue managing your farm</p>
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="login-field">
                                <label className="login-label">Email address</label>
                                <div className="login-input-wrapper">
                                    <input
                                        type="email"
                                        className="login-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="farmer@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <div className="login-field">
                                <label className="login-label">Password</label>
                                <div className="login-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="login-input login-input-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="login-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            {error && (
                                <div className="login-error">
                                    <span>{error}</span>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="login-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="login-spinner" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                <p className="login-footer">
                    Manage livestock, crops & workforce — all in one place
                </p>
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 1rem;
                }
                [data-theme='light'] .login-page {
                    background: linear-gradient(160deg, #F7FEE7 0%, #F7FEE7 30%, #F8FAFC 100%);
                }
                .login-floating-bg {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .floating-icon {
                    position: absolute;
                }
                .login-container {
                    width: 100%;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .login-logo {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1rem;
                }
                .login-logo-circle {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4D7C0F, #4D7C0F);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 32px rgba(77, 124, 15, 0.3), 0 0 0 4px rgba(77, 124, 15, 0.1);
                    animation: pulse-glow 3s ease-in-out infinite;
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 8px 32px rgba(77, 124, 15, 0.3), 0 0 0 4px rgba(77, 124, 15, 0.1); }
                    50% { box-shadow: 0 8px 40px rgba(77, 124, 15, 0.5), 0 0 0 8px rgba(77, 124, 15, 0.05); }
                }
                .login-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(135deg, #4D7C0F, #4D7C0F);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .login-subtitle {
                    margin: 0.25rem 0 0;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }
                .login-card {
                    width: 100%;
                    background: var(--bg-card);
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
                    position: relative;
                }
                [data-theme='light'] .login-card {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
                }
                .login-card-accent {
                    height: 4px;
                    background: linear-gradient(90deg, #4D7C0F, #4D7C0F, #4D7C0F);
                }
                .login-card-content {
                    padding: 2rem;
                }
                .login-welcome {
                    margin: 0 0 0.25rem;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .login-desc {
                    margin: 0 0 1.75rem;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .login-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .login-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .login-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .login-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: var(--bg-main);
                    border: 1.5px solid var(--border);
                    border-radius: 0.75rem;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
                    box-sizing: border-box;
                }
                .login-input:focus {
                    border-color: #4D7C0F;
                    box-shadow: 0 0 0 3px rgba(77, 124, 15, 0.15);
                    background: var(--bg-card);
                }
                .login-input::placeholder {
                    color: var(--text-muted);
                    opacity: 0.6;
                }
                .login-input-password {
                    padding-right: 3rem;
                }
                .login-eye-btn {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    border-radius: 4px;
                    transition: color 0.2s;
                }
                .login-eye-btn:hover {
                    color: var(--primary);
                }
                .login-error {
                    padding: 0.75rem 1rem;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 0.5rem;
                    color: #EF4444;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .login-btn {
                    width: 100%;
                    padding: 0.9rem;
                    border: none;
                    border-radius: 0.75rem;
                    background: linear-gradient(135deg, #4D7C0F, #4D7C0F);
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(77, 124, 15, 0.3);
                    margin-top: 0.5rem;
                }
                .login-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(77, 124, 15, 0.4);
                }
                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .login-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2.5px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .login-footer {
                    margin-top: 1.5rem;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-align: center;
                    opacity: 0.7;
                }
                @media (max-width: 480px) {
                    .login-page {
                        padding: 0;
                        align-items: stretch;
                    }
                    .login-container {
                        max-width: 100%;
                        min-height: 100vh;
                        justify-content: center;
                    }
                    .login-header {
                        margin-bottom: 1.5rem;
                        padding: 0 1rem;
                    }
                    .login-card {
                        border-radius: 1.5rem 1.5rem 0 0;
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        margin-top: auto;
                        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
                    }
                    .login-card-content {
                        padding: 1.75rem 1.5rem 2.5rem;
                        flex: 1;
                    }
                    .login-footer {
                        padding: 0 1.5rem 1.5rem;
                        margin: 0;
                    }
                    .login-logo-circle {
                        width: 64px;
                        height: 64px;
                    }
                    .login-title {
                        font-size: 1.5rem;
                    }
                }
                @media (min-width: 481px) and (max-width: 768px) {
                    .login-container {
                        max-width: 420px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
