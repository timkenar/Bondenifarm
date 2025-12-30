import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Sale, Expenditure } from '../types/commerce';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ActionMenu from '../components/ActionMenu';
import { Plus, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';

const CommercePage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sales' | 'expenditure'>('sales');

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modals
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    // Editing state
    const [editingSale, setEditingSale] = useState<Sale | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expenditure | null>(null);

    const [saleFormData, setSaleFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        product: 'EGGS',
        quantity: '',
        unit: 'crates',
        unit_price: '',
        customer_name: '',
        payment_status: 'PAID'
    });

    const [expenseFormData, setExpenseFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'FEED',
        amount: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [salesRes, expenseRes] = await Promise.all([
                api.get('/sales/'),
                api.get('/expenditure/')
            ]);
            setSales(salesRes.data);
            setExpenditures(expenseRes.data);
        } catch (error) {
            console.error("Failed to fetch commerce data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSaleModal = (sale?: Sale) => {
        if (sale) {
            setEditingSale(sale);
            setSaleFormData({
                date: sale.date,
                product: sale.product,
                quantity: sale.quantity,
                unit: sale.unit,
                unit_price: sale.unit_price,
                customer_name: sale.customer_name,
                payment_status: sale.payment_status
            });
        } else {
            setEditingSale(null);
            setSaleFormData({
                date: new Date().toISOString().split('T')[0],
                product: 'EGGS',
                quantity: '',
                unit: 'crates',
                unit_price: '',
                customer_name: '',
                payment_status: 'PAID'
            });
        }
        setIsSaleModalOpen(true);
    };

    const handleOpenExpenseModal = (expense?: Expenditure) => {
        if (expense) {
            setEditingExpense(expense);
            setExpenseFormData({
                date: expense.date,
                category: expense.category,
                amount: expense.amount,
                description: expense.description
            });
        } else {
            setEditingExpense(null);
            setExpenseFormData({
                date: new Date().toISOString().split('T')[0],
                category: 'FEED',
                amount: '',
                description: ''
            });
        }
        setIsExpenseModalOpen(true);
    };

    const handleSubmitSale = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSale) {
                const res = await api.put(`/sales/${editingSale.id}/`, saleFormData);
                setSales(sales.map(s => s.id === editingSale.id ? res.data : s));
            } else {
                const res = await api.post('/sales/', saleFormData);
                setSales([res.data, ...sales]);
            }
            setIsSaleModalOpen(false);
        } catch (error) {
            console.error("Failed to save sale", error);
        }
    };

    const handleSubmitExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                const res = await api.put(`/expenditure/${editingExpense.id}/`, expenseFormData);
                setExpenditures(expenditures.map(e => e.id === editingExpense.id ? res.data : e));
            } else {
                const res = await api.post('/expenditure/', expenseFormData);
                setExpenditures([res.data, ...expenditures]);
            }
            setIsExpenseModalOpen(false);
        } catch (error) {
            console.error("Failed to save expense", error);
        }
    };

    const handleDeleteSale = async (id: string) => {
        if (!confirm("Delete this sale?")) return;
        try {
            await api.delete(`/sales/${id}/`);
            setSales(sales.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete sale", error);
        }
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await api.delete(`/expenditure/${id}/`);
            setExpenditures(expenditures.filter(e => e.id !== id));
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    // Filtering
    const filterByDate = <T extends { date: string }>(items: T[]) => {
        return items.filter(item => {
            if (dateFrom && item.date < dateFrom) return false;
            if (dateTo && item.date > dateTo) return false;
            return true;
        });
    };

    const filteredSales = filterByDate(sales);
    const filteredExpenses = filterByDate(expenditures);

    // Totals
    const totalRevenue = filteredSales.reduce((sum, s) => sum + parseFloat(s.total_amount || '0'), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    const netProfit = totalRevenue - totalExpenses;

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

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Commerce</h2>
                <button
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                    onClick={() => activeTab === 'sales' ? handleOpenSaleModal() : handleOpenExpenseModal()}
                >
                    <Plus size={20} />
                    {activeTab === 'sales' ? 'Record Sale' : 'Add Expense'}
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Revenue</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>KES {totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Expenses</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>KES {totalExpenses.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '50%', background: netProfit >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: netProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                        {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Net Profit</p>
                        <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: netProfit >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                            KES {netProfit.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Tabs */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('sales')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'sales' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'sales' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Sales ({filteredSales.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('expenditure')}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === 'expenditure' ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === 'expenditure' ? 'var(--primary)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Expenses ({filteredExpenses.length})
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} color="var(--text-muted)" />
                            <input type="date" className="input" style={{ width: 'auto' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                            <span style={{ color: 'var(--text-muted)' }}>to</span>
                            <input type="date" className="input" style={{ width: 'auto' }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <button
                            className="btn"
                            style={{ gap: '0.5rem', color: 'var(--primary)' }}
                            onClick={() => exportToCSV(activeTab === 'sales' ? filteredSales : filteredExpenses, activeTab)}
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Sales Modal */}
            <Modal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} title={editingSale ? "Edit Sale" : "Record Sale"}>
                <form onSubmit={handleSubmitSale} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" className="input" required value={saleFormData.date} onChange={e => setSaleFormData({ ...saleFormData, date: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product</label>
                            <select className="input" value={saleFormData.product} onChange={e => setSaleFormData({ ...saleFormData, product: e.target.value as any })}>
                                <option value="EGGS">Eggs</option>
                                <option value="MILK">Milk</option>
                                <option value="MAIZE">Maize</option>
                                <option value="MANURE">Manure</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Payment</label>
                            <select className="input" value={saleFormData.payment_status} onChange={e => setSaleFormData({ ...saleFormData, payment_status: e.target.value as any })}>
                                <option value="PAID">Paid</option>
                                <option value="PARTIAL">Partial</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                            <input type="number" step="0.01" className="input" required value={saleFormData.quantity} onChange={e => setSaleFormData({ ...saleFormData, quantity: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Unit</label>
                            <input type="text" className="input" value={saleFormData.unit} onChange={e => setSaleFormData({ ...saleFormData, unit: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price/Unit</label>
                            <input type="number" step="0.01" className="input" required value={saleFormData.unit_price} onChange={e => setSaleFormData({ ...saleFormData, unit_price: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Customer</label>
                        <input type="text" className="input" value={saleFormData.customer_name} onChange={e => setSaleFormData({ ...saleFormData, customer_name: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">{editingSale ? "Update Sale" : "Save Sale"}</button>
                </form>
            </Modal>

            {/* Expense Modal */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={editingExpense ? "Edit Expense" : "Add Expense"}>
                <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" className="input" required value={expenseFormData.date} onChange={e => setExpenseFormData({ ...expenseFormData, date: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                            <select className="input" value={expenseFormData.category} onChange={e => setExpenseFormData({ ...expenseFormData, category: e.target.value as any })}>
                                <option value="FEED">Feed</option>
                                <option value="LABOR">Labor</option>
                                <option value="FUEL">Fuel</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="TREATMENT">Treatment</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Amount (KES)</label>
                            <input type="number" step="0.01" className="input" required value={expenseFormData.amount} onChange={e => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                        <textarea className="input" rows={3} value={expenseFormData.description} onChange={e => setExpenseFormData({ ...expenseFormData, description: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">{editingExpense ? "Update Expense" : "Save Expense"}</button>
                </form>
            </Modal>

            {/* Data Display */}
            {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                    <Spinner size={32} />
                </div>
            ) : activeTab === 'sales' ? (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Card View */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {filteredSales.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sales found.</div>
                        ) : (
                            filteredSales.map(sale => (
                                <div key={sale.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{sale.product}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{sale.date}</div>
                                        <div style={{ fontSize: '0.875rem' }}>{sale.quantity} {sale.unit} @ KES {sale.unit_price}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>KES {parseFloat(sale.total_amount).toLocaleString()}</div>
                                            <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '99px', background: sale.payment_status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sale.payment_status === 'PAID' ? 'var(--primary)' : '#F59E0B' }}>
                                                {sale.payment_status}
                                            </span>
                                        </div>
                                        <ActionMenu onEdit={() => handleOpenSaleModal(sale)} onDelete={() => handleDeleteSale(sale.id)} />
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
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Product</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Qty</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Total</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Customer</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No sales found.</td></tr>
                                ) : filteredSales.map(sale => (
                                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{sale.date}</td>
                                        <td style={{ padding: '1rem' }}>{sale.product}</td>
                                        <td style={{ padding: '1rem' }}>{sale.quantity} {sale.unit}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary)' }}>KES {parseFloat(sale.total_amount).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>{sale.customer_name || '-'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', background: sale.payment_status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: sale.payment_status === 'PAID' ? 'var(--primary)' : '#F59E0B' }}>
                                                {sale.payment_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <ActionMenu onEdit={() => handleOpenSaleModal(sale)} onDelete={() => handleDeleteSale(sale.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Mobile Card View for Expenses */}
                    <div className="mobile-only" style={{ display: 'none' }}>
                        {filteredExpenses.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses found.</div>
                        ) : (
                            filteredExpenses.map(expense => (
                                <div key={expense.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{expense.category}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{expense.date}</div>
                                        <div style={{ fontSize: '0.875rem' }}>{expense.description?.substring(0, 40)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                                            KES {parseFloat(expense.amount).toLocaleString()}
                                        </div>
                                        <ActionMenu onEdit={() => handleOpenExpenseModal(expense)} onDelete={() => handleDeleteExpense(expense.id)} />
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
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Description</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Amount</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No expenses found.</td></tr>
                                ) : filteredExpenses.map(expense => (
                                    <tr key={expense.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>{expense.date}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', fontSize: '0.875rem' }}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.description}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--danger)' }}>KES {parseFloat(expense.amount).toLocaleString()}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <ActionMenu onEdit={() => handleOpenExpenseModal(expense)} onDelete={() => handleDeleteExpense(expense.id)} />
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

export default CommercePage;
