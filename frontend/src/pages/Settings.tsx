import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Moon, Sun, Shield, MapPin, Globe, Image as ImageIcon, Upload, X, Layout, Settings, Users, Plus, Trash2, Check, Pencil } from 'lucide-react';
import api from '../api/axios';
import { toArray } from '../api/helpers';
import type { User as TeamUser, UserRole } from '../types';
import { canManageTeam as roleCanManageTeam } from '../config/permissions';
import FarmPlotsManager from '../components/FarmPlotsManager';
import PageHeader from '../components/PageHeader';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'FARM_MANAGER', label: 'Farm Manager' },
    { value: 'VETERINARIAN', label: 'Veterinarian' },
    { value: 'WORKER', label: 'Worker' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
];

const roleLabel = (role?: string) =>
    ROLE_OPTIONS.find(r => r.value === role)?.label || (role || 'User');

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
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'farm' | 'plots' | 'appearance' | 'cms'>('farm');
    const [farm, setFarm] = useState<FarmProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ===== My Account (self profile) =====
    const [accountForm, setAccountForm] = useState({ full_name: '', phone: '' });
    const [accountSaving, setAccountSaving] = useState(false);
    const [accountSaved, setAccountSaved] = useState(false);

    // ===== Team directory =====
    const canManageTeam = !!user && (user.is_superuser || user.is_staff || roleCanManageTeam(user.role));
    const [team, setTeam] = useState<TeamUser[]>([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);
    const emptyNewMember = { email: '', full_name: '', phone: '', role: 'WORKER' as UserRole, password: '' };
    const [newMember, setNewMember] = useState(emptyNewMember);
    const [addingMember, setAddingMember] = useState(false);
    const [savingMemberId, setSavingMemberId] = useState<number | null>(null);

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

    // Keep the editable account form in sync with the logged-in user.
    useEffect(() => {
        if (user) {
            setAccountForm({ full_name: user.full_name || '', phone: user.phone || '' });
        }
    }, [user]);

    // Load the team directory when its tab is opened.
    useEffect(() => {
        if (activeTab === 'team' && team.length === 0) {
            fetchTeam();
        }
    }, [activeTab]);

    const fetchTeam = async () => {
        setTeamLoading(true);
        setTeamError(null);
        try {
            const res = await api.get('/users/');
            setTeam(toArray<TeamUser>(res.data));
        } catch (error) {
            console.error('Error fetching team', error);
            setTeamError('Could not load team members.');
        } finally {
            setTeamLoading(false);
        }
    };

    const saveAccount = async () => {
        setAccountSaving(true);
        setAccountSaved(false);
        try {
            await api.patch('/users/me/', {
                full_name: accountForm.full_name,
                phone: accountForm.phone,
            });
            await refreshUser();
            setAccountSaved(true);
            setTimeout(() => setAccountSaved(false), 2500);
        } catch (error) {
            console.error('Error saving account', error);
        } finally {
            setAccountSaving(false);
        }
    };

    const addMember = async () => {
        if (!newMember.email || !newMember.password) return;
        setAddingMember(true);
        setTeamError(null);
        try {
            const res = await api.post('/users/', newMember);
            setTeam(prev => [...prev, res.data].sort((a, b) =>
                (a.full_name || a.email).localeCompare(b.full_name || b.email)));
            setNewMember(emptyNewMember);
        } catch (error: any) {
            console.error('Error adding member', error);
            const data = error?.response?.data;
            const msg = data?.detail || data?.email?.[0] || data?.password?.[0] || 'Could not add member.';
            setTeamError(msg);
        } finally {
            setAddingMember(false);
        }
    };

    const updateMemberRole = async (member: TeamUser, role: UserRole) => {
        setSavingMemberId(member.id);
        try {
            const res = await api.patch(`/users/${member.id}/`, { role });
            setTeam(prev => prev.map(m => (m.id === member.id ? res.data : m)));
        } catch (error) {
            console.error('Error updating role', error);
            setTeamError('Could not update role.');
        } finally {
            setSavingMemberId(null);
        }
    };

    const toggleMemberActive = async (member: TeamUser) => {
        setSavingMemberId(member.id);
        try {
            const res = await api.patch(`/users/${member.id}/`, { is_active: !member.is_active });
            setTeam(prev => prev.map(m => (m.id === member.id ? res.data : m)));
        } catch (error) {
            console.error('Error toggling member', error);
            setTeamError('Could not update member.');
        } finally {
            setSavingMemberId(null);
        }
    };

    const removeMember = async (member: TeamUser) => {
        if (!window.confirm(`Remove ${member.full_name || member.email} from the team?`)) return;
        setSavingMemberId(member.id);
        try {
            await api.delete(`/users/${member.id}/`);
            setTeam(prev => prev.filter(m => m.id !== member.id));
        } catch (error: any) {
            console.error('Error removing member', error);
            setTeamError(error?.response?.data?.detail || 'Could not remove member.');
        } finally {
            setSavingMemberId(null);
        }
    };

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
                const res = await api.patch('/farm/profile/', fd);
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
            const res = await api.patch('/landing/content/', fd);
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
            <PageHeader
                icon={<Settings size={24} />}
                accent="#64748B"
                title="Settings"
                subtitle="Farm profile, plots, CMS & account"
            />

            {/* Tabs */}
            <div className="tabs">
                <div className={`tab ${activeTab === 'farm' ? 'active' : ''}`} onClick={() => setActiveTab('farm')}>Farm Profile</div>
                <div className={`tab ${activeTab === 'plots' ? 'active' : ''}`} onClick={() => setActiveTab('plots')}>Farm Plots</div>
                <div className={`tab ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => setActiveTab('cms')}>CMS</div>
                <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Account</div>
                <div className={`tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>Team</div>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '96px', height: '96px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--accent-crops))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '2.5rem', fontWeight: 700, boxShadow: 'var(--shadow-lg)',
                            overflow: 'hidden', flexShrink: 0,
                        }}>
                            {user?.avatar
                                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : (user?.full_name?.charAt(0)?.toUpperCase() || <User size={44} />)}
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{user?.full_name || 'Unnamed User'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={16} /> {user?.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={16} />
                                    <span>{roleLabel(user?.role)}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span className="badge badge-success">Active Account</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Pencil size={18} color="var(--primary)" /> Edit Profile
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    className="input"
                                    value={accountForm.full_name}
                                    onChange={e => setAccountForm(f => ({ ...f, full_name: e.target.value }))}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    className="input"
                                    value={accountForm.phone}
                                    onChange={e => setAccountForm(f => ({ ...f, phone: e.target.value }))}
                                    placeholder="e.g. +254 700 000000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input className="input" value={user?.email || ''} disabled />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <input className="input" value={roleLabel(user?.role)} disabled />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={saveAccount} disabled={accountSaving}>
                                {accountSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                            {accountSaved && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontSize: '0.875rem' }}>
                                    <Check size={16} /> Saved
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Directory Tab */}
            {activeTab === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {canManageTeam && (
                        <div className="card">
                            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} color="var(--primary)" /> Add Team Member
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input className="input" value={newMember.full_name}
                                        onChange={e => setNewMember(m => ({ ...m, full_name: e.target.value }))}
                                        placeholder="Jane Doe" />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input className="input" type="email" value={newMember.email}
                                        onChange={e => setNewMember(m => ({ ...m, email: e.target.value }))}
                                        placeholder="jane@farm.com" />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input className="input" value={newMember.phone}
                                        onChange={e => setNewMember(m => ({ ...m, phone: e.target.value }))}
                                        placeholder="+254 …" />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select className="input" value={newMember.role}
                                        onChange={e => setNewMember(m => ({ ...m, role: e.target.value as UserRole }))}>
                                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Temporary Password *</label>
                                    <input className="input" type="password" value={newMember.password}
                                        onChange={e => setNewMember(m => ({ ...m, password: e.target.value }))}
                                        placeholder="Set a password" />
                                </div>
                            </div>
                            {teamError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{teamError}</p>}
                            <button className="btn btn-primary" onClick={addMember}
                                disabled={addingMember || !newMember.email || !newMember.password}>
                                {addingMember ? 'Adding…' : 'Add Member'}
                            </button>
                        </div>
                    )}

                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} color="var(--primary)" /> Team Directory
                            <span className="badge" style={{ marginLeft: 'auto' }}>{team.length} member{team.length === 1 ? '' : 's'}</span>
                        </h3>

                        {teamLoading && <p style={{ color: 'var(--text-muted)' }}>Loading team…</p>}
                        {!teamLoading && !canManageTeam && teamError && (
                            <p style={{ color: 'var(--text-muted)' }}>{teamError}</p>
                        )}
                        {!teamLoading && team.length === 0 && !teamError && (
                            <p style={{ color: 'var(--text-muted)' }}>No team members yet.</p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {team.map(member => {
                                const isSelf = member.id === user?.id;
                                const busy = savingMemberId === member.id;
                                return (
                                    <div key={member.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                                        padding: '0.875rem 1rem', borderRadius: '14px',
                                        background: 'var(--bg-main)', border: '1px solid var(--border)',
                                        opacity: member.is_active === false ? 0.55 : 1,
                                    }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                                            background: 'linear-gradient(135deg, var(--primary), var(--accent-crops))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, overflow: 'hidden',
                                        }}>
                                            {member.avatar
                                                ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : (member.full_name?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase())}
                                        </div>
                                        <div style={{ flex: 1, minWidth: '160px' }}>
                                            <div style={{ fontWeight: 600 }}>
                                                {member.full_name || member.email}
                                                {isSelf && <span className="badge" style={{ marginLeft: '0.5rem' }}>You</span>}
                                                {member.is_active === false && <span className="badge" style={{ marginLeft: '0.5rem' }}>Inactive</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{member.email}</div>
                                        </div>

                                        {canManageTeam ? (
                                            <select
                                                className="input"
                                                style={{ width: 'auto', minWidth: '150px' }}
                                                value={member.role}
                                                disabled={busy || isSelf}
                                                onChange={e => updateMemberRole(member, e.target.value as UserRole)}
                                            >
                                                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                            </select>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                <Shield size={15} /> {roleLabel(member.role)}
                                            </span>
                                        )}

                                        {canManageTeam && !isSelf && (
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button className="btn btn-secondary" disabled={busy}
                                                    onClick={() => toggleMemberActive(member)}
                                                    title={member.is_active === false ? 'Activate' : 'Deactivate'}>
                                                    {member.is_active === false ? 'Activate' : 'Deactivate'}
                                                </button>
                                                <button className="btn btn-danger" disabled={busy}
                                                    onClick={() => removeMember(member)} title="Remove">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
