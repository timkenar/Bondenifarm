import React, { useEffect, useState } from 'react';
import {
    MapPin,
    Plus,
    Trash2,
    Image as ImageIcon,
    Pencil,
    Layers,
    Sprout,
    Droplet,
} from 'lucide-react';
import api from '../api/axios';
import Modal from './Modal';

export interface FarmPlot {
    id: string;
    name: string;
    size_acres: number;
    latitude: number | null;
    longitude: number | null;
    soil_type: string;
    current_crop: string;
    status: string;
    irrigation_type: string;
    notes: string;
    photo: string | null;
}

interface FarmPlotsManagerProps {
    /** Show the summary stats row above the grid. Defaults to true. */
    showStats?: boolean;
    /** Show the "Farm Plots" heading row. Defaults to true. */
    showHeader?: boolean;
    /** Callback whenever the underlying list changes (after create/edit/delete). */
    onChange?: (plots: FarmPlot[]) => void;
}

const SOIL_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'CLAY', label: 'Clay' },
    { value: 'SANDY', label: 'Sandy' },
    { value: 'LOAM', label: 'Loam' },
    { value: 'SILT', label: 'Silt' },
    { value: 'PEAT', label: 'Peat' },
    { value: 'CHALK', label: 'Chalk' },
    { value: 'RED', label: 'Red Soil' },
    { value: 'BLACK_COTTON', label: 'Black Cotton' },
    { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS: Array<{ value: string; label: string; badge: string }> = [
    { value: 'ACTIVE', label: 'Active / In Use', badge: 'badge-success' },
    { value: 'FALLOW', label: 'Fallow', badge: 'badge-warning' },
    { value: 'PREPARING', label: 'Being Prepared', badge: 'badge-info' },
    { value: 'HARVESTED', label: 'Harvested', badge: 'badge-info' },
    { value: 'IDLE', label: 'Idle', badge: 'badge-warning' },
];

const STATUS_BADGE: Record<string, string> = STATUS_OPTIONS.reduce(
    (acc, s) => ({ ...acc, [s.value]: s.badge }),
    {} as Record<string, string>
);

const STATUS_LABEL: Record<string, string> = STATUS_OPTIONS.reduce(
    (acc, s) => ({ ...acc, [s.value]: s.label }),
    {} as Record<string, string>
);

const SOIL_LABEL: Record<string, string> = SOIL_OPTIONS.reduce(
    (acc, s) => ({ ...acc, [s.value]: s.label }),
    {} as Record<string, string>
);

const emptyForm = {
    name: '',
    size_acres: '',
    latitude: '',
    longitude: '',
    soil_type: 'LOAM',
    current_crop: '',
    status: 'IDLE',
    irrigation_type: '',
    notes: '',
};

const FarmPlotsManager: React.FC<FarmPlotsManagerProps> = ({
    showStats = true,
    showHeader = true,
    onChange,
}) => {
    const [plots, setPlots] = useState<FarmPlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlots();
    }, []);

    const fetchPlots = async () => {
        setLoading(true);
        try {
            const res = await api.get('/farm/plots/');
            const list: FarmPlot[] = Array.isArray(res.data) ? res.data : res.data.results || [];
            setPlots(list);
            onChange?.(list);
        } catch (err) {
            console.error('Error fetching plots', err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setPhoto(null);
        setPhotoPreview(null);
        setError(null);
        setShowModal(true);
    };

    const openEdit = (plot: FarmPlot) => {
        setEditingId(plot.id);
        setForm({
            name: plot.name || '',
            size_acres: plot.size_acres != null ? String(plot.size_acres) : '',
            latitude: plot.latitude != null ? String(plot.latitude) : '',
            longitude: plot.longitude != null ? String(plot.longitude) : '',
            soil_type: plot.soil_type || 'LOAM',
            current_crop: plot.current_crop || '',
            status: plot.status || 'IDLE',
            irrigation_type: plot.irrigation_type || '',
            notes: plot.notes || '',
        });
        setPhoto(null);
        setPhotoPreview(plot.photo || null);
        setError(null);
        setShowModal(true);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhoto(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const base: Record<string, any> = {
            name: form.name.trim(),
            size_acres: parseFloat(form.size_acres),
            soil_type: form.soil_type,
            status: form.status,
            current_crop: form.current_crop.trim(),
            irrigation_type: form.irrigation_type.trim(),
            notes: form.notes.trim(),
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
        };

        let payload: any = base;
        let config: any = undefined;
        if (photo) {
            const fd = new FormData();
            Object.entries(base).forEach(([k, v]) => {
                if (v === null || v === undefined) return;
                fd.append(k, v as any);
            });
            fd.append('photo', photo);
            payload = fd;
            config = { headers: { 'Content-Type': 'multipart/form-data' } };
        }

        setSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/farm/plots/${editingId}/`, payload, config);
            } else {
                await api.post('/farm/plots/', payload, config);
            }
            setShowModal(false);
            setEditingId(null);
            setForm(emptyForm);
            setPhoto(null);
            setPhotoPreview(null);
            await fetchPlots();
        } catch (err: any) {
            console.error('Error saving plot', err);
            const detail = err?.response?.data;
            if (detail && typeof detail === 'object') {
                const first = Object.entries(detail)[0];
                if (first) {
                    setError(`${first[0]}: ${Array.isArray(first[1]) ? first[1][0] : first[1]}`);
                } else {
                    setError('Failed to save plot.');
                }
            } else {
                setError('Failed to save plot.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Delete this plot? This cannot be undone.')) return;
        try {
            await api.delete(`/farm/plots/${id}/`);
            fetchPlots();
        } catch (err) {
            console.error('Error deleting plot', err);
        }
    };

    const totalAcres = plots.reduce(
        (sum, p) => sum + (parseFloat(String(p.size_acres)) || 0),
        0
    );
    const activeCount = plots.filter((p) => p.status === 'ACTIVE').length;

    return (
        <div>
            {showStats && (
                <div className="grid-stats" style={{ marginBottom: '1.25rem' }}>
                    <div className="stat-card" data-accent="green">
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Plots
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700 }}>
                            {plots.length}
                        </p>
                    </div>
                    <div className="stat-card" data-accent="blue">
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Acreage
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700 }}>
                            {totalAcres.toFixed(2)}{' '}
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                acres
                            </span>
                        </p>
                    </div>
                    <div className="stat-card" data-accent="amber">
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Active Plots
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700 }}>
                            {activeCount}
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
                {showHeader ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={18} color="var(--accent-crops)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Farm Plots</h3>
                    </div>
                ) : (
                    <span />
                )}
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={16} /> Add Plot
                </button>
            </div>

            {loading && plots.length === 0 ? (
                <div className="empty-state">
                    <p>Loading plots…</p>
                </div>
            ) : plots.length === 0 ? (
                <div className="empty-state">
                    <div className="icon" style={{ background: 'rgba(77, 124, 15, 0.1)' }}>
                        <MapPin size={32} color="#4D7C0F" />
                    </div>
                    <h3>No Plots Added</h3>
                    <p>Add your farm plots to track crops, soil types, and GPS locations.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>
                        <Plus size={16} /> Add Your First Plot
                    </button>
                </div>
            ) : (
                <div className="grid-cards">
                    {plots.map((plot) => (
                        <div
                            key={plot.id}
                            className="card"
                            style={{ position: 'relative', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            {plot.photo ? (
                                <div style={{ height: '140px', overflow: 'hidden' }}>
                                    <img src={plot.photo} alt={plot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ) : (
                                <div
                                    style={{
                                        height: '100px',
                                        background: 'linear-gradient(135deg, rgba(77, 124, 15, 0.2), rgba(59, 130, 246, 0.15))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ImageIcon size={28} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                </div>
                            )}

                            <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.125rem', fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {plot.name}
                                        </h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {plot.size_acres} acres
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => openEdit(plot)}
                                            aria-label="Edit plot"
                                            style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(plot.id)}
                                            aria-label="Delete plot"
                                            style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                    <span className={`badge ${STATUS_BADGE[plot.status] || 'badge-info'}`}>
                                        {STATUS_LABEL[plot.status] || plot.status}
                                    </span>
                                    {plot.current_crop && (
                                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Sprout size={11} /> {plot.current_crop}
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    <span>
                                        <strong style={{ color: 'var(--text-main)', fontWeight: 500 }}>Soil:</strong>{' '}
                                        {SOIL_LABEL[plot.soil_type] || plot.soil_type}
                                    </span>
                                    {plot.irrigation_type && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Droplet size={11} /> {plot.irrigation_type}
                                        </span>
                                    )}
                                    {plot.latitude != null && plot.longitude != null && (
                                        <a
                                            href={`https://www.google.com/maps?q=${plot.latitude},${plot.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', textDecoration: 'none' }}
                                        >
                                            <MapPin size={11} /> {Number(plot.latitude).toFixed(4)}, {Number(plot.longitude).toFixed(4)}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingId ? 'Edit Farm Plot' : 'Add Farm Plot'}
                size="lg"
            >
                <form onSubmit={submit} className="modal-form">
                    <div>
                        <label>Plot Photo</label>
                        <label
                            htmlFor="plot-photo-input"
                            className="image-upload"
                            style={{ display: 'block', padding: photoPreview ? '0.5rem' : '1.5rem' }}
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" />
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <ImageIcon size={28} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
                                    <div>Click to upload a photo (optional)</div>
                                </div>
                            )}
                        </label>
                        <input
                            id="plot-photo-input"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label>Plot Name *</label>
                            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Lower Field" />
                        </div>
                        <div>
                            <label>Size (Acres) *</label>
                            <input type="number" step="0.01" min="0" className="input" value={form.size_acres} onChange={(e) => setForm({ ...form, size_acres: e.target.value })} required placeholder="e.g. 2.5" />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label>Soil Type</label>
                            <select className="input" value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })}>
                                {SOIL_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Status</label>
                            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label>Current Crop</label>
                            <input className="input" value={form.current_crop} onChange={(e) => setForm({ ...form, current_crop: e.target.value })} placeholder="e.g. Maize" />
                        </div>
                        <div>
                            <label>Irrigation Type</label>
                            <input className="input" value={form.irrigation_type} onChange={(e) => setForm({ ...form, irrigation_type: e.target.value })} placeholder="e.g. Drip, Sprinkler, Rain-fed" />
                        </div>
                    </div>

                    <div className="form-row-2">
                        <div>
                            <label>Latitude</label>
                            <input type="number" step="0.0000001" className="input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-1.2921" />
                        </div>
                        <div>
                            <label>Longitude</label>
                            <input type="number" step="0.0000001" className="input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="36.8219" />
                        </div>
                    </div>

                    <div>
                        <label>Notes</label>
                        <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes about this plot…" />
                    </div>

                    {error && (
                        <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving…' : editingId ? 'Update Plot' : 'Add Plot'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FarmPlotsManager;
