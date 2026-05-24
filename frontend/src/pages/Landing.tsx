import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowUpRight,
    Sprout,
    Leaf,
    Sun,
    Tractor,
    BarChart3,
    Users,
    ShieldCheck,
    Globe2,
} from 'lucide-react';
import './Landing.css';

/**
 * Public marketing landing page for Bondeni Farms.
 *
 * Image slots are managed via the CMS endpoint (`/api/landing/content/`).
 * Each `data-image-slot` element gets its `backgroundImage` populated from
 * the matching field on the LandingContent singleton.
 */

const cropImages = [
    { slot: 'crop-coffee' },
    { slot: 'crop-maize' },
    { slot: 'crop-vegetables' },
    { slot: 'crop-avocado' },
];

const animalImages = [
    { slot: 'animal-cow' },
    { slot: 'animal-poultry' },
    { slot: 'animal-goat' },
    { slot: 'animal-sheep' },
];

/** Map from data-image-slot to backend field name on LandingContent. */
const SLOT_TO_FIELD: Record<string, string> = {
    'hero': 'hero_image',
    'hero-card': 'hero_card_image',
    'about-chip-1': 'about_chip_1',
    'about-chip-2': 'about_chip_2',
    'about-main': 'about_main',
    'feature-1': 'feature_1',
    'feature-2': 'feature_2',
    'feature-3': 'feature_3',
    'sustain': 'sustain_image',
    'advance': 'advance_image',
    'crop-coffee': 'crop_coffee',
    'crop-maize': 'crop_maize',
    'crop-vegetables': 'crop_vegetables',
    'crop-avocado': 'crop_avocado',
    'animal-cow': 'animal_cow',
    'animal-poultry': 'animal_poultry',
    'animal-goat': 'animal_goat',
    'animal-sheep': 'animal_sheep',
};

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const Landing: React.FC = () => {
    const [content, setContent] = useState<Record<string, string | null>>({});
    const [farm, setFarm] = useState<{ name?: string; logo?: string | null } | null>(null);

    useEffect(() => {
        axios.get(`${API_BASE}/landing/content/`)
            .then((res) => setContent(res.data || {}))
            .catch(() => { /* fall back to placeholder gradients */ });
        axios.get(`${API_BASE}/farm/profile/`)
            .then((res) => setFarm(res.data || null))
            .catch(() => { /* fall back to default brand */ });
    }, []);

    /** Build inline style for a slot — sets backgroundImage if CMS has a URL. */
    const slotStyle = (slot: string): React.CSSProperties | undefined => {
        const field = SLOT_TO_FIELD[slot];
        const url = field ? content[field] : null;
        return url ? { backgroundImage: `url(${url})` } : undefined;
    };

    // CMS-driven theme colours applied as CSS variables on .landing-root.
    const rootStyle = {
        ...(content.color_landing_green && { ['--ld-green' as string]: content.color_landing_green }),
        ...(content.color_landing_green_deep && { ['--ld-green-deep' as string]: content.color_landing_green_deep }),
        ...(content.color_landing_dark && { ['--ld-dark' as string]: content.color_landing_dark }),
        ...(content.color_landing_cream && { ['--ld-cream' as string]: content.color_landing_cream }),
    } as React.CSSProperties;

    return (
        <div className="landing-root" style={rootStyle}>
            {/* ===== Top Nav ===== */}
            <nav className="ld-nav">
                <div className="ld-nav-inner">
                    <Link to="/welcome" className="ld-brand">
                        <span className="ld-brand-icon">
                            {farm?.logo ? (
                                <img
                                    src={farm.logo}
                                    alt={farm.name || 'Farm logo'}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Sprout size={22} />
                            )}
                        </span>
                        <span>{farm?.name || 'Bondeni Farms'}</span>
                    </Link>
                    <div className="ld-nav-links">
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                        <a href="#advancement">Solutions</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="ld-nav-cta">
                        <Link to="/login" className="ld-btn ld-btn-ghost">Log in</Link>
                        <Link to="/login" className="ld-btn ld-btn-primary">
                            Get Started <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== Hero ===== */}
            <section className="ld-hero">
                <div
                    className="ld-hero-bg"
                    data-image-slot="hero"
                    style={slotStyle('hero')}
                    aria-hidden="true"
                />
                <div className="ld-hero-overlay" aria-hidden="true" />
                <div className="ld-hero-content">
                    <span className="ld-eyebrow">
                        <span className="ld-eyebrow-dot" /> Smart Farm Management
                    </span>
                    <h1 className="ld-hero-title">
                        Agricultural
                        <br />
                        <em>Innovation.</em>
                    </h1>
                    <p className="ld-hero-sub">
                        Farming starts with smarter insights. Unlock efficiency, resilience,
                        and long-term sustainability with climate-aware solutions for every
                        season at Bondeni Farms.
                    </p>
                    <div className="ld-hero-actions">
                        <Link to="/login" className="ld-pill ld-pill-light">
                            Start Managing <span className="ld-pill-arrow"><ArrowUpRight size={14} /></span>
                        </Link>
                        <a href="#about" className="ld-pill ld-pill-primary">
                            Meet the Farmers <span className="ld-pill-arrow"><ArrowUpRight size={14} /></span>
                        </a>
                    </div>
                </div>

                {/* Floating product card (like the inspiration's corn card) */}
                <div className="ld-hero-card">
                    <div className="ld-hero-card-header">
                        <span>Premium - Corn Harvest</span>
                        <ArrowUpRight size={14} />
                    </div>
                    <div
                        className="ld-hero-card-image"
                        data-image-slot="hero-card"
                        style={slotStyle('hero-card')}
                        aria-hidden="true"
                    />
                </div>
            </section>

            {/* ===== Trust Row ===== */}
            <section className="ld-trust">
                <p className="ld-trust-label">Trusted by growers &amp; supply-chain leaders</p>
                <div className="ld-trust-logos">
                    {['AgriCoop', 'GreenFields', 'FarmHub', 'HarvestPro'].map((n) => (
                        <div key={n} className="ld-trust-logo">
                            <Leaf size={18} /> <span>{n}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== About / Challenges ===== */}
            <section id="about" className="ld-about">
                <div className="ld-about-grid">
                    <div>
                        <span className="ld-chip">About Us</span>
                        <h2 className="ld-h2">
                            The challenges farmers
                            <span className="ld-inline-image" data-image-slot="about-chip-1" style={slotStyle('about-chip-1')} />
                            and rural communities face can be overcome through smart
                            <span className="ld-inline-image" data-image-slot="about-chip-2" style={slotStyle('about-chip-2')} />
                            agricultural innovation.
                        </h2>
                        <div className="ld-tag-row">
                            {['Smart Farming', 'Sustainable Growth', 'Agri Innovation', 'Future Harvest'].map(t => (
                                <span key={t} className="ld-tag">{t}</span>
                            ))}
                        </div>
                        <Link to="/login" className="ld-pill ld-pill-primary" style={{ marginTop: '1.5rem' }}>
                            How we work <span className="ld-pill-arrow"><ArrowUpRight size={14} /></span>
                        </Link>
                    </div>
                    <div
                        className="ld-about-image"
                        data-image-slot="about-main"
                        style={slotStyle('about-main')}
                        aria-hidden="true"
                    />
                </div>
            </section>

            {/* ===== Features / Stats ===== */}
            <section id="features" className="ld-features">
                <div className="ld-section-head">
                    <span className="ld-chip">Our Core Features</span>
                    <div className="ld-section-head-row">
                        <h2 className="ld-h2 ld-h2-tight">
                            Supporting Smarter Growth for
                            <br />Farmers &amp; Agri-Businesses
                        </h2>
                        <p className="ld-section-sub">
                            Helping farms operate smarter by combining digital workflows,
                            predictive insights, and better risk management across every plot.
                        </p>
                        <Link to="/login" className="ld-pill ld-pill-primary ld-pill-sm">
                            Get started <span className="ld-pill-arrow"><ArrowUpRight size={12} /></span>
                        </Link>
                    </div>
                </div>

                <div className="ld-feature-grid">
                    {[
                        { stat: 'Up to 45%', label: 'Reduction in crop loss', slot: 'feature-1' },
                        { stat: 'Up to 2×', label: 'Faster crop monitoring', slot: 'feature-2' },
                        { stat: 'Up to 50%', label: 'Improvement in resource efficiency', slot: 'feature-3' },
                    ].map((f) => (
                        <div key={f.slot} className="ld-feature-card" data-image-slot={f.slot} style={slotStyle(f.slot)}>
                            <div className="ld-feature-overlay">
                                <p className="ld-feature-stat">{f.stat}</p>
                                <p className="ld-feature-label">{f.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== Sustainability ===== */}
            <section className="ld-sustain">
                <div className="ld-sustain-grid">
                    <div>
                        <span className="ld-chip">Why It Matters</span>
                        <h2 className="ld-h2 ld-h2-tight">
                            Farming for the Future: <br />
                            Sustainable Growth &amp; Global Challenges
                        </h2>
                        <p className="ld-section-sub" style={{ maxWidth: '46ch' }}>
                            Enabling smarter decisions, modern farming systems, and lower
                            environmental impact to help feed more people, protect more land,
                            and improve farmer livelihoods.
                        </p>
                        <Link to="/login" className="ld-pill ld-pill-primary ld-pill-sm">
                            Get started <span className="ld-pill-arrow"><ArrowUpRight size={12} /></span>
                        </Link>

                        <div className="ld-sustain-points">
                            {[
                                { icon: <Sun size={18} />, title: 'Climate-smart', body: 'Adapt and respond to shifting weather patterns and crop risk.' },
                                { icon: <Leaf size={18} />, title: 'Regenerative practices', body: 'Preserve soil health, biodiversity, and water resources.' },
                                { icon: <ShieldCheck size={18} />, title: 'Transparent supply', body: 'Build trust with consumers and partners through farm-to-fork traceability.' },
                                { icon: <Users size={18} />, title: 'Farmer empowerment', body: 'Give growers the technology and insight they need to thrive.' },
                            ].map((p) => (
                                <div key={p.title} className="ld-sustain-point">
                                    <span className="ld-sustain-icon">{p.icon}</span>
                                    <div>
                                        <p className="ld-sustain-point-title">{p.title}</p>
                                        <p className="ld-sustain-point-body">{p.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="ld-sustain-image" data-image-slot="sustain" style={slotStyle('sustain')} aria-hidden="true" />
                </div>
            </section>

            {/* ===== Advancement Banner ===== */}
            <section id="advancement" className="ld-advance">
                <span className="ld-chip ld-chip-soft">Shaping the Future of Agriculture</span>
                <h2 className="ld-h1">
                    Smart Agricultural
                    <br />
                    Advancement
                </h2>
                <p className="ld-advance-sub">
                    Empowering farmers with intelligent tools and real-time insights to boost
                    productivity and support sustainable agricultural growth.
                </p>
                <Link to="/login" className="ld-pill ld-pill-light ld-pill-sm">
                    Our Solutions <span className="ld-pill-arrow"><ArrowUpRight size={12} /></span>
                </Link>
                <div className="ld-advance-image" data-image-slot="advance" style={slotStyle('advance')} aria-hidden="true" />
            </section>

            {/* ===== Tools Cards ===== */}
            <section className="ld-tools">
                <div className="ld-section-head ld-section-head-center">
                    <span className="ld-chip">Agriculture Tech Enhanced</span>
                    <h2 className="ld-h2">Smart Tools Designed to Elevate <br />Every Farming Operation</h2>
                    <p className="ld-section-sub">
                        Empowering farmers with intelligent systems that simplify work and
                        improve productivity daily.
                    </p>
                </div>
                <div className="ld-tool-grid">
                    {[
                        { icon: <BarChart3 size={20} />, title: 'Field Intelligence Metrics', body: 'Real-time insights to optimise crop performance and overall productivity.' },
                        { icon: <Sprout size={20} />, title: 'Optimal Planting Tracker', body: 'Monitor essential field factors to ensure ideal planting conditions every season.' },
                        { icon: <Globe2 size={20} />, title: 'Monitoring Sensor Insights', body: 'Detailed sensor data enhancing weather and planning with accurate insights.' },
                        { icon: <Tractor size={20} />, title: '24-Hour Weather Trends', body: 'Track temperature, humidity, wind patterns and rainfall to support smarter decisions.' },
                    ].map((t) => (
                        <div key={t.title} className="ld-tool-card">
                            <span className="ld-tool-icon">{t.icon}</span>
                            <h3 className="ld-tool-title">{t.title}</h3>
                            <p className="ld-tool-body">{t.body}</p>
                            <Link to="/login" className="ld-link">
                                Learn more <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== Crops Marquee (left → right, up-close produce) ===== */}
            <section className="ld-marquee-section">
                <div className="ld-marquee-head">
                    <span className="ld-chip">From Our Fields</span>
                    <h2 className="ld-h2 ld-h2-tight">
                        Fresh Crops &amp; Produce, <br />Up Close
                    </h2>
                    <p className="ld-section-sub" style={{ maxWidth: 560, margin: '0 auto' }}>
                        Coffee cherries, leafy greens, maize, beans &amp; more — straight from the soil at Bondeni Farms.
                    </p>
                </div>
                <div className="ld-marquee ld-marquee-ltr">
                    <div className="ld-marquee-track">
                        {[...cropImages, ...cropImages].map((c, i) => (
                            <div
                                key={`crop-${i}`}
                                className="ld-marquee-item"
                                data-image-slot={c.slot}
                                style={slotStyle(c.slot)}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Livestock Marquee (right → left, animals) ===== */}
            <section className="ld-marquee-section ld-marquee-section-alt">
                <div className="ld-marquee-head">
                    <span className="ld-chip">Our Livestock</span>
                    <h2 className="ld-h2 ld-h2-tight">
                        Healthy Animals, <br />Cared For Daily
                    </h2>
                    <p className="ld-section-sub" style={{ maxWidth: 560, margin: '0 auto' }}>
                        Poultry, dairy cows, goats and sheep — raised with attention,
                        nutrition, and modern monitoring.
                    </p>
                </div>
                <div className="ld-marquee ld-marquee-rtl">
                    <div className="ld-marquee-track">
                        {[...animalImages, ...animalImages].map((a, i) => (
                            <div
                                key={`animal-${i}`}
                                className="ld-marquee-item"
                                data-image-slot={a.slot}
                                style={slotStyle(a.slot)}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Dark CTA ===== */}
            <section id="contact" className="ld-cta">
                <span className="ld-chip ld-chip-soft">Professional Growth Connection Space</span>
                <h2 className="ld-h2 ld-h2-light">
                    Unlock Technology-Driven Growth <br />
                    To Elevate Your Farming Operations
                </h2>
                <p className="ld-cta-sub">
                    Power modern farming with smart tools, real-time insights, and automated
                    systems for sustainable success.
                </p>
                <Link to="/login" className="ld-pill ld-pill-light">
                    Learn More <span className="ld-pill-arrow"><ArrowUpRight size={14} /></span>
                </Link>
            </section>

            {/* ===== Footer ===== */}
            <footer className="ld-footer">
                <div className="ld-footer-inner">
                    <div className="ld-brand">
                        <span className="ld-brand-icon"><Sprout size={20} /></span>
                        <span>Bondeni Farms</span>
                    </div>
                    <p className="ld-footer-copy">
                        © {new Date().getFullYear()} Bondeni Farms. Cultivating tomorrow, today.
                    </p>
                    <div className="ld-footer-links">
                        <Link to="/login">Sign in</Link>
                        <a href="#features">Features</a>
                        <a href="#about">About</a>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Landing;
