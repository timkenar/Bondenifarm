import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Moon, Sun, Shield, MapPin, Plus, Trash2, Image, Globe, Phone } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';

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
    currency: string;
    timezone: string;
}

interface FarmPlot {
    id: string;
    name: string;
    size_acres: number;
    latitude: number | null;
    longitude: number | null;
    soil_type: string;
    current_crop: string;
    status: string;
    irrigation_type: string;
    photo: string | null;
}

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'farm' | 'plots' | 'appearance'>('farm');
    const [farm, setFarm] = useState<FarmProfile | null>(null);
    const [plots, setPlots] = useState<FarmPlot[]>([]);
    const [showPlotModal, setShowPlotModal] = useState(false);
    const [plotForm, setPlotForm] = useState({
        name: '', size_acres: '', latitude: '', longitude: '',
        soil_type: 'LOAM', current_crop: '', status: 'IDLE', irrigation_type: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFarmData();
    }, []);

    const fetchFarmData = async () => {
        try {
            const [farmRes, plotsRes] = await Promise.all([
                api.get('/farm/profile/'),
                api.get('/farm/plots/')
            ]);
            setFarm(farmRes.data);
            setPlots(plotsRes.data);
        } catch (error) {
            console.error('Error fetching farm data', error);
        }
    };

    const saveFarm = async () => {
        if (!farm) return;
        setSaving(true);
        try {
            await api.patch(`/farm/profile/`, farm);
        } catch (error) {
            console.error('Error saving farm', error);
        } finally {
            setSaving(false);
        }
    };

    const createPlot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/farm/plots/', {
                ...plotForm,
                size_acres: parseFloat(plotForm.size_acres),
                latitude: plotForm.latitude ? parseFloat(plotForm.latitude) : null,
                longitude: plotForm.longitude ? parseFloat(plotForm.longitude) : null,
            });
            setShowPlotModal(false);
            setPlotForm({ name: '', size_acres: '', latitude: '', longitude: '', soil_type: 'LOAM', current_crop: '', status: 'IDLE', irrigation_type: '' });
            fetchFarmData();
        } catch (error) {
            console.error('Error creating plot', error);
        }
    };

    const deletePlot = async (id: string) => {
        if (!confirm('Delete this plot?')) return;
        try {
            await api.delete(`/farm/plots/${id}/`);
            fetchFarmData();
        } catch (error) {
            console.error('Error deleting plot', error);
        }
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Settings</h2>

            {/* Tabs */}
            <div className="tabs">
                <div className={`tab ${activeTab === 'farm' ? 'active' : ''}`} onClick={() => setActiveTab('farm')}>Farm Profile</div>
                <div className={`tab ${activeTab === 'plots' ? 'active' : ''}`} onClick={() => setActiveTab('plots')}>Farm Plots</div>
                <div className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>My Account</div>
                <div className={`tab ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>Appearance</div>
            </div>

            {/* Farm Profile Tab */}
            {activeTab === 'farm' && farm && (
                <div className="card">
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

            {/* Farm Plots Tab */}
            {activeTab === 'plots' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{plots.length} plots • {plots.reduce((sum, p) => sum + parseFloat(String(p.size_acres)), 0).toFixed(1)} total acres</p>
                        <button className="btn btn-primary" onClick={() => setShowPlotModal(true)}>
                            <Plus size={16} /> Add Plot
                        </button>
                    </div>

                    {plots.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                <MapPin size={32} color="#22C55E" />
                            </div>
                            <h3>No Plots Added</h3>
                            <p>Add your farm plots to track crops, soil types, and GPS locations.</p>
                        </div>
                    ) : (
                        <div className="grid-cards">
                            {plots.map((plot) => (
                                <div key={plot.id} className="card" style={{ position: 'relative' }}>
                                    {plot.photo ? (
                                        <div style={{ margin: '-1.5rem -1.5rem 1rem', height: '120px', overflow: 'hidden', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
                                            <img src={plot.photo} alt={plot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{
                                            margin: '-1.5rem -1.5rem 1rem', height: '80px',
                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.1))',
                                            borderRadius: 'var(--radius) var(--radius) 0 0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Image size={24} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.25rem' }}>{plot.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {plot.size_acres} acres • {plot.soil_type}
                                            </p>
                                        </div>
                                        <button className="btn" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={() => deletePlot(plot.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {plot.latitude && plot.longitude && (
                                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            📍 {plot.latitude}, {plot.longitude}
                                        </p>
                                    )}

                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {plot.current_crop && <span className="badge badge-success">{plot.current_crop}</span>}
                                        <span className="badge badge-info">{plot.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Plot Modal */}
                    {showPlotModal && (
                        <Modal isOpen={showPlotModal} onClose={() => setShowPlotModal(false)} title="Add Farm Plot">
                            <form onSubmit={createPlot}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Plot Name</label>
                                        <input className="input" value={plotForm.name} onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })} required placeholder="e.g. Lower Field" />
                                    </div>
                                    <div className="form-group">
                                        <label>Size (Acres)</label>
                                        <input type="number" step="0.01" className="input" value={plotForm.size_acres} onChange={(e) => setPlotForm({ ...plotForm, size_acres: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Latitude</label>
                                        <input type="number" step="0.0000001" className="input" value={plotForm.latitude} onChange={(e) => setPlotForm({ ...plotForm, latitude: e.target.value })} placeholder="-1.2921" />
                                    </div>
                                    <div className="form-group">
                                        <label>Longitude</label>
                                        <input type="number" step="0.0000001" className="input" value={plotForm.longitude} onChange={(e) => setPlotForm({ ...plotForm, longitude: e.target.value })} placeholder="36.8219" />
                                    </div>
                                    <div className="form-group">
                                        <label>Soil Type</label>
                                        <select className="input" value={plotForm.soil_type} onChange={(e) => setPlotForm({ ...plotForm, soil_type: e.target.value })}>
                                            <option value="CLAY">Clay</option>
                                            <option value="SANDY">Sandy</option>
                                            <option value="LOAM">Loam</option>
                                            <option value="SILT">Silt</option>
                                            <option value="RED">Red Soil</option>
                                            <option value="BLACK_COTTON">Black Cotton</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select className="input" value={plotForm.status} onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}>
                                            <option value="IDLE">Idle</option>
                                            <option value="ACTIVE">Active / In Use</option>
                                            <option value="FALLOW">Fallow</option>
                                            <option value="PREPARING">Being Prepared</option>
                                            <option value="HARVESTED">Harvested</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Current Crop</label>
                                        <input className="input" value={plotForm.current_crop} onChange={(e) => setPlotForm({ ...plotForm, current_crop: e.target.value })} placeholder="e.g. Maize" />
                                    </div>
                                    <div className="form-group">
                                        <label>Irrigation Type</label>
                                        <input className="input" value={plotForm.irrigation_type} onChange={(e) => setPlotForm({ ...plotForm, irrigation_type: e.target.value })} placeholder="e.g. Drip, Sprinkler, Rain-fed" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPlotModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Add Plot</button>
                                </div>
                            </form>
                        </Modal>
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
