import React, { useEffect, useState } from 'react';
import { Beef, TrendingUp, TrendingDown, Egg, Milk, Users, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalLivestock: number;
    totalWorkers: number;
    dailyMilk: number;
    dailyEggs: number;
    totalRevenue: number;
    totalExpenses: number;
    lowStockItems: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch data from multiple endpoints
            const [livestockRes, workersRes, salesRes, expensesRes, produceRes, consumablesRes] = await Promise.all([
                api.get('/livestock/'),
                api.get('/workers/'),
                api.get('/sales/'),
                api.get('/expenditure/'),
                api.get('/produce/records/'),
                api.get('/consumables/')
            ]);

            // Calculate stats
            const livestock = livestockRes.data;
            const workers = workersRes.data;
            const sales = salesRes.data;
            const expenses = expensesRes.data;
            const produce = produceRes.data;
            const consumables = consumablesRes.data;

            // Today's date
            const today = new Date().toISOString().split('T')[0];

            // Daily milk (today's total)
            const todayMilk = produce
                .filter((p: any) => p.produce_type === 'MILK' && p.date === today)
                .reduce((sum: number, p: any) => sum + parseFloat(p.quantity || 0), 0);

            // Daily eggs (today's total)
            const todayEggs = produce
                .filter((p: any) => p.produce_type === 'EGGS' && p.date === today)
                .reduce((sum: number, p: any) => sum + parseFloat(p.quantity || 0), 0);

            // Total revenue & expenses
            const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0);
            const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

            // Low stock items
            const lowStock = consumables.filter((c: any) => parseFloat(c.quantity_on_hand) <= parseFloat(c.reorder_threshold)).length;

            setStats({
                totalLivestock: livestock.reduce((sum: number, l: any) => sum + (l.quantity || 1), 0),
                totalWorkers: workers.length,
                dailyMilk: todayMilk,
                dailyEggs: todayEggs,
                totalRevenue,
                totalExpenses,
                lowStockItems: lowStock
            });

            // Recent activity
            setRecentSales(sales.slice(0, 5));
            setRecentExpenses(expenses.slice(0, 5));

        } catch (error) {
            console.error("Error fetching dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ padding: '3rem' }}>
                <Spinner size={40} />
            </div>
        );
    }

    const netProfit = (stats?.totalRevenue || 0) - (stats?.totalExpenses || 0);

    const statCards = [
        { label: 'Total Livestock', value: stats?.totalLivestock || 0, icon: <Beef size={24} />, color: '#10B981', link: '/livestock' },
        { label: 'Farm Workers', value: stats?.totalWorkers || 0, icon: <Users size={24} />, color: '#3B82F6', link: '/workforce' },
        { label: "Today's Milk", value: `${stats?.dailyMilk || 0} L`, icon: <Milk size={24} />, color: '#60A5FA', link: '/produce' },
        { label: "Today's Eggs", value: stats?.dailyEggs || 0, icon: <Egg size={24} />, color: '#F59E0B', link: '/produce' },
        { label: 'Total Revenue', value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#10B981', link: '/commerce' },
        { label: 'Total Expenses', value: `KES ${(stats?.totalExpenses || 0).toLocaleString()}`, icon: <TrendingDown size={24} />, color: '#EF4444', link: '/commerce' },
        { label: 'Net Profit', value: `KES ${netProfit.toLocaleString()}`, icon: netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />, color: netProfit >= 0 ? '#10B981' : '#EF4444', link: '/commerce' },
        { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: <AlertTriangle size={24} />, color: stats?.lowStockItems ? '#EF4444' : '#9CA3AF', link: '/inventory' },
    ];

    return (
        <div>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {statCards.map((stat, index) => (
                    <Link to={stat.link} key={index} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '50%',
                                background: `${stat.color}20`,
                                color: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stat.value}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Sales */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Sales</h3>
                        <Link to="/commerce" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>View All</Link>
                    </div>
                    {recentSales.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No sales recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentSales.map((sale: any) => (
                                <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{sale.product}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sale.date}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                                        KES {parseFloat(sale.total_amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Expenses */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Expenses</h3>
                        <Link to="/commerce" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>View All</Link>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentExpenses.map((expense: any) => (
                                <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{expense.category}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expense.date}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                                        KES {parseFloat(expense.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
