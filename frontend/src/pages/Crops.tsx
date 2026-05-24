import React, { useEffect, useState } from 'react';
import { Wheat, Plus, Calendar, Sprout, Scissors } from 'lucide-react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

interface CropSeason {
    id: string;
    plot_name?: string;
    crop_type: string;
    variety: string;
    status: string;
    planting_date: string;
    expected_harvest_date: string;
    actual_yield: number | null;
    expected_yield: number | null;
    yield_unit: string;
    photo: string | null;
    plot: string;
}

interface FarmPlot {
    id: string;
    name: string;
    size_acres: number;
    soil_type: string;
    current_crop: string;
    status: string;
    photo: string | null;
}

const statusColors: Record<string, string> = {
    PLANNING: '#64748B',
    PLANTED: '#3B82F6',
    GROWING: '#22C55E',
    FLOWERING: '#F59E0B',
    HARVESTING: '#8B5CF6',
    COMPLETED: '#10B981',
    FAILED: '#EF4444',
};

const CropsPage: React.FC = () => {
    const [seasons, setSeasons] = useState<CropSeason[]>([]);
    const [plots, setPlots] = useState<FarmPlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'seasons' | 'plots'>('seasons');
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({
        plot: '',
        crop_type: 'MAIZE',
        variety: '',
        planting_date: '',
        expected_harvest_date: '',
        expected_yield: '',
        yield_unit: 'kg',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [seasonsRes, plotsRes] = await Promise.all([
                api.get('/crops/seasons/'),
                api.get('/farm/plots/')
            ]);
            setSeasons(seasonsRes.data);
            setPlots(plotsRes.data);
        } catch (error) {
            console.error('Error fetching crops data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/crops/seasons/', {
                ...form,
                expected_yield: form.expected_yield ? parseFloat(form.expected_yield) : null,
                status: 'PLANNING',
            });
            setShowAddModal(false);
            setForm({ plot: '', crop_type: 'MAIZE', variety: '', planting_date: '', expected_harvest_date: '', expected_yield: '', yield_unit: 'kg', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Error creating crop season', error);
        }
    };

    if (loading) {
        return <div className="flex-center" style={{ padding: '3rem' }}><Spinner size={40} /></div>;
    }

    return (
        <div className="animate-in">
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="section-header" style={{ marginBottom: 0 }}>
                    <div className="icon-badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' }}>
                        <Wheat size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Crop Management</h2>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {seasons.length} active seasons • {plots.length} plots
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} /> New Season
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <div className={`tab ${activeTab === 'seasons' ? 'active' : ''}`} onClick={() => setActiveTab('seasons')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} /> Crop Seasons
                    </span>
                </div>
                <div className={`tab ${activeTab === 'plots' ? 'active' : ''}`} onClick={() => setActiveTab('plots')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sprout size={16} /> Farm Plots
                    </span>
                </div>
            </div>

            {/* Seasons Tab */}
            {activeTab === 'seasons' && (
                <div>
                    {seasons.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                <Wheat size={32} color="#22C55E" />
                            </div>
                            <h3>No Crop Seasons Yet</h3>
                            <p>Start by creating your first crop season to track planting and harvests.</p>
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <Plus size={16} /> Create First Season
                            </button>
                        </div>
                    ) : (
                        <div className="grid-cards">
                            {seasons.map((season) => (
                                <div key={season.id} className="card card-interactive" style={{ position: 'relative', overflow: 'hidden' }}>
                                    {/* Colored top bar */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                        background: statusColors[season.status] || '#64748B'
                                    }} />

                                    {season.photo && (
                                        <div style={{ margin: '-1.5rem -1.5rem 1rem', height: '140px', overflow: 'hidden' }}>
                                            <img src={season.photo} alt={season.crop_type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{season.crop_type}</h3>
                                            {season.variety && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{season.variety}</p>}
                                        </div>
                                        <span className="badge" style={{
                                            background: `${statusColors[season.status]}20`,
                                            color: statusColors[season.status]
                                        }}>
                                            {season.status}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {season.planting_date && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} /> Planted: {season.planting_date}
                                            </div>
                                        )}
                                        {season.expected_harvest_date && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Scissors size={14} /> Harvest: {season.expected_harvest_date}
                                            </div>
                                        )}
                                        {season.expected_yield && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Sprout size={14} /> Expected: {season.expected_yield} {season.yield_unit}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Plots Tab */}
            {activeTab === 'plots' && (
                <div>
                    {plots.length === 0 ? (
                        <div className="empty-state">
                            <div className="icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                <Sprout size={32} color="#22C55E" />
                            </div>
                            <h3>No Farm Plots Registered</h3>
                            <p>Add your farm plots from the Settings page to start tracking crops by location.</p>
                        </div>
                    ) : (
                        <div className="grid-cards">
                            {plots.map((plot) => (
                                <div key={plot.id} className="card card-interactive">
                                    {plot.photo ? (
                                        <div style={{ margin: '-1.5rem -1.5rem 1rem', height: '160px', overflow: 'hidden', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
                                            <img src={plot.photo} alt={plot.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{
                                            margin: '-1.5rem -1.5rem 1rem', height: '100px', overflow: 'hidden',
                                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Sprout size={40} color="#22C55E" style={{ opacity: 0.5 }} />
                                        </div>
                                    )}

                                    <h3 style={{ margin: '0 0 0.5rem' }}>{plot.name}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        <span>{plot.size_acres} acres</span>
                                        <span>•</span>
                                        <span>{plot.soil_type}</span>
                                    </div>
                                    {plot.current_crop && (
                                        <span className="badge badge-success">{plot.current_crop}</span>
                                    )}
                                    <span className="badge" style={{ marginLeft: '0.5rem', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                                        {plot.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Season Modal */}
            {showAddModal && (
                <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Crop Season">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Plot</label>
                                <select className="input" value={form.plot} onChange={(e) => setForm({ ...form, plot: e.target.value })} required>
                                    <option value="">Select a plot...</option>
                                    {plots.map(p => <option key={p.id} value={p.id}>{p.name} ({p.size_acres} acres)</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Crop Type</label>
                                <select className="input" value={form.crop_type} onChange={(e) => setForm({ ...form, crop_type: e.target.value })}>
                                    <option value="MAIZE">Maize</option>
                                    <option value="BEANS">Beans</option>
                                    <option value="WHEAT">Wheat</option>
                                    <option value="POTATOES">Potatoes</option>
                                    <option value="TOMATOES">Tomatoes</option>
                                    <option value="CABBAGE">Cabbage</option>
                                    <option value="KALE">Kale</option>
                                    <option value="TEA">Tea</option>
                                    <option value="COFFEE">Coffee</option>
                                    <option value="NAPIER">Napier Grass</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Variety</label>
                                <input className="input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} placeholder="e.g. H614D" />
                            </div>
                            <div className="form-group">
                                <label>Planting Date</label>
                                <input type="date" className="input" value={form.planting_date} onChange={(e) => setForm({ ...form, planting_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Expected Harvest Date</label>
                                <input type="date" className="input" value={form.expected_harvest_date} onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Expected Yield</label>
                                <input type="number" className="input" value={form.expected_yield} onChange={(e) => setForm({ ...form, expected_yield: e.target.value })} placeholder="e.g. 500" />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Create Season</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default CropsPage;
