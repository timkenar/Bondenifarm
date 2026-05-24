import { useEffect } from 'react';
import axios from 'axios';

// Maps backend LandingContent.color_* fields to CSS variable names on :root.
const COLOR_VAR_MAP: Record<string, string[]> = {
    color_primary: ['--primary', '--accent-crops'],
    color_primary_hover: ['--primary-hover'],
    color_accent: ['--accent'],
    color_danger: ['--danger'],
    color_landing_green: ['--ld-green'],
    color_landing_green_deep: ['--ld-green-deep'],
    color_landing_dark: ['--ld-dark'],
    color_landing_cream: ['--ld-cream'],
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Fetches LandingContent colours once on mount and applies them as CSS vars. */
export const useThemeLoader = () => {
    useEffect(() => {
        let cancelled = false;
        axios
            .get(`${API_BASE}/landing/content/`)
            .then(res => {
                if (cancelled) return;
                const root = document.documentElement;
                Object.entries(COLOR_VAR_MAP).forEach(([field, vars]) => {
                    const val = res.data?.[field];
                    if (val) vars.forEach(v => root.style.setProperty(v, val));
                });
            })
            .catch(() => { /* silent fallback to built-in defaults */ });
        return () => { cancelled = true; };
    }, []);
};
