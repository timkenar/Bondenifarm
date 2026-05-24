import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    /** Modal width preset. Defaults to 'md' (560px). */
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP: Record<NonNullable<ModalProps['size']>, string> = {
    sm: '420px',
    md: '560px',
    lg: '720px',
    xl: '960px',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
        }
    }, [isOpen]);

    // Lock body scroll while modal is open + close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    useGSAP(() => {
        if (isOpen && render) {
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.25, ease: 'power2.out' }
            );
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.96, y: 16 },
                { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.2)', delay: 0.05 }
            );
        } else if (!isOpen && render) {
            const tl = gsap.timeline({
                onComplete: () => setRender(false)
            });
            tl.to(modalRef.current, { opacity: 0, scale: 0.96, y: 8, duration: 0.18, ease: 'power2.in' })
                .to(overlayRef.current, { opacity: 0, duration: 0.18 }, '-=0.1');
        }
    }, [isOpen, render]);

    if (!render) return null;

    return (
        <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 100,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                opacity: 0,
            }}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div
                ref={modalRef}
                className="modal-panel"
                style={{
                    width: '100%',
                    maxWidth: SIZE_MAP[size],
                    maxHeight: 'calc(100vh - 2rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        flexShrink: 0,
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.3 }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        type="button"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            padding: 0,
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid transparent',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-card-hover)';
                            e.currentTarget.style.color = 'var(--text-main)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div
                    className="modal-body"
                    style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;

