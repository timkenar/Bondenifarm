import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Worker } from '../types/workforce';
import { User, Phone, Plus, Briefcase, Download, DollarSign, LayoutGrid, List } from 'lucide-react';
import Modal from '../components/Modal';
import ActionMenu from '../components/ActionMenu';
import Spinner from '../components/Spinner';

interface Kibarua {
    id: string;
    worker?: string;
    worker_name?: string;
    date: string;
    work_description: string;
    amount_paid: string;
}

const WorkforcePage: React.FC = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [kibaruaRecords, setKibaruaRecords] = useState<Kibarua[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'workers' | 'kibarua'>('workers');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isKibaruaModalOpen, setIsKibaruaModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        national_id: '',
        role: 'WORKER',
        employment_type: 'PERMANENT',
        phone: '',
        address: '',
        salary: '',
        notes: ''
    });

    const [kibaruaFormData, setKibaruaFormData] = useState({
        worker_name: '',
        date: new Date().toISOString().split('T')[0],
        work_description: '',
        amount_paid: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [workersRes, kibaruaRes] = await Promise.all([
                api.get('/workers/'),
                api.get('/kibarua/')
            ]);
            setWorkers(workersRes.data);
            setKibaruaRecords(kibaruaRes.data);
        } catch (error) {
            console.error("Failed to fetch workforce data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (worker?: Worker) => {
        if (worker) {
            setEditingWorker(worker);
            setFormData({
                full_name: worker.full_name,
                national_id: worker.national_id,
                role: worker.role,
                employment_type: worker.employment_type || 'PERMANENT',
                phone: worker.phone,
                address: worker.address,
                salary: worker.salary,
                notes: worker.notes
            });
        } else {
            setEditingWorker(null);
            setFormData({ full_name: '', national_id: '', role: 'WORKER', employment_type: 'PERMANENT', phone: '', address: '', salary: '', notes: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingWorker) {
                const res = await api.put(`/workers/${editingWorker.id}/`, formData);
                setWorkers(workers.map(w => w.id === editingWorker.id ? res.data : w));
            } else {
                const res = await api.post('/workers/', formData);
                setWorkers([...workers, res.data]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save worker", error);
        }
    };

    const handleAddKibarua = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/kibarua/', kibaruaFormData);
            setKibaruaRecords([res.data, ...kibaruaRecords]);
            setIsKibaruaModalOpen(false);
            setKibaruaFormData({
                worker_name: '',
                date: new Date().toISOString().split('T')[0],
                work_description: '',
                amount_paid: ''
            });
        } catch (error) {
            console.error("Failed to add kibarua record", error);
        }
    };

    const handleDeleteWorker = async (id: string) => {
        if (!confirm("Delete this worker?")) return;
        try {
            await api.delete(`/workers/${id}/`);
            setWorkers(workers.filter(w => w.id !== id));
        } catch (error) {
            console.error("Failed to delete worker", error);
        }
    };

    const handleDeleteKibarua = async (id: string) => {
        if (!confirm("Delete this record?")) return;
        try {
            await api.delete(`/kibarua/${id}/`);
            setKibaruaRecords(kibaruaRecords.filter(k => k.id !== id));
        } catch (error) {
            console.error("Failed to delete kibarua record", error);
        }
    };

    // CSV Export
    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).map(v => `"${v}"`).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const totalKibaruaPayments = kibaruaRecords.reduce((sum, k) => sum + parseFloat(k.amount_paid || '0'), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Workforce</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        style={{ gap: '0.5rem', color: 'var(--primary)' }}
                        onClick={() => exportToCSV(activeTab === 'workers' ? workers : kibaruaRecords, activeTab)}
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ gap: '0.5rem' }}
                        onClick={() => activeTab === 'workers' ? handleOpenModal() : setIsKibaruaModalOpen(true)}
                    >
                        <Plus size={20} />
                        {activeTab === 'workers' ? 'Add Worker' : 'Add Kibarua'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--secondary)' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Workers</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{workers.length}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Kibarua Payments</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>KES {totalKibaruaPayments.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs & View Toggle */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('workers')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'workers' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'workers' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Workers ({workers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('kibarua')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'kibarua' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'kibarua' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Kibarua ({kibaruaRecords.length})
                        </button>
                    </div>

                    {activeTab === 'workers' && (
                        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                            <button onClick={() => setViewMode('card')} style={{ padding: '0.5rem', background: viewMode === 'card' ? 'var(--bg-card)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'card' ? 'var(--primary)' : 'var(--text-muted)' }}>
                                <LayoutGrid size={18} />
                            </button>
                            <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)' }}>
                                <List size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Worker Form Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWorker ? "Edit Worker" : "Add Worker"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                        <input className="input" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>National ID</label>
                        <input className="input" required value={formData.national_id} onChange={e => setFormData({ ...formData, national_id: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Role</label>
                            <select className="input" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="FARM_MANAGER">Manager</option>
                                <option value="VETERINARIAN">Vet</option>
                                <option value="WORKER">Worker</option>
                                <option value="ACCOUNTANT">Accountant</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Employment Type</label>
                            <select className="input" value={formData.employment_type} onChange={e => setFormData({ ...formData, employment_type: e.target.value })}>
                                <option value="PERMANENT">Permanent</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="CASUAL">Casual</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone</label>
                            <input className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Salary (KES)</label>
                            <input type="number" step="0.01" className="input" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Address</label>
                        <input className="input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">{editingWorker ? "Update Worker" : "Save Worker"}</button>
                </form>
            </Modal>

            {/* Kibarua Form Modal */}
            <Modal isOpen={isKibaruaModalOpen} onClose={() => setIsKibaruaModalOpen(false)} title="Add Kibarua (Casual Labor)">
                <form onSubmit={handleAddKibarua} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Worker Name</label>
                        <input className="input" required value={kibaruaFormData.worker_name} onChange={e => setKibaruaFormData({ ...kibaruaFormData, worker_name: e.target.value })} placeholder="Name of casual worker" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" className="input" required value={kibaruaFormData.date} onChange={e => setKibaruaFormData({ ...kibaruaFormData, date: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Work Description</label>
                        <textarea className="input" rows={3} required value={kibaruaFormData.work_description} onChange={e => setKibaruaFormData({ ...kibaruaFormData, work_description: e.target.value })} placeholder="What work was done?" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Amount Paid (KES)</label>
                        <input type="number" step="0.01" className="input" required value={kibaruaFormData.amount_paid} onChange={e => setKibaruaFormData({ ...kibaruaFormData, amount_paid: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Kibarua</button>
                </form>
            </Modal>

            {/* Data Display */}
            {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                    <Spinner size={32} />
                </div>
            ) : activeTab === 'workers' ? (
                viewMode === 'card' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {workers.map(worker => (
                            <div key={worker.id} className="card" style={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                border: '1px solid var(--border)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--secondary), #60A5FA)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                                        }}>
                                            {worker.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{worker.full_name}</h3>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.25rem',
                                                display: 'block'
                                            }}>
                                                {worker.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <ActionMenu onEdit={() => handleOpenModal(worker)} onDelete={() => handleDeleteWorker(worker.id)} />
                                </div>

                                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 0 }} />

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Phone size={16} />
                                        <span style={{ color: 'var(--text-main)' }}>{worker.phone || 'N/A'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                        <Briefcase size={16} />
                                        <span style={{ color: 'var(--text-main)' }}>{worker.employment_type || 'Permanent'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                        <DollarSign size={16} />
                                        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>KES {parseFloat(worker.salary || '0').toLocaleString()}/mo</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {workers.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <User size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No workers found. Add your first farm staff member.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* List View */
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Role</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Type</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Phone</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Salary</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workers.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No workers found.</td></tr>
                                ) : workers.map(worker => (
                                    <tr key={worker.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{worker.full_name}</td>
                                        <td style={{ padding: '1rem' }}>{worker.role.replace('_', ' ')}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', fontSize: '0.75rem' }}>
                                                {worker.employment_type || 'Permanent'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{worker.phone || 'N/A'}</td>
                                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 500 }}>KES {parseFloat(worker.salary || '0').toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <ActionMenu onEdit={() => handleOpenModal(worker)} onDelete={() => handleDeleteWorker(worker.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                /* Kibarua Tab */
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Cards */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {kibaruaRecords.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No kibarua records.</div>
                        ) : (
                            kibaruaRecords.map(k => (
                                <div key={k.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{k.worker_name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{k.date}</div>
                                            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{k.work_description}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>KES {parseFloat(k.amount_paid).toLocaleString()}</div>
                                            <ActionMenu onDelete={() => handleDeleteKibarua(k.id)} />
                                        </div>
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
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Worker</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Work Description</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Amount</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kibaruaRecords.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No kibarua records.</td></tr>
                                ) : kibaruaRecords.map(k => (
                                    <tr key={k.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{k.date}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{k.worker_name}</td>
                                        <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.work_description}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>KES {parseFloat(k.amount_paid).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <ActionMenu onDelete={() => handleDeleteKibarua(k.id)} />
                                        </td>
                                    </tr>
                                ))}
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

export default WorkforcePage;
