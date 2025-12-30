import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Beef,
    Wrench,
    Users,
    ShoppingCart,
    LogOut,
    Menu,
    Sprout,
    Sun,
    Moon,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
    const location = useLocation();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/livestock', icon: <Beef size={20} />, label: 'Livestock' },
        { path: '/produce', icon: <Sprout size={20} />, label: 'Produce' },
        { path: '/inventory', icon: <Wrench size={20} />, label: 'Inventory' },
        { path: '/workforce', icon: <Users size={20} />, label: 'Workforce' },
        { path: '/commerce', icon: <ShoppingCart size={20} />, label: 'Commerce' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarCollapsed ? '80px' : '260px',
                    backgroundColor: 'var(--bg-card)',
                    borderRight: '1px solid var(--border)',
                    position: 'fixed',
                    height: '100%',
                    left: 0,
                    top: 0,
                    zIndex: 50,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                className="sidebar-desktop"
            >
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '0.75rem', borderBottom: '1px solid var(--border)', height: '64px', boxSizing: 'border-box' }}>
                    <Sprout color="var(--primary)" size={24} />
                    {!sidebarCollapsed && <span style={{ fontWeight: 'bold', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Bondeni Farm</span>}
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
                                        backgroundColor: location.pathname === item.path ? 'var(--primary)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onClick={() => setSidebarOpen(false)}
                                    title={sidebarCollapsed ? item.label : ''}
                                >
                                    {item.icon}
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    {/* Desktop Sidebar Toggle */}
                    {!sidebarOpen && (
                        <button
                            className="btn desktop-toggle"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{
                                marginBottom: '1rem',
                                width: '100%',
                                justifyContent: 'center',
                                backgroundColor: 'var(--bg-main)',
                                color: 'var(--text-muted)'
                            }}
                        >
                            {sidebarCollapsed ? <ChevronRight size={16} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeft size={16} /> <span style={{ fontSize: '0.75rem' }}>Collapse</span></div>}
                        </button>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
                        <div style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        {!sidebarCollapsed && (
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || 'User'}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn"
                        style={{ width: '100%', justifyContent: sidebarCollapsed ? 'center' : 'flex-start', gap: '0.75rem', color: 'var(--danger)' }}
                    >
                        <LogOut size={20} />
                        {!sidebarCollapsed && 'Logout'}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}

            {/* Main Content */}
            <main style={{ flex: 1, marginLeft: '0' }} className="main-content">
                <header style={{
                    height: '64px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1.5rem',
                    background: 'var(--bg-dark)',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(17, 24, 39, 0.8)' // Use variable ideally, but hardcoded for glass effect
                }}>
                    <button className="btn mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem' }}>
                        <Menu size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                        {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <button className="btn" onClick={toggleTheme} style={{ padding: '0.5rem', color: 'var(--text-main)', marginLeft: 'auto' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </header>
                <div style={{ padding: '1.5rem', paddingBottom: '5rem' }}>
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation for Mobile */}
            <div className="bottom-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        {item.icon}

                    </Link>
                ))}
                <button onClick={handleLogout} className="bottom-nav-item" style={{ color: 'var(--danger)', background: 'none', border: 'none' }}>
                    <LogOut size={20} />
                </button>
            </div>

            <style>{`
                .bottom-nav {
                    display: none;
                }
                
                @media (max-width: 767px) {
                    .bottom-nav {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background-color: var(--bg-card);
                        border-top: 1px solid var(--border);
                        justify-content: space-around;
                        padding: 0.75rem 0;
                        z-index: 100;
                        height: 60px;
                        box-sizing: border-box;
                    }
                    .bottom-nav-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: var(--text-muted);
                        text-decoration: none;
                        font-size: 0.75rem;
                        gap: 2px;
                    }
                    .bottom-nav-item.active {
                        color: var(--primary);
                    }
                    .sidebar-desktop {
                        display: none !important;
                    }
                    .mobile-toggle {
                        display: none !important;
                    }
                }

                @media (min-width: 768px) {
                    .sidebar-desktop {
                        transform: translateX(0) !important;
                    }
                    .main-content {
                        margin-left: ${sidebarCollapsed ? '80px' : '260px'} !important;
                        transition: margin-left 0.3s ease;
                    }
                    .mobile-toggle {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Layout;
