import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import {
    LayoutDashboard,
    Beef,
    Wheat,
    ShoppingCart,
    Milk,
    Wrench,
    Users,
    Settings,
    LogOut,
    Grip,
    X,
} from 'lucide-react';

import { filterNavByRole } from '../config/permissions';
import type { UserRole } from '../types';

export interface MobileNavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    accent: string;
}

const ICON = 22;

// Full ordered list of destinations. The first few the role can access live on
// the floating bar; the rest move into the "More" sheet so nothing is squeezed.
const allItems: MobileNavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={ICON} />, accent: '#4D7C0F' },
    { path: '/livestock', label: 'Livestock', icon: <Beef size={ICON} />, accent: '#F59E0B' },
    { path: '/crops', label: 'Crops', icon: <Wheat size={ICON} />, accent: '#22C55E' },
    { path: '/commerce', label: 'Commerce', icon: <ShoppingCart size={ICON} />, accent: '#F43F5E' },
    { path: '/produce', label: 'Produce', icon: <Milk size={ICON} />, accent: '#0EA5E9' },
    { path: '/inventory', label: 'Inventory', icon: <Wrench size={ICON} />, accent: '#8B5CF6' },
    { path: '/workforce', label: 'Workforce', icon: <Users size={ICON} />, accent: '#6366F1' },
    { path: '/settings', label: 'Settings', icon: <Settings size={ICON} />, accent: '#64748B' },
];

interface MobileNavProps {
    onLogout: () => void;
    role?: UserRole;
}

const MobileNav: React.FC<MobileNavProps> = ({ onLogout, role }) => {
    const location = useLocation();
    const [sheetOpen, setSheetOpen] = useState(false);

    const barRef = useRef<HTMLElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);

    // Only show destinations this role is allowed to access. Up to 4 live on the
    // bar; anything beyond that drops into the "More" sheet.
    const visibleItems = filterNavByRole(allItems, role);
    const primaryItems = visibleItems.slice(0, 4);
    const sheetItems = visibleItems.slice(4);

    const isPrimaryActive = primaryItems.some((i) => i.path === location.pathname);

    // Entrance: float the bar up on first paint.
    useEffect(() => {
        if (barRef.current) {
            gsap.fromTo(
                barRef.current,
                { y: 120, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)', delay: 0.1 }
            );
        }
    }, []);

    // Open/close the glass sheet with GSAP.
    useEffect(() => {
        const overlay = overlayRef.current;
        const sheet = sheetRef.current;
        if (!overlay || !sheet) return;

        if (sheetOpen) {
            overlay.style.pointerEvents = 'auto';
            gsap.to(overlay, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
            gsap.fromTo(
                sheet,
                { y: '110%' },
                { y: '0%', duration: 0.5, ease: 'power3.out' }
            );
            gsap.fromTo(
                sheet.querySelectorAll('[data-sheet-tile]'),
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.05, delay: 0.12 }
            );
        } else {
            gsap.to(overlay, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
            gsap.to(sheet, {
                y: '110%',
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => {
                    overlay.style.pointerEvents = 'none';
                },
            });
        }
    }, [sheetOpen]);

    // Close the sheet whenever navigation happens.
    useEffect(() => {
        setSheetOpen(false);
    }, [location.pathname]);

    const handleTap = (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget.querySelector('[data-icon]') as HTMLElement | null;
        if (el) {
            gsap.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
        }
    };

    return (
        <>
            {/* Glass bottom sheet (the "More" menu) */}
            <div
                ref={overlayRef}
                className="mnav-overlay"
                onClick={() => setSheetOpen(false)}
            >
                <div
                    ref={sheetRef}
                    className="mnav-sheet"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mnav-sheet-grabber" />
                    <div className="mnav-sheet-header">
                        <span>More</span>
                        <button className="mnav-sheet-close" onClick={() => setSheetOpen(false)} aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="mnav-sheet-grid">
                        {sheetItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    data-sheet-tile
                                    className={`mnav-tile ${active ? 'active' : ''}`}
                                    style={{ '--tile-accent': item.accent } as React.CSSProperties}
                                    onClick={handleTap}
                                >
                                    <span className="mnav-tile-icon" data-icon>{item.icon}</span>
                                    <span className="mnav-tile-label">{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            data-sheet-tile
                            className="mnav-tile danger"
                            style={{ '--tile-accent': '#EF4444' } as React.CSSProperties}
                            onClick={(e) => { handleTap(e); onLogout(); }}
                        >
                            <span className="mnav-tile-icon" data-icon><LogOut size={26} /></span>
                            <span className="mnav-tile-label">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating glass bar */}
            <nav ref={barRef} className="mnav-bar" aria-label="Primary">
                {primaryItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`mnav-item ${active ? 'active' : ''}`}
                            style={{ '--item-accent': item.accent } as React.CSSProperties}
                            onClick={handleTap}
                        >
                            <span className="mnav-item-icon" data-icon>{item.icon}</span>
                            <span className="mnav-item-label">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    className={`mnav-item more ${sheetOpen || !isPrimaryActive ? 'active' : ''}`}
                    style={{ '--item-accent': '#A78BFA' } as React.CSSProperties}
                    onClick={(e) => { handleTap(e); setSheetOpen((v) => !v); }}
                    aria-label="More menu"
                    aria-expanded={sheetOpen}
                >
                    <span className="mnav-item-icon" data-icon><Grip size={ICON} /></span>
                    <span className="mnav-item-label">More</span>
                </button>
            </nav>

            <style>{`
                .mnav-bar,
                .mnav-overlay { display: none; }

                @media (max-width: 767px) {
                    /* ---- Floating glass bar ---- */
                    .mnav-bar {
                        display: flex;
                        position: fixed;
                        left: 50%;
                        transform: translateX(-50%);
                        bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
                        width: min(94%, 460px);
                        justify-content: space-between;
                        align-items: center;
                        gap: 0.35rem;
                        padding: 0.45rem 0.55rem;
                        z-index: 100;
                        border-radius: 30px;
                        background: linear-gradient(135deg,
                            color-mix(in srgb, var(--bg-card) 80%, transparent),
                            color-mix(in srgb, var(--bg-card) 62%, transparent));
                        backdrop-filter: blur(20px) saturate(170%);
                        -webkit-backdrop-filter: blur(20px) saturate(170%);
                        border: 1px solid color-mix(in srgb, var(--text-main) 12%, transparent);
                        box-shadow:
                            0 10px 34px rgba(0,0,0,0.30),
                            inset 0 1px 0 color-mix(in srgb, #fff 22%, transparent);
                    }

                    .mnav-item {
                        position: relative;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        gap: 0;
                        height: 44px;
                        padding: 0 0.7rem;
                        border: none;
                        background: transparent;
                        color: var(--text-muted);
                        text-decoration: none;
                        cursor: pointer;
                        border-radius: 22px;
                        transition: color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease;
                        -webkit-tap-highlight-color: transparent;
                    }

                    .mnav-item-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }

                    /* Labels are hidden by default — only the active item reveals
                       its label inside an expanding pill (premium iOS style). */
                    .mnav-item-label {
                        font-size: 0.78rem;
                        font-weight: 600;
                        letter-spacing: 0.01em;
                        line-height: 1;
                        white-space: nowrap;
                        max-width: 0;
                        opacity: 0;
                        overflow: hidden;
                        transition: max-width 0.3s ease, opacity 0.25s ease, margin 0.3s ease;
                    }

                    .mnav-item.active {
                        color: var(--item-accent);
                        background: linear-gradient(135deg,
                            color-mix(in srgb, var(--item-accent) 24%, transparent),
                            color-mix(in srgb, var(--item-accent) 10%, transparent));
                        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--item-accent) 35%, transparent);
                    }

                    .mnav-item.active .mnav-item-label {
                        max-width: 120px;
                        opacity: 1;
                        margin-left: 0.45rem;
                    }

                    /* ---- Overlay + sheet ---- */
                    .mnav-overlay {
                        display: block;
                        position: fixed;
                        inset: 0;
                        z-index: 110;
                        background: rgba(0,0,0,0.45);
                        backdrop-filter: blur(2px);
                        -webkit-backdrop-filter: blur(2px);
                        visibility: hidden;
                        opacity: 0;
                        pointer-events: none;
                    }

                    .mnav-sheet {
                        position: absolute;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        padding: 0.75rem 1.1rem calc(1.4rem + env(safe-area-inset-bottom, 0px));
                        border-radius: 28px 28px 0 0;
                        background: linear-gradient(180deg,
                            color-mix(in srgb, var(--bg-card) 88%, transparent),
                            color-mix(in srgb, var(--bg-card) 96%, transparent));
                        backdrop-filter: blur(24px) saturate(160%);
                        -webkit-backdrop-filter: blur(24px) saturate(160%);
                        border-top: 1px solid color-mix(in srgb, var(--text-main) 12%, transparent);
                        box-shadow: 0 -10px 40px rgba(0,0,0,0.3);
                        transform: translateY(110%);
                    }

                    .mnav-sheet-grabber {
                        width: 40px;
                        height: 4px;
                        border-radius: 99px;
                        background: var(--text-muted);
                        opacity: 0.5;
                        margin: 0.25rem auto 0.75rem;
                    }

                    .mnav-sheet-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                        font-size: 0.95rem;
                        font-weight: 700;
                        color: var(--text-main);
                    }

                    .mnav-sheet-close {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: none;
                        cursor: pointer;
                        color: var(--text-muted);
                        background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    }

                    .mnav-sheet-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.75rem;
                    }

                    .mnav-tile {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        padding: 1rem 0.5rem;
                        border-radius: 20px;
                        border: 1px solid color-mix(in srgb, var(--text-main) 8%, transparent);
                        background: color-mix(in srgb, var(--bg-main) 60%, transparent);
                        color: var(--text-main);
                        text-decoration: none;
                        cursor: pointer;
                        -webkit-tap-highlight-color: transparent;
                        transition: transform 0.2s ease, background 0.25s ease;
                    }

                    .mnav-tile:active { transform: scale(0.95); }

                    .mnav-tile-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 52px;
                        height: 52px;
                        border-radius: 16px;
                        color: var(--tile-accent);
                        background: radial-gradient(120% 120% at 50% 0%,
                            color-mix(in srgb, var(--tile-accent) 30%, transparent),
                            color-mix(in srgb, var(--tile-accent) 10%, transparent));
                        box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tile-accent) 35%, transparent);
                    }

                    .mnav-tile-label {
                        font-size: 0.72rem;
                        font-weight: 600;
                        color: var(--text-muted);
                    }

                    .mnav-tile.active {
                        background: color-mix(in srgb, var(--tile-accent) 14%, transparent);
                        border-color: color-mix(in srgb, var(--tile-accent) 40%, transparent);
                    }

                    .mnav-tile.active .mnav-tile-label { color: var(--tile-accent); }
                    .mnav-tile.danger .mnav-tile-label { color: #EF4444; }
                }
            `}</style>
        </>
    );
};

export default MobileNav;
