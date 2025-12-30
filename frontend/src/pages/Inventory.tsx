import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Tool, Consumable } from '../types/inventory';
import { Wrench, Package, Search, Plus, AlertTriangle, Download, Image, Camera } from 'lucide-react';
import Modal from '../components/Modal';
import ActionMenu from '../components/ActionMenu';
import Spinner from '../components/Spinner';

const InventoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tools' | 'consumables'>('tools');
    const [tools, setTools] = useState<Tool[]>([]);
    const [consumables, setConsumables] = useState<Consumable[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Tool Form State
    const [isToolModalOpen, setIsToolModalOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Tool | null>(null);
    const [toolFormData, setToolFormData] = useState({
        name: '', category: '', quantity: 1, condition: 'GOOD', location: '', notes: '', photo: null as File | null
    });

    // Consumable Form State
    const [isConsumableModalOpen, setIsConsumableModalOpen] = useState(false);
    const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(null);
    const [consumableFormData, setConsumableFormData] = useState({
        item_name: '', unit: '', quantity_on_hand: 0, reorder_threshold: 10, unit_price: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const [toolsRes, consumablesRes] = await Promise.all([
                api.get('/tools/'),
                api.get('/consumables/')
            ]);
            setTools(toolsRes.data);
            setConsumables(consumablesRes.data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenToolModal = (tool?: Tool) => {
        if (tool) {
            setEditingTool(tool);
            setToolFormData({
                name: tool.name,
                category: tool.category,
                quantity: tool.quantity,
                condition: tool.condition,
                location: tool.location,
                notes: tool.notes,
                photo: null
            });
        } else {
            setEditingTool(null);
            setToolFormData({ name: '', category: '', quantity: 1, condition: 'GOOD', location: '', notes: '', photo: null });
        }
        setIsToolModalOpen(true);
    };

    const handleAddTool = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formDataObj = new FormData();
            formDataObj.append('name', toolFormData.name);
            formDataObj.append('category', toolFormData.category);
            formDataObj.append('quantity', toolFormData.quantity.toString());
            formDataObj.append('condition', toolFormData.condition);
            formDataObj.append('location', toolFormData.location);
            formDataObj.append('notes', toolFormData.notes);
            if (toolFormData.photo) {
                formDataObj.append('photo', toolFormData.photo);
            }

            if (editingTool) {
                const res = await api.patch(`/tools/${editingTool.id}/`, formDataObj, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTools(tools.map(t => t.id === editingTool.id ? res.data : t));
            } else {
                const res = await api.post('/tools/', formDataObj, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setTools([...tools, res.data]);
            }
            setIsToolModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTool = async (id: string) => {
        if (!confirm("Delete this tool?")) return;
        try {
            await api.delete(`/tools/${id}/`);
            setTools(tools.filter(t => t.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenConsumableModal = (consumable?: Consumable) => {
        if (consumable) {
            setEditingConsumable(consumable);
            setConsumableFormData({
                item_name: consumable.item_name,
                unit: consumable.unit,
                quantity_on_hand: parseFloat(consumable.quantity_on_hand),
                reorder_threshold: parseFloat(consumable.reorder_threshold),
                unit_price: consumable.unit_price || ''
            });
        } else {
            setEditingConsumable(null);
            setConsumableFormData({ item_name: '', unit: '', quantity_on_hand: 0, reorder_threshold: 10, unit_price: '' });
        }
        setIsConsumableModalOpen(true);
    };

    const handleAddConsumable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingConsumable) {
                const res = await api.put(`/consumables/${editingConsumable.id}/`, consumableFormData);
                setConsumables(consumables.map(c => c.id === editingConsumable.id ? res.data : c));
            } else {
                const res = await api.post('/consumables/', consumableFormData);
                setConsumables([...consumables, res.data]);
            }
            setIsConsumableModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteConsumable = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            await api.delete(`/consumables/${id}/`);
            setConsumables(consumables.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
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

    // Filter
    const filteredTools = tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredConsumables = consumables.filter(c => c.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const lowStockCount = consumables.filter(c => parseFloat(c.quantity_on_hand) <= parseFloat(c.reorder_threshold)).length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Inventory</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        style={{ gap: '0.5rem', color: 'var(--primary)' }}
                        onClick={() => exportToCSV(activeTab === 'tools' ? tools : consumables, activeTab)}
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ gap: '0.5rem' }}
                        onClick={() => activeTab === 'tools' ? handleOpenToolModal() : handleOpenConsumableModal()}
                    >
                        <Plus size={20} />
                        Add {activeTab === 'tools' ? 'Tool' : 'Item'}
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--secondary)' }}>
                        <Wrench size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tools</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{tools.length}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock Items</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{consumables.length}</p>
                    </div>
                </div>
                {lowStockCount > 0 && (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--danger)' }}>Low Stock</p>
                            <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>{lowStockCount} items</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs & Search */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('tools')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'tools' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'tools' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Wrench size={18} />
                            Tools ({tools.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('consumables')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'consumables' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'consumables' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Package size={18} />
                            Stock ({consumables.length})
                        </button>
                    </div>
                    <div className="relative" style={{ position: 'relative', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tool Modal */}
            <Modal isOpen={isToolModalOpen} onClose={() => setIsToolModalOpen(false)} title={editingTool ? "Edit Tool" : "Add Tool"}>
                <form onSubmit={handleAddTool} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                        <input className="input" required value={toolFormData.name} onChange={e => setToolFormData({ ...toolFormData, name: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                        <input className="input" placeholder="e.g. Waterpump, Slasher" value={toolFormData.category} onChange={e => setToolFormData({ ...toolFormData, category: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                            <input type="number" className="input" value={toolFormData.quantity} onChange={e => setToolFormData({ ...toolFormData, quantity: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Condition</label>
                            <select className="input" value={toolFormData.condition} onChange={e => setToolFormData({ ...toolFormData, condition: e.target.value as any })}>
                                <option value="NEW">New</option>
                                <option value="GOOD">Good</option>
                                <option value="NEEDS_REPAIR">Needs Repair</option>
                                <option value="BROKEN">Broken</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Location</label>
                        <input className="input" value={toolFormData.location} onChange={e => setToolFormData({ ...toolFormData, location: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Photo</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                            <Camera size={24} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-muted)' }}>{toolFormData.photo ? toolFormData.photo.name : 'Click to upload image'}</span>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => setToolFormData({ ...toolFormData, photo: e.target.files?.[0] || null })}
                            />
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary">{editingTool ? "Update Tool" : "Save Tool"}</button>
                </form>
            </Modal>

            {/* Consumable Modal */}
            <Modal isOpen={isConsumableModalOpen} onClose={() => setIsConsumableModalOpen(false)} title={editingConsumable ? "Edit Stock Item" : "Add Stock Item"}>
                <form onSubmit={handleAddConsumable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Item Name</label>
                        <input className="input" required value={consumableFormData.item_name} onChange={e => setConsumableFormData({ ...consumableFormData, item_name: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                            <input type="number" step="0.01" className="input" value={consumableFormData.quantity_on_hand} onChange={e => setConsumableFormData({ ...consumableFormData, quantity_on_hand: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Unit</label>
                            <input className="input" placeholder="kg, liters, packs" value={consumableFormData.unit} onChange={e => setConsumableFormData({ ...consumableFormData, unit: e.target.value })} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Reorder Threshold</label>
                            <input type="number" step="0.01" className="input" value={consumableFormData.reorder_threshold} onChange={e => setConsumableFormData({ ...consumableFormData, reorder_threshold: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Unit Price (KES)</label>
                            <input type="number" step="0.01" className="input" value={consumableFormData.unit_price} onChange={e => setConsumableFormData({ ...consumableFormData, unit_price: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">{editingConsumable ? "Update Item" : "Save Item"}</button>
                </form>
            </Modal>

            {/* Data Display */}
            {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                    <Spinner size={32} />
                </div>
            ) : activeTab === 'tools' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Cards */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {filteredTools.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tools found.</div>
                        ) : (
                            filteredTools.map(tool => (
                                <div key={tool.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {tool.photo ? (
                                        <img src={tool.photo} alt={tool.name} style={{ width: 60, height: 60, borderRadius: '8px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Wrench size={24} color="var(--text-muted)" />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{tool.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tool.category} • Qty: {tool.quantity}</div>
                                        <span style={{
                                            padding: '0.125rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            backgroundColor: tool.condition === 'GOOD' || tool.condition === 'NEW' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: tool.condition === 'GOOD' || tool.condition === 'NEW' ? 'var(--primary)' : 'var(--danger)'
                                        }}>{tool.condition}</span>
                                    </div>
                                    <ActionMenu onEdit={() => handleOpenToolModal(tool)} onDelete={() => handleDeleteTool(tool.id)} />
                                </div>
                            ))
                        )}
                    </div>
                    {/* Desktop Table */}
                    <div className="desktop-only" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '1rem' }}>Photo</th>
                                    <th style={{ padding: '1rem' }}>Name</th>
                                    <th style={{ padding: '1rem' }}>Category</th>
                                    <th style={{ padding: '1rem' }}>Qty</th>
                                    <th style={{ padding: '1rem' }}>Condition</th>
                                    <th style={{ padding: '1rem' }}>Location</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTools.length === 0 ? <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No tools recorded.</td></tr> :
                                    filteredTools.map(tool => (
                                        <tr key={tool.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {tool.photo ? (
                                                    <img src={tool.photo} alt={tool.name} style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 50, height: 50, borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Image size={20} color="var(--text-muted)" />
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{tool.name}</td>
                                            <td style={{ padding: '1rem' }}>{tool.category}</td>
                                            <td style={{ padding: '1rem' }}>{tool.quantity}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: tool.condition === 'GOOD' || tool.condition === 'NEW' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: tool.condition === 'GOOD' || tool.condition === 'NEW' ? 'var(--primary)' : 'var(--danger)'
                                                }}>{tool.condition}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{tool.location}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <ActionMenu onEdit={() => handleOpenToolModal(tool)} onDelete={() => handleDeleteTool(tool.id)} />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Cards */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {filteredConsumables.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No stock items.</div>
                        ) : (
                            filteredConsumables.map(item => (
                                <div key={item.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{item.item_name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.quantity_on_hand} {item.unit}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {parseFloat(item.quantity_on_hand) <= parseFloat(item.reorder_threshold) && (
                                            <AlertTriangle size={16} color="var(--danger)" />
                                        )}
                                        <ActionMenu onEdit={() => handleOpenConsumableModal(item)} onDelete={() => handleDeleteConsumable(item.id)} />
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
                                    <th style={{ padding: '1rem' }}>Item</th>
                                    <th style={{ padding: '1rem' }}>Stock</th>
                                    <th style={{ padding: '1rem' }}>Unit</th>
                                    <th style={{ padding: '1rem' }}>Threshold</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConsumables.length === 0 ? <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No stock items recorded.</td></tr> :
                                    filteredConsumables.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{item.item_name}</td>
                                            <td style={{ padding: '1rem' }}>{item.quantity_on_hand}</td>
                                            <td style={{ padding: '1rem' }}>{item.unit}</td>
                                            <td style={{ padding: '1rem' }}>{item.reorder_threshold}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {parseFloat(item.quantity_on_hand) <= parseFloat(item.reorder_threshold) ? (
                                                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <AlertTriangle size={16} /> Low Stock
                                                    </span>
                                                ) : <span style={{ color: 'var(--primary)' }}>OK</span>}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <ActionMenu onEdit={() => handleOpenConsumableModal(item)} onDelete={() => handleDeleteConsumable(item.id)} />
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

export default InventoryPage;
