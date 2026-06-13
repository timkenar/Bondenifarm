import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface PageHeaderProps {
    /** Lucide (or any) icon element */
    icon: React.ReactNode;
    /** CSS colour string — e.g. '#F59E0B' or 'var(--primary)' */
    accent: string;
    title: string;
    subtitle?: React.ReactNode;
    /** Buttons / controls rendered on the right */
    actions?: React.ReactNode;
}

/**
 * Premium, mobile-first page header used on every main page.
 *
 * Anatomy (left → right):
 *   [ coloured icon badge ]  [ title / subtitle ]  ···  [ action buttons ]
 *
 * On phones the actions row wraps below the title so the buttons always have
 * enough tap area and are never squashed next to text.
 */
const PageHeader: React.FC<PageHeaderProps> = ({ icon, accent, title, subtitle, actions }) => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rootRef.current) return;
        const el = rootRef.current;
        gsap.fromTo(
            el,
            { y: -12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
        );
        // Stagger icon badge → title → actions
        gsap.fromTo(
            el.querySelectorAll('[data-ph]'),
            { y: 8, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.06, delay: 0.06 }
        );
    }, []);

    return (
        <div ref={rootRef} className="page-header">
            <div className="page-header-left">
                {/* Icon badge */}
                <div
                    data-ph
                    className="page-header-icon"
                    style={{
                        background: `${accent}20`,
                        border: `1px solid ${accent}35`,
                        color: accent,
                        boxShadow: `0 0 0 4px ${accent}10`,
                    }}
                >
                    {icon}
                </div>

                {/* Text block */}
                <div data-ph className="page-header-text">
                    <h2 className="page-header-title">{title}</h2>
                    {subtitle && (
                        <p className="page-header-subtitle">{subtitle}</p>
                    )}
                </div>
            </div>

            {actions && (
                <div data-ph className="page-header-actions">
                    {actions}
                </div>
            )}

            <style>{`
                .page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    margin-bottom: 1.75rem;
                    flex-wrap: wrap;
                }

                .page-header-left {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    min-width: 0;
                }

                .page-header-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    min-width: 48px;
                    border-radius: 14px;
                    transition: transform 0.2s ease;
                }

                .page-header-icon:hover {
                    transform: scale(1.05) rotate(-3deg);
                }

                .page-header-text {
                    min-width: 0;
                }

                .page-header-title {
                    margin: 0;
                    font-size: 1.375rem;
                    font-weight: 700;
                    letter-spacing: -0.018em;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .page-header-subtitle {
                    margin: 0.2rem 0 0;
                    font-size: 0.8125rem;
                    color: var(--text-muted);
                    line-height: 1.4;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .page-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }

                /* ---- Mobile: actions wrap below title as full-width row ---- */
                @media (max-width: 540px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.875rem;
                        margin-bottom: 1.25rem;
                    }

                    .page-header-title {
                        font-size: 1.2rem;
                    }

                    .page-header-actions {
                        width: 100%;
                    }

                    /* Make every direct button child fill the row equally */
                    .page-header-actions > .btn {
                        flex: 1;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default PageHeader;
