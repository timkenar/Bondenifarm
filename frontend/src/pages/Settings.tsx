import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Moon, Sun, Shield, MapPin, Globe, Phone, Image as ImageIcon, Upload, X, Layout } from 'lucide-react';
import api from '../api/axios';
import FarmPlotsManager from '../components/FarmPlotsManager';

interface FarmProfile {
    id: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    total_acreage: number | null;
    phone: string;
    email: string;
    description: string;
    photo: string | null;
    logo: string | null;
    currency: string;
    timezone: string;
}

// Landing-page CMS slot definitions — must match backend field names on LandingContent
type CmsSlot = { field: string; label: string; hint?: string };
type CmsGroup = { title: string; slots: CmsSlot[] };
const CMS_GROUPS: CmsGroup[] = [
    {
        title: 'Hero',
        slots: [
            { field: 'hero_image', label: 'Hero Background', hint: 'Large background image at the top of the landing page.' },
            { field: 'hero_card_image', label: 'Hero Card', hint: 'Smaller floating card / preview image.' },
        ],
    },
    {
        title: 'About',
        slots: [
            { field: 'about_main', label: 'About Main Image' },
            { field: 'about_chip_1', label: 'About Chip 1', hint: 'Small accent image.' },
            { field: 'about_chip_2', label: 'About Chip 2', hint: 'Small accent image.' },
        ],
    },
    {
        title: 'Features',
        slots: [
            { field: 'feature_1', label: 'Feature Card 1' },
            { field: 'feature_2', label: 'Feature Card 2' },
            { field: 'feature_3', label: 'Feature Card 3' },
        ],
    },
    {
        title: 'Sustainability & Advance',
        slots: [
            { field: 'sustain_image', label: 'Sustainability Image' },
            { field: 'advance_image', label: 'Advance Banner Image' },
        ],
    },
    {
        title: 'Crops Marquee',
        slots: [
            { field: 'crop_coffee', label: 'Coffee' },
            { field: 'crop_maize', label: 'Maize' },
            { field: 'crop_vegetables', label: 'Vegetables' },
            { field: 'crop_avocado', label: 'Avocado' },
        ],
    },
    {
        title: 'Livestock Marquee',
        slots: [
            { field: 'animal_cow', label: 'Cow' },
            { field: 'animal_poultry', label: 'Poultry' },
            { field: 'animal_goat', label: 'Goat' },
            { field: 'animal_sheep', label: 'Sheep' },
        ],
    },
];

// Editable theme colours — maps backend field → user-facing label.
type ColorSlot = { field: string; label: string; hint?: string; defaultValue: string };
type ColorGroup = { title: string; slots: ColorSlot[] };
const COLOR_GROUPS: ColorGroup[] = [
    {
        title: 'App Theme',
        slots: [
            { field: 'color_primary', label: 'Primary', hint: 'Main brand colour used across buttons, links and accents.', defaultValue: '#4D7C0F' },
            { field: 'color_primary_hover', label: 'Primary Hover', hint: 'Darker shade for hover states.', defaultValue: '#3F6212' },
            { field: 'color_accent', label: 'Accent', hint: 'Secondary accent colour.', defaultValue: '#84CC16' },
            { field: 'color_danger', label: 'Danger', hint: 'Destructive actions & errors.', defaultValue: '#DC2626' },
        ],
    },
    {
        title: 'Landing Page',
        slots: [
            { field: 'color_landing_green', label: 'Landing Green', defaultValue: '#84CC16' },
            { field: 'color_landing_green_deep', label: 'Landing Green Deep', defaultValue: '#4D7C0F' },
            { field: 'color_landing_dark', label: 'Landing Dark', defaultValue: '#0B1410' },
            { field: 'color_landing_cream', label: 'Landing Cream', defaultValue: '#FAFAF7' },
        ],
    },
];
const ALL_COLOR_FIELDS = COLOR_GROUPS.flatMap(g => g.slots.map(s => s.field));

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'farm' | 'plots' | 'appearance' | 'cms'>('farm');
    const [farm, setFarm] = useState<FarmProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ===== CMS (landing page) =====
    const [cms, setCms] = useState<Record<string, string | null>>({});
    const [cmsFiles, setCmsFiles] = useState<Record<string, File | null>>({});
    const [cmsPreviews, setCmsPreviews] = useState<Record<string, string | null>>({});
    const [cmsRemovals, setCmsRemovals] = useState<Record<string, boolean>>({});
    const [cmsColors, setCmsColors] = useState<Record<string, string>>({});
    const [cmsSaving, setCmsSaving] = useState(false);
    const [cmsLoaded, setCmsLoaded] = useState(false);

    useEffect(() => {
        fetchFarm();
    }, []);

    const fetchFarm = async () => {
        try {
            const res = await api.get('/farm/profile/');
            setFarm(res.data);
            setLogoPreview(res.data.logo || null);
            setPhotoPreview(res.data.photo || null);
        } catch (error) {
            console.error('Error fetching farm', error);
        }
    };

    const saveFarm = async () => {
        if (!farm) return;
        setSaving(true);
        try {
            const hasFile = !!logoFile || !!photoFile;
            if (hasFile) {
                const fd = new FormData();
                Object.entries(farm).forEach(([k, v]) => {
                    if (k === 'logo' || k === 'photo' || k === 'id') return;
                    if (v !== null && v !== undefined) fd.append(k, String(v));
                });
                if (logoFile) fd.append('logo', logoFile);
                if (photoFile) fd.append('photo', photoFile);
                const res = await api.patch('/farm/profile/', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setFarm(res.data);
                setLogoPreview(res.data.logo || null);
                setPhotoPreview(res.data.photo || null);
                setLogoFile(null);
                setPhotoFile(null);
            } else {
                await api.patch('/farm/profile/', farm);
            }
        } catch (error) {
            console.error('Error saving farm', error);
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (kind: 'logo' | 'photo', file: File | null) => {
        if (kind === 'logo') {
            setLogoFile(file);
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setLogoPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setLogoPreview(farm?.logo || null);
            }
        } else {
            setPhotoFile(file);
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPhotoPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setPhotoPreview(farm?.photo || null);
            }
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // ===== CMS handlers =====
    useEffect(() => {
        if (activeTab === 'cms' && !cmsLoaded) {
            fetchCms();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchCms = async () => {
        try {
            const res = await api.get('/landing/content/');
            const data: Record<string, string | null> = {};
            const previews: Record<string, string | null> = {};
            CMS_GROUPS.forEach(g => g.slots.forEach(s => {
                data[s.field] = res.data[s.field] || null;
                previews[s.field] = res.data[s.field] || null;
            }));
            setCms(data);
            setCmsPreviews(previews);
            const colors: Record<string, string> = {};
            COLOR_GROUPS.forEach(g => g.slots.forEach(s => {
                colors[s.field] = res.data[s.field] || s.defaultValue;
            }));
            setCmsColors(colors);
            setCmsLoaded(true);
        } catch (error) {
            console.error('Error fetching CMS content', error);
            setCmsLoaded(true);
        }
    };

    const handleCmsFile = (field: string, file: File | null) => {
        setCmsFiles({ ...cmsFiles, [field]: file });
        if (file) {
            setCmsRemovals({ ...cmsRemovals, [field]: false });
            const reader = new FileReader();
            reader.onloadend = () => setCmsPreviews(prev => ({ ...prev, [field]: reader.result as string }));
            reader.readAsDataURL(file);
        } else {
            setCmsPreviews(prev => ({ ...prev, [field]: cms[field] || null }));
        }
    };

    const handleCmsRemove = (field: string) => {
        setCmsFiles(prev => ({ ...prev, [field]: null }));
        setCmsPreviews(prev => ({ ...prev, [field]: null }));
        setCmsRemovals(prev => ({ ...prev, [field]: true }));
    };

    const saveCms = async () => {
        setCmsSaving(true);
        try {
            const fd = new FormData();
            let hasChange = false;
            Object.entries(cmsFiles).forEach(([field, file]) => {
                if (file) { fd.append(field, file); hasChange = true; }
            });
            Object.entries(cmsRemovals).forEach(([field, removed]) => {
                if (removed && !cmsFiles[field]) { fd.append(field, ''); hasChange = true; }
            });
            // Always send current color values — cheap and keeps backend in sync.
            ALL_COLOR_FIELDS.forEach(f => {
                if (cmsColors[f]) { fd.append(f, cmsColors[f]); hasChange = true; }
            });
            if (!hasChange) { setCmsSaving(false); return; }
            const res = await api.patch('/landing/content/', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data: Record<string, string | null> = {};
            const previews: Record<string, string | null> = {};
            CMS_GROUPS.forEach(g => g.slots.forEach(s => {
                data[s.field] = res.data[s.field] || null;
                previews[s.field] = res.data[s.field] || null;
            }));
            setCms(data);
            setCmsPreviews(previews);
            const colors: Record<string, string> = {};
            COLOR_GROUPS.forEach(g => g.slots.forEach(s => {
                colors[s.field] = res.data[s.field] || s.defaultValue;
            }));
            setCmsColors(colors);
            setCmsFiles({});
            setCmsRemovals({});
            // Live-apply app theme colours immediately.
            const root = document.documentElement;
            if (colors.color_primary) { root.style.setProperty('--primary', colors.color_primary); root.style.setProperty('--accent-crops', colors.color_primary); }
            if (colors.color_primary_hover) root.style.setProperty('--primary-hover', colors.color_primary_hover);
            if (colors.color_accent) root.style.setProperty('--accent', colors.color_accent);
            if (colors.color_danger) root.style.setProperty('--danger', colors.color_danger);
        } catch (error) {
            console.error('Error saving CMS content', error);
        } finally {
            setCmsSaving(false);
        }
    };

    return (
        <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>

            {/* Tabs */}
            <div className="tabs">
                <div className={`tab ${activeTab === 'farm' ? 'active' : ''}`} onClick={() => setActiveTab('farm')}>Farm Profile</div>
                <div className={`tab ${activeTab === 'plots' ? 'active' : ''}`} onClick={() => setActiveTab('plots')}>Farm Plots</div>
                <div className={`tab ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => setActiveTab('cms')}>CMS</div>
                <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Account</div>
                <div className={`tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>Appearance</div>
            </div>

            {/* Farm Profile Tab */}
            {activeTab === 'farm' && farm && (
                <div className="card">
                    {/* ===== Farm Branding ===== */}
                    <h3 style={{ margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ImageIcon size={20} color="var(--primary)" /> Farm Branding
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                        {/* Logo */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                Farm Logo
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    style={{
                                        width: 96, height: 96,
                                        borderRadius: '16px',
                                        border: '1px dashed var(--border)',
                                        background: logoPreview ? 'var(--bg-card)' : 'var(--bg-main)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                                    }}
                                    title={logoPreview ? 'Click to replace logo' : 'Click to upload logo'}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Farm logo" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
                                    ) : (
                                        <ImageIcon size={28} color="var(--text-muted)" />
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button type="button" className="btn" style={{ gap: '0.4rem' }} onClick={() => logoInputRef.current?.click()}>
                                        <Upload size={16} />
                                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                    </button>
                                    {logoPreview && (
                                        <button type="button" className="btn" style={{ gap: '0.4rem', color: 'var(--danger)' }} onClick={() => { handleFileChange('logo', null); setLogoPreview(null); }}>
                                            <X size={16} /> Remove
                                        </button>
                                    )}
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG/SVG, square preferred.</p>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)} />
                            </div>
                        </div>

                        {/* Cover photo */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                Farm Cover Photo
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    style={{
                                        width: 144, height: 96,
                                        borderRadius: '12px',
                                        border: '1px dashed var(--border)',
                                        background: 'var(--bg-main)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                                    }}
                                    title={photoPreview ? 'Click to replace photo' : 'Click to upload photo'}
                                >
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Farm photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ImageIcon size={28} color="var(--text-muted)" />
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <button type="button" className="btn" style={{ gap: '0.4rem' }} onClick={() => photoInputRef.current?.click()}>
                                        <Upload size={16} />
                                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                    </button>
                                    {photoPreview && (
                                        <button type="button" className="btn" style={{ gap: '0.4rem', color: 'var(--danger)' }} onClick={() => { handleFileChange('photo', null); setPhotoPreview(null); }}>
                                            <X size={16} /> Remove
                                        </button>
                                    )}
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wide photo of your farm.</p>
                                </div>
                                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)} />
                            </div>
                        </div>
                    </div>

                    <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Globe size={20} color="var(--primary)" /> Farm Details
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Farm Name</label>
                            <input className="input" value={farm.name} onChange={(e) => setFarm({ ...farm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input className="input" value={farm.phone} onChange={(e) => setFarm({ ...farm, phone: e.target.value })} placeholder="+254..." />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input className="input" value={farm.email} onChange={(e) => setFarm({ ...farm, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Total Acreage</label>
                            <input type="number" step="0.01" className="input" value={farm.total_acreage || ''} onChange={(e) => setFarm({ ...farm, total_acreage: e.target.value ? parseFloat(e.target.value) : null })} placeholder="e.g. 50" />
                        </div>
                    </div>

                    <h4 style={{ margin: '1.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={18} color="var(--accent-crops)" /> GPS Location
                    </h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Latitude</label>
                            <input type="number" step="0.0000001" className="input" value={farm.latitude || ''} onChange={(e) => setFarm({ ...farm, latitude: e.target.value ? parseFloat(e.target.value) : null })} placeholder="-1.2921" />
                        </div>
                        <div className="form-group">
                            <label>Longitude</label>
                            <input type="number" step="0.0000001" className="input" value={farm.longitude || ''} onChange={(e) => setFarm({ ...farm, longitude: e.target.value ? parseFloat(e.target.value) : null })} placeholder="36.8219" />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Address</label>
                        <textarea className="input" rows={2} value={farm.address} onChange={(e) => setFarm({ ...farm, address: e.target.value })} placeholder="Farm physical address..." />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Description</label>
                        <textarea className="input" rows={3} value={farm.description} onChange={(e) => setFarm({ ...farm, description: e.target.value })} placeholder="Brief description of your farm..." />
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={saveFarm} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Farm Profile'}
                        </button>
                    </div>
                </div>
            )}

            {/* Farm Plots Tab — uses shared FarmPlotsManager component */}
            {activeTab === 'plots' && (
                <FarmPlotsManager />
            )}

            {/* CMS Tab — Landing page content management */}
            {activeTab === 'cms' && (
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Layout size={20} color="var(--primary)" /> Landing Page Content
                            </h3>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Upload imagery for each section of the public landing page at <code>/welcome</code>.
                            </p>
                        </div>
                        <button className="btn btn-primary" onClick={saveCms} disabled={cmsSaving || !cmsLoaded}>
                            {cmsSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    {!cmsLoaded && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}

                    {cmsLoaded && CMS_GROUPS.map(group => (
                        <div key={group.title} style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {group.title}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                {group.slots.map(slot => {
                                    const preview = cmsPreviews[slot.field];
                                    const inputId = `cms-input-${slot.field}`;
                                    return (
                                        <div key={slot.field} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', background: 'var(--bg-card)' }}>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                {slot.label}
                                            </label>
                                            <label
                                                htmlFor={inputId}
                                                style={{
                                                    display: 'block', width: '100%', aspectRatio: '16/10',
                                                    borderRadius: '10px',
                                                    border: '1px dashed var(--border)',
                                                    background: preview ? `center/cover no-repeat url(${preview})` : 'var(--bg-main)',
                                                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                                }}
                                                title={preview ? 'Click to replace' : 'Click to upload'}
                                            >
                                                {!preview && (
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                        <ImageIcon size={28} />
                                                        <span style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Click to upload</span>
                                                    </div>
                                                )}
                                            </label>
                                            <input
                                                id={inputId}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => handleCmsFile(slot.field, e.target.files?.[0] || null)}
                                            />
                                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                                                <button type="button" className="btn" style={{ flex: 1, gap: '0.3rem', fontSize: '0.75rem', padding: '0.4rem 0.5rem' }} onClick={() => document.getElementById(inputId)?.click()}>
                                                    <Upload size={14} /> {preview ? 'Change' : 'Upload'}
                                                </button>
                                                {preview && (
                                                    <button type="button" className="btn" style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.4rem 0.5rem', color: 'var(--danger)' }} onClick={() => handleCmsRemove(slot.field)}>
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            {slot.hint && <p style={{ margin: '0.4rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.hint}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {cmsLoaded && COLOR_GROUPS.map(group => (
                        <div key={group.title} style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {group.title} Colours
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                {group.slots.map(slot => {
                                    const value = cmsColors[slot.field] || slot.defaultValue;
                                    return (
                                        <div key={slot.field} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '0.75rem', background: 'var(--bg-card)' }}>
                                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                                {slot.label}
                                            </label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="color"
                                                    value={value}
                                                    onChange={(e) => setCmsColors({ ...cmsColors, [slot.field]: e.target.value })}
                                                    style={{ width: 48, height: 36, padding: 0, border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
                                                />
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={value}
                                                    onChange={(e) => setCmsColors({ ...cmsColors, [slot.field]: e.target.value })}
                                                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                                                    placeholder={slot.defaultValue}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    title="Reset to default"
                                                    style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}
                                                    onClick={() => setCmsColors({ ...cmsColors, [slot.field]: slot.defaultValue })}
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                            {slot.hint && <p style={{ margin: '0.4rem 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.hint}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {cmsLoaded && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className="btn btn-primary" onClick={saveCms} disabled={cmsSaving}>
                                {cmsSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* My Account Tab */}
            {activeTab === 'profile' && (
                <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent-crops))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '3rem', fontWeight: 'bold', boxShadow: 'var(--shadow-lg)'
                    }}>
                        {user?.full_name?.charAt(0) || <User size={48} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{user?.full_name || 'Guest User'}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} /> {user?.email}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Shield size={16} />
                                <span style={{ textTransform: 'capitalize' }}>{user?.role?.toLowerCase().replace('_', ' ') || 'User'}</span>
                            </div>
                            {user?.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={16} /> {user.phone}
                                </div>
                            )}
                            <div style={{ marginTop: '1rem' }}>
                                <span className="badge badge-success">Active Account</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
                <div className="card">
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Appearance</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 500 }}>Theme</p>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customize how Bondeni Farm looks.</p>
                        </div>
                        <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <button onClick={() => handleThemeChange('light')} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                                <Sun size={18} /> Light
                            </button>
                            <button onClick={() => handleThemeChange('dark')} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                                <Moon size={18} /> Dark
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
