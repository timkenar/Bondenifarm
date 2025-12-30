import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { ProduceRecord } from '../types/produce';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ActionMenu from '../components/ActionMenu';
import { Plus, Milk, Egg, Sprout, Download, Calendar } from 'lucide-react';

const ProducePage: React.FC = () => {
    const [records, setRecords] = useState<ProduceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'MILK' | 'EGGS' | 'MAIZE' | 'OTHER'>('MILK');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ProduceRecord | null>(null);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        produce_type: 'MILK',
        morning_yield: '',
        noon_yield: '',
        evening_yield: '',
        quantity: '',
        unit: 'liters'
    });

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await api.get('/produce/records/');
            setRecords(res.data);
        } catch (error) {
            console.error("Failed to fetch produce records", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (record?: ProduceRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                date: record.date,
                produce_type: record.produce_type,
                morning_yield: record.morning_yield || '',
                noon_yield: record.noon_yield || '',
                evening_yield: record.evening_yield || '',
                quantity: record.quantity || '',
                unit: record.unit || 'liters'
            });
        } else {
            setEditingRecord(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                produce_type: activeTab,
                morning_yield: '',
                noon_yield: '',
                evening_yield: '',
                quantity: '',
                unit: activeTab === 'MILK' ? 'liters' : activeTab === 'EGGS' ? 'eggs' : 'bags'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                date: formData.date,
                produce_type: formData.produce_type,
                unit: formData.unit
            };

            if (formData.produce_type === 'MILK') {
                payload.morning_yield = formData.morning_yield || 0;
                payload.noon_yield = formData.noon_yield || 0;
                payload.evening_yield = formData.evening_yield || 0;
            } else {
                payload.quantity = formData.quantity;
            }

            if (editingRecord) {
                const res = await api.put(`/produce/records/${editingRecord.id}/`, payload);
                setRecords(records.map(r => r.id === editingRecord.id ? res.data : r));
            } else {
                const res = await api.post('/produce/records/', payload);
                setRecords([res.data, ...records]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save produce record", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this record?")) return;
        try {
            await api.delete(`/produce/records/${id}/`);
            setRecords(records.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete record", error);
        }
    };

    const normalizeType = (type: string) => {
        if (type === 'MILK') return 'Milk';
        if (type === 'EGGS') return 'Eggs';
        if (type === 'MAIZE') return 'Maize';
        return 'Other';
    };

    // Filtering
    const filterByDate = (items: ProduceRecord[]) => {
        return items.filter(item => {
            if (dateFrom && item.date < dateFrom) return false;
            if (dateTo && item.date > dateTo) return false;
            return true;
        });
    };

    const filteredRecords = filterByDate(records.filter(r => r.produce_type === activeTab));

    // Totals
    const todayDate = new Date().toISOString().split('T')[0];
    const todayMilk = records
        .filter(r => r.produce_type === 'MILK' && r.date === todayDate)
        .reduce((sum, r) => sum + parseFloat(r.quantity || '0'), 0);
    const todayEggs = records
        .filter(r => r.produce_type === 'EGGS' && r.date === todayDate)
        .reduce((sum, r) => sum + parseFloat(r.quantity || '0'), 0);

    // CSV Export
    const exportToCSV = () => {
        const data = filteredRecords;
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).map(v => `"${v}"`).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produce_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Farm Produce</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ gap: '0.5rem', color: 'var(--primary)' }} onClick={exportToCSV}>
                        <Download size={16} />
                        Export
                    </button>
                    <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Record {normalizeType(activeTab)}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--secondary)' }}>
                        <Milk size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Today's Milk</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{todayMilk} L</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                        <Egg size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Today's Eggs</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{todayEggs} ({(todayEggs / 30).toFixed(1)} crates)</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
                        {(['MILK', 'EGGS', 'MAIZE'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontWeight: 500
                                }}
                            >
                                {tab === 'MILK' && <Milk size={18} />}
                                {tab === 'EGGS' && <Egg size={18} />}
                                {tab === 'MAIZE' && <Sprout size={18} />}
                                {normalizeType(tab)}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Calendar size={16} color="var(--text-muted)" />
                        <input type="date" className="input" style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        <span style={{ color: 'var(--text-muted)' }}>to</span>
                        <input type="date" className="input" style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRecord ? `Edit ${normalizeType(activeTab)} Record` : `Record ${normalizeType(activeTab)}`}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" className="input" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>

                    {activeTab === 'MILK' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Morning (Liters)</label>
                                    <input type="number" step="0.1" className="input" value={formData.morning_yield} onChange={e => setFormData({ ...formData, morning_yield: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Noon (Liters)</label>
                                    <input type="number" step="0.1" className="input" value={formData.noon_yield} onChange={e => setFormData({ ...formData, noon_yield: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Evening (Liters)</label>
                                <input type="number" step="0.1" className="input" value={formData.evening_yield} onChange={e => setFormData({ ...formData, evening_yield: e.target.value })} />
                            </div>
                        </>
                    )}

                    {activeTab === 'EGGS' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Eggs Collected</label>
                            <input type="number" className="input" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            {formData.quantity && (
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Equivalent to {(parseInt(formData.quantity) / 30).toFixed(1)} crates
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'MAIZE' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity (Bags)</label>
                            <input type="number" className="input" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary">{editingRecord ? "Update Record" : "Save Record"}</button>
                </form>
            </Modal>

            {/* Data Display */}
            {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                    <Spinner size={32} />
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Cards */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {filteredRecords.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records for {normalizeType(activeTab)}.</div>
                        ) : (
                            filteredRecords.map(record => (
                                <div key={record.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{record.date}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {record.produce_type === 'MILK' ? (
                                                `M: ${record.morning_yield || 0}L, N: ${record.noon_yield || 0}L, E: ${record.evening_yield || 0}L`
                                            ) : record.produce_type === 'EGGS' ? (
                                                `${record.crates} Crates`
                                            ) : `${record.quantity} ${record.unit}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{record.quantity} {record.unit}</span>
                                        <ActionMenu onEdit={() => handleOpenModal(record)} onDelete={() => handleDelete(record.id)} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Desktop Table */}
                    <div className="desktop-only" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Quantity</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Details</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No records for {normalizeType(activeTab)}.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map(record => (
                                        <tr key={record.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>{record.date}</td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>
                                                {record.quantity} {record.unit}
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {record.produce_type === 'MILK' ? (
                                                    `Morning: ${record.morning_yield || 0}L, Noon: ${record.noon_yield || 0}L, Evening: ${record.evening_yield || 0}L`
                                                ) : record.produce_type === 'EGGS' ? (
                                                    `${record.crates} Crates`
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <ActionMenu onEdit={() => handleOpenModal(record)} onDelete={() => handleDelete(record.id)} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 767px) {
                    .mobile-only { display: block !important; }
                    .desktop-only { display: none !important; }
                }
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                    .desktop-only { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default ProducePage;
