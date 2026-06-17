import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import MobileNav from './MobileNav';
import { filterNavByRole } from '../config/permissions';
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
    Wheat,
    Milk
} from 'lucide-react';

const Layout: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop
    const location = useLocation();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [farmName, setFarmName] = useState('Bondeni Farm');
    const [farmLogo, setFarmLogo] = useState<string | null>(null);

    useEffect(() => {
        api.get('/farm/profile/')
            .then((res) => {
                if (res.data?.name) setFarmName(res.data.name);
                if (res.data?.logo) setFarmLogo(res.data.logo);
            })
            .catch(() => { /* keep defaults */ });
    }, []);

    const initials = (farmName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()) || 'BF';

    const logoMark = farmLogo ? (
        <img src={farmLogo} alt={farmName} style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
    ) : (
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sprout color="white" size={20} />
        </div>
    );

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const allNavItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/livestock', icon: <Beef size={20} />, label: 'Livestock' },
        { path: '/crops', icon: <Wheat size={20} />, label: 'Crops' },
        { path: '/produce', icon: <Milk size={20} />, label: 'Produce' },
        { path: '/inventory', icon: <Wrench size={20} />, label: 'Inventory' },
        { path: '/workforce', icon: <Users size={20} />, label: 'Workforce' },
        { path: '/commerce', icon: <ShoppingCart size={20} />, label: 'Commerce' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];
    const navItems = filterNavByRole(allNavItems, user?.role);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarCollapsed ? '60px' : '195px',
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
                <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', gap: '0.5rem', borderBottom: '1px solid var(--border)', height: '64px', boxSizing: 'border-box' }}>
                    {sidebarCollapsed ? (
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                        >
                            {logoMark}
                        </button>
                    ) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                                {logoMark}
                                <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{initials}</span>
                            </div>
                            <button
                                onClick={() => setSidebarCollapsed(true)}
                                title="Collapse sidebar"
                                aria-label="Collapse sidebar"
                                style={{ background: 'transparent', border: 'none', padding: '0.3rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', borderRadius: '6px' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </>
                    )}
                </div>

                <nav style={{ flex: 1, padding: sidebarCollapsed ? '1rem 0.5rem' : '1rem' }}>
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
                                        padding: sidebarCollapsed ? '0.75rem 0' : '0.75rem 1rem',
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

                <div style={{ padding: sidebarCollapsed ? '0.75rem 0.5rem' : '1rem', borderTop: '1px solid var(--border)' }}>
                    {sidebarCollapsed ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div title={user?.full_name || 'User'} style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                aria-label="Logout"
                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem', borderRadius: 'var(--radius)', background: 'var(--bg-main)' }}>
                            <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || 'User'}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                aria-label="Logout"
                                style={{ width: '34px', height: '34px', minWidth: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
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
                <header className="app-header" style={{
                    height: '64px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 1.5rem',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                }}>
                    <button className="btn mobile-toggle" onClick={() => setSidebarOpen(true)} style={{ padding: '0.5rem' }}>
                        <Menu size={24} />
                    </button>
                    <h2 className="app-header-title" style={{ fontSize: '1.25rem', margin: 0 }}>
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
            <MobileNav onLogout={handleLogout} role={user?.role} />

            <style>{`
                @media (max-width: 767px) {
                    .sidebar-desktop {
                        display: none !important;
                    }
                    .mobile-toggle {
                        display: none !important;
                    }
                    .app-header {
                        padding: 0 0.75rem !important;
                    }
                    .app-header h2 {
                        font-size: 1rem !important;
                    }
                    .main-content > div {
                        padding: 1rem !important;
                        padding-bottom: 6rem !important;
                    }
                }

                @media (min-width: 768px) {
                    .sidebar-desktop {
                        transform: translateX(0) !important;
                    }
                    .main-content {
                        margin-left: ${sidebarCollapsed ? '60px' : '195px'} !important;
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
