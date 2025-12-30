import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [render, setRender] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setRender(true);
        }
    }, [isOpen]);

    useGSAP(() => {
        if (isOpen && render) {
            // Animate In
            gsap.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)', delay: 0.1 }
            );
        } else if (!isOpen && render) {
            // Animate Out
            const tl = gsap.timeline({
                onComplete: () => setRender(false)
            });
            tl.to(modalRef.current, { opacity: 0, scale: 0.95, y: 10, duration: 0.2, ease: 'power2.in' })
                .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
        }
    }, [isOpen, render]);

    if (!render) return null;

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                backdropFilter: 'blur(5px)',
                opacity: 0 // Start hidden for GSAP to handle
            }}
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div
                ref={modalRef}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    margin: '1rem',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    opacity: 0, // Start hidden
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem'
                }}>
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}
                    >
                        <X size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
