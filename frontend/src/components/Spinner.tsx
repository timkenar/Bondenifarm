import React from 'react';

const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'var(--primary)' }) => {
    return (
        <div style={{
            width: size,
            height: size,
            border: `3px solid rgba(255,255,255,0.1)`,
            borderTopColor: color,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }}>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Spinner;
