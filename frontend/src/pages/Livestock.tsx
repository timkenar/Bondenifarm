import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toArray } from '../api/helpers';
import type { Livestock } from '../types/livestock';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ActionMenu from '../components/ActionMenu';
import PageHeader from '../components/PageHeader';
import { Search, Plus, Download, Beef, Image as ImageIcon, X } from 'lucide-react';

const LivestockPage: React.FC = () => {
    const [livestock, setLivestock] = useState<Livestock[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<Livestock | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        tag_id: '',
        name: '',
        species: 'CATTLE',
        category: 'OTHER',
        breed: '',
        sex: 'FEMALE',
        quantity: 1,
        status: 'ACTIVE',
        current_weight: '',
        dob: '',
        purchase_date: '',
        purchase_price: '',
        notes: ''
    });

    useEffect(() => {
        fetchLivestock();
    }, []);

    const fetchLivestock = async () => {
        try {
            const response = await api.get('/livestock/');
            setLivestock(toArray<Livestock>(response.data));
        } catch (error) {
            console.error("Failed to fetch livestock", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (animal?: Livestock) => {
        setPhotoFile(null);
        setRemoveExistingPhoto(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (animal) {
            setEditingAnimal(animal);
            setPhotoPreview(animal.photo || null);
            setFormData({
                tag_id: animal.tag_id,
                name: animal.name,
                species: animal.species,
                category: animal.category,
                breed: animal.breed,
                sex: animal.sex,
                quantity: animal.quantity,
                status: animal.status,
                current_weight: animal.current_weight || '',
                dob: animal.dob || '',
                purchase_date: animal.purchase_date || '',
                purchase_price: animal.purchase_price || '',
                notes: animal.notes || ''
            });
        } else {
            setEditingAnimal(null);
            setPhotoPreview(null);
            setFormData({
                tag_id: '',
                name: '',
                species: 'CATTLE',
                category: 'OTHER',
                breed: '',
                sex: 'FEMALE',
                quantity: 1,
                status: 'ACTIVE',
                current_weight: '',
                dob: '',
                purchase_date: '',
                purchase_price: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setPhotoFile(file);
        setRemoveExistingPhoto(false);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPhotoPreview(editingAnimal?.photo || null);
        }
    };

    const clearPhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setRemoveExistingPhoto(!!editingAnimal?.photo);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const hasFileChange = !!photoFile || removeExistingPhoto;
            let payload: FormData | typeof formData;
            let config: { headers?: Record<string, string> } = {};

            if (hasFileChange) {
                const fd = new FormData();
                Object.entries(formData).forEach(([k, v]) => {
                    if (v !== '' && v !== null && v !== undefined) {
                        fd.append(k, String(v));
                    }
                });
                if (photoFile) {
                    fd.append('photo', photoFile);
                } else if (removeExistingPhoto) {
                    fd.append('photo', '');
                }
                payload = fd;
                config = { headers: { 'Content-Type': 'multipart/form-data' } };
            } else {
                payload = formData;
            }

            if (editingAnimal) {
                const res = await api.patch(`/livestock/${editingAnimal.id}/`, payload, config);
                setLivestock(livestock.map(l => l.id === editingAnimal.id ? res.data : l));
            } else {
                const res = await api.post('/livestock/', payload, config);
                setLivestock([...livestock, res.data]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save animal", error);
            alert("Error saving animal. Ensure Tag ID is unique.");
        }
    };

    const handleDeleteAnimal = async (id: string) => {
        if (!confirm("Are you sure you want to delete this animal?")) return;
        try {
            await api.delete(`/livestock/${id}/`);
            setLivestock(livestock.filter(l => l.id !== id));
        } catch (error) {
            console.error("Failed to delete animal", error);
        }
    };

    // CSV Export
    const exportToCSV = () => {
        if (livestock.length === 0) return;
        const headers = ['Tag ID', 'Name', 'Species', 'Category', 'Breed', 'Sex', 'Quantity', 'Status', 'Weight'];
        const rows = livestock.map(a => [a.tag_id, a.name, a.species, a.category, a.breed, a.sex, a.quantity, a.status, a.current_weight || '']);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `livestock_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredLivestock = livestock.filter(animal =>
        animal.tag_id.toLowerCase().includes(filter.toLowerCase()) ||
        animal.name.toLowerCase().includes(filter.toLowerCase()) ||
        animal.breed.toLowerCase().includes(filter.toLowerCase())
    );

    // Group by species for summary
    const speciesCounts = livestock.reduce((acc, animal) => {
        acc[animal.species] = (acc[animal.species] || 0) + animal.quantity;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div>
            <PageHeader
                icon={<Beef size={24} />}
                accent="#F59E0B"
                title="Livestock"
                subtitle={`${livestock.length} animals · ${Object.keys(speciesCounts).length} species`}
                actions={
                    <>
                        <button className="btn btn-secondary" style={{ gap: '0.5rem' }} onClick={exportToCSV}>
                            <Download size={16} /> Export
                        </button>
                        <button className="btn btn-primary" style={{ gap: '0.5rem' }} onClick={() => handleOpenModal()}>
                            <Plus size={18} /> Add Animal
                        </button>
                    </>
                }
            />

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(speciesCounts).map(([species, count]) => (
                    <div key={species} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(77, 124, 15, 0.2)', color: 'var(--primary)' }}>
                            <Beef size={20} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{species.toLowerCase()}</p>
                            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{count}</p>
                        </div>
                    </div>
                ))}
                {Object.keys(speciesCounts).length === 0 && (
                    <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No livestock recorded yet.</div>
                )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
                <div className="relative" style={{ position: 'relative', maxWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search by tag, name, or breed..."
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAnimal ? "Edit Animal" : "Add Animal"}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Photo uploader */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Animal Photo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: '12px',
                                    border: '1px dashed var(--border)',
                                    background: 'var(--bg-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    flexShrink: 0,
                                }}
                                title={photoPreview ? 'Click to replace photo' : 'Click to upload photo'}
                            >
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <ImageIcon size={28} color="var(--text-muted)" />
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="btn"
                                    style={{ gap: '0.4rem' }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon size={16} />
                                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                {photoPreview && (
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ gap: '0.4rem', color: 'var(--danger)' }}
                                        onClick={clearPhoto}
                                    >
                                        <X size={16} />
                                        Remove
                                    </button>
                                )}
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    JPG / PNG, up to ~5 MB.
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tag ID *</label>
                            <input type="text" className="input" required value={formData.tag_id} onChange={e => setFormData({ ...formData, tag_id: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                            <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Species</label>
                            <select className="input" value={formData.species} onChange={e => setFormData({ ...formData, species: e.target.value as any })}>
                                <option value="CATTLE">Cattle</option>
                                <option value="POULTRY">Poultry</option>
                                <option value="GOAT">Goat</option>
                                <option value="SHEEP">Sheep</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                            <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}>
                                <option value="HEIFER">Heifer</option>
                                <option value="CALF">Calf</option>
                                <option value="BULL">Bull</option>
                                <option value="COW">Cow</option>
                                <option value="LAYER">Layer (Poultry)</option>
                                <option value="BROILER">Broiler (Poultry)</option>
                                <option value="KIENYEJI">Kienyeji (Poultry)</option>
                                <option value="CHICK">Chick</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                            <input type="number" min="1" className="input" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Sex</label>
                            <select className="input" value={formData.sex} onChange={e => setFormData({ ...formData, sex: e.target.value as any })}>
                                <option value="FEMALE">Female</option>
                                <option value="MALE">Male</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
                            <select className="input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                <option value="ACTIVE">Active</option>
                                <option value="SICK">Sick</option>
                                <option value="SOLD">Sold</option>
                                <option value="DECEASED">Deceased</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Breed</label>
                            <input type="text" className="input" value={formData.breed} onChange={e => setFormData({ ...formData, breed: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Weight (kg)</label>
                            <input type="number" step="0.01" className="input" value={formData.current_weight} onChange={e => setFormData({ ...formData, current_weight: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date of Birth</label>
                            <input type="date" className="input" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Purchase Date</label>
                            <input type="date" className="input" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Purchase Price (KES)</label>
                        <input type="number" step="0.01" className="input" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Notes</label>
                        <textarea className="input" rows={2} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">{editingAnimal ? "Update Animal" : "Save Animal"}</button>
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
                        {filteredLivestock.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No livestock found.</div>
                        ) : (
                            filteredLivestock.map(animal => (
                                <div key={animal.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {animal.photo ? (
                                        <img src={animal.photo} alt={animal.name} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                            🐮
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{animal.name || animal.tag_id}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{animal.species} • {animal.category}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '4px', background: 'rgba(77, 124, 15, 0.1)', color: 'var(--primary)' }}>Qty: {animal.quantity}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '4px',
                                                background: animal.status === 'ACTIVE' ? 'rgba(77, 124, 15, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: animal.status === 'ACTIVE' ? 'var(--primary)' : 'var(--danger)'
                                            }}>{animal.status}</span>
                                        </div>
                                    </div>
                                    <ActionMenu onEdit={() => handleOpenModal(animal)} onDelete={() => handleDeleteAnimal(animal.id)} />
                                </div>
                            ))
                        )}
                    </div>
                    {/* Desktop Table */}
                    <div className="desktop-only" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Tag ID</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Species/Category</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Qty</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Weight</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLivestock.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No livestock found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLivestock.map(animal => (
                                        <tr key={animal.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontFamily: 'monospace', background: 'rgba(77, 124, 15, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                    {animal.tag_id}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {animal.photo ? (
                                                        <img src={animal.photo} alt={animal.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                                                            🐮
                                                        </div>
                                                    )}
                                                    <span>{animal.name || '-'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div>{animal.species}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{animal.category}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{animal.quantity}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'capitalize',
                                                    backgroundColor: animal.status === 'ACTIVE' ? 'rgba(77, 124, 15, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: animal.status === 'ACTIVE' ? 'var(--primary)' : 'var(--danger)'
                                                }}>
                                                    {animal.status.toLowerCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{animal.current_weight ? `${animal.current_weight} kg` : '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <ActionMenu onEdit={() => handleOpenModal(animal)} onDelete={() => handleDeleteAnimal(animal.id)} />
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

export default LivestockPage;
