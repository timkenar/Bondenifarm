import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Moon, Sun, Shield, Smartphone } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    // We'll manage theme state locally or via context if moved there, 
    // for now we can read/write to document attribute directly as done in Layout.
    // Ideally theme state should be in a Context, but checking local storage/attribute works for simple app.

    // Helper to toggle theme manually (simulating the layout one if we don't lift state up)
    // For a robust app, ThemeContext is better. We'll rely on the Layout's toggle for the main switch, 
    // or add a toggle here that modifies the same DOM attribute.


    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', newTheme);
        // Force re-render if needed or just let CSS handle it
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Settings & Profile</h2>

            {/* Profile Section */}
            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    boxShadow: 'var(--shadow)'
                }}>
                    {user?.full_name?.charAt(0) || <User size={48} />}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{user?.full_name || 'Guest User'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={16} />
                            {user?.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Shield size={16} />
                            <span style={{ textTransform: 'capitalize' }}>{user?.role?.toLowerCase().replace('_', ' ') || 'User'}</span>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <span style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--primary)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '99px',
                                fontSize: '0.875rem'
                            }}>
                                Active Account
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Settings */}
            <div className="card">
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Application Preferences</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                            <Moon size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 500 }}>Appearance</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customize how Bondeni Farm looks on your device.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => handleThemeChange('light')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-muted)'
                            }}
                        >
                            <Sun size={18} /> Light
                        </button>
                        <button
                            onClick={() => handleThemeChange('dark')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: 'none',
                                background: 'var(--bg-card)', // Active style mockup
                                boxShadow: 'var(--shadow-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--text-main)'
                            }}
                        >
                            <Moon size={18} /> Dark
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 500 }}>Device Settings</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage device-specific preferences.</p>
                        </div>
                    </div>
                    <button className="btn" style={{ fontSize: '0.875rem', color: 'var(--primary)', padding: 0 }}>
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
