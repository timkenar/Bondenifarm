import React, { useEffect, useState } from 'react';
import { Beef, TrendingUp, TrendingDown, Egg, Milk, Users, AlertTriangle, Wheat, MapPin, Sprout } from 'lucide-react';
import api from '../api/axios';
import { toArray } from '../api/helpers';
import Spinner from '../components/Spinner';
import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalLivestock: number;
    totalWorkers: number;
    dailyMilk: number;
    dailyEggs: number;
    totalRevenue: number;
    totalExpenses: number;
    lowStockItems: number;
    totalPlots: number;
    totalAcreage: number;
    activeCrops: number;
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
            const [livestockRes, workersRes, salesRes, expensesRes, produceRes, consumablesRes, plotsRes] = await Promise.all([
                api.get('/livestock/'),
                api.get('/workers/'),
                api.get('/sales/'),
                api.get('/expenditure/'),
                api.get('/produce/records/'),
                api.get('/consumables/'),
                api.get('/farm/plots/').catch(() => ({ data: [] }))
            ]);

            const livestock = toArray<any>(livestockRes.data);
            const workers = toArray<any>(workersRes.data);
            const sales = toArray<any>(salesRes.data);
            const expenses = toArray<any>(expensesRes.data);
            const produce = toArray<any>(produceRes.data);
            const consumables = toArray<any>(consumablesRes.data);
            const plots = toArray<any>(plotsRes.data);

            const today = new Date().toISOString().split('T')[0];

            const todayMilk = produce
                .filter((p: any) => p.produce_type === 'MILK' && p.date === today)
                .reduce((sum: number, p: any) => sum + parseFloat(p.quantity || 0), 0);

            const todayEggs = produce
                .filter((p: any) => p.produce_type === 'EGGS' && p.date === today)
                .reduce((sum: number, p: any) => sum + parseFloat(p.quantity || 0), 0);

            const totalRevenue = sales.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount || 0), 0);
            const totalExpenses = expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);

            const lowStock = consumables.filter((c: any) => parseFloat(c.quantity_on_hand) <= parseFloat(c.reorder_threshold)).length;
            const totalAcreage = plots.reduce((sum: number, p: any) => sum + parseFloat(p.size_acres || 0), 0);

            setStats({
                totalLivestock: livestock.reduce((sum: number, l: any) => sum + (l.quantity || 1), 0),
                totalWorkers: workers.length,
                dailyMilk: todayMilk,
                dailyEggs: todayEggs,
                totalRevenue,
                totalExpenses,
                lowStockItems: lowStock,
                totalPlots: plots.length,
                totalAcreage,
                activeCrops: plots.filter((p: any) => p.status === 'ACTIVE').length,
            });

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
        { label: 'Total Livestock', value: stats?.totalLivestock || 0, icon: <Beef size={24} />, accent: 'amber', color: '#F59E0B', link: '/livestock' },
        { label: 'Farm Workers', value: stats?.totalWorkers || 0, icon: <Users size={24} />, accent: 'indigo', color: '#6366F1', link: '/workforce' },
        { label: "Today's Milk", value: `${stats?.dailyMilk || 0} L`, icon: <Milk size={24} />, accent: 'blue', color: '#3B82F6', link: '/produce' },
        { label: "Today's Eggs", value: stats?.dailyEggs || 0, icon: <Egg size={24} />, accent: 'amber', color: '#F59E0B', link: '/produce' },
        { label: 'Farm Plots', value: `${stats?.totalPlots || 0} (${stats?.totalAcreage?.toFixed(1) || 0} acres)`, icon: <MapPin size={24} />, accent: 'green', color: '#4D7C0F', link: '/settings' },
        { label: 'Active Crops', value: stats?.activeCrops || 0, icon: <Wheat size={24} />, accent: 'green', color: '#4D7C0F', link: '/crops' },
        { label: 'Total Revenue', value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={24} />, accent: 'green', color: '#4D7C0F', link: '/commerce' },
        { label: 'Total Expenses', value: `KES ${(stats?.totalExpenses || 0).toLocaleString()}`, icon: <TrendingDown size={24} />, accent: 'red', color: '#EF4444', link: '/commerce' },
        { label: 'Net Profit', value: `KES ${netProfit.toLocaleString()}`, icon: netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />, accent: netProfit >= 0 ? 'green' : 'red', color: netProfit >= 0 ? '#4D7C0F' : '#EF4444', link: '/commerce' },
        { label: 'Low Stock Items', value: stats?.lowStockItems || 0, icon: <AlertTriangle size={24} />, accent: stats?.lowStockItems ? 'red' : 'green', color: stats?.lowStockItems ? '#EF4444' : '#9CA3AF', link: '/inventory' },
    ];

    return (
        <div className="animate-in">
            <PageHeader
                icon={<Sprout size={24} />}
                accent="#4D7C0F"
                title="Bondeni Farm"
                subtitle="Here's an overview of your farm today"
            />

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: '2rem' }}>
                {statCards.map((stat, index) => (
                    <Link to={stat.link} key={index} style={{ textDecoration: 'none' }}>
                        <div className="stat-card card-interactive" data-accent={stat.accent}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    padding: '0.6rem',
                                    borderRadius: '10px',
                                    background: `${stat.color}15`,
                                    color: stat.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</p>
                                    <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stat.value}</p>
                                </div>
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
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4D7C0F' }}></div>
                            Recent Sales
                        </h3>
                        <Link to="/commerce" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>View All</Link>
                    </div>
                    {recentSales.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No sales recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentSales.map((sale: any) => (
                                <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{sale.product}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sale.date}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#4D7C0F', fontSize: '0.9rem' }}>
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
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
                            Recent Expenses
                        </h3>
                        <Link to="/commerce" style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>View All</Link>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No expenses recorded yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentExpenses.map((expense: any) => (
                                <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{expense.category}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expense.date}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#EF4444', fontSize: '0.9rem' }}>
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
