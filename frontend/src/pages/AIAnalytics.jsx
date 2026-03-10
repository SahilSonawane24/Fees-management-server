import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AIAnalytics({ onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    // Sample data for charts
    const monthlyTrendData = [
        { month: 'Jan', collected: 420000, expected: 450000 },
        { month: 'Feb', collected: 445000, expected: 450000 },
        { month: 'Mar', collected: 450000, expected: 450000 },
        { month: 'Apr', collected: 430000, expected: 450000 },
        { month: 'May', collected: 448000, expected: 450000 },
        { month: 'Jun', collected: 450000, expected: 450000 },
        { month: 'Jul', collected: 445000, expected: 450000 },
        { month: 'Aug', collected: 450000, expected: 450000 },
        { month: 'Sep', collected: 440000, expected: 450000 },
        { month: 'Oct', collected: 450000, expected: 450000 },
    ];

    const paymentPatternData = [
        { name: 'On-Time Payments', value: 185, color: '#10b981' },
        { name: 'Late Payments', value: 45, color: '#f59e0b' },
        { name: 'Very Late', value: 15, color: '#ef4444' },
    ];

    const classWiseData = [
        { class: '1st Year', paid: 58, pending: 2 },
        { class: '2nd Year', paid: 62, pending: 3 },
        { class: '3rd Year', paid: 55, pending: 5 },
        { class: '4th Year', paid: 60, pending: 0 },
    ];

    // AI-generated insights
    const aiInsights = [
        {
            type: 'warning',
            icon: AlertTriangle,
            color: '#f59e0b',
            title: 'High Risk Alert',
            message: 'AI predicts 12 students have a high probability of late payment next month based on historical patterns.',
            action: 'Send Reminder'
        },
        {
            type: 'success',
            icon: TrendingUp,
            color: '#10b981',
            title: 'Positive Trend',
            message: 'Payment collection rate has improved by 8.5% compared to the same period last year.',
            action: 'View Details'
        },
        {
            type: 'info',
            icon: Brain,
            color: '#2563eb',
            title: 'Payment Pattern Detected',
            message: 'Most students prefer paying fees in the first week of each month. Consider scheduling reminders accordingly.',
            action: 'Optimize Schedule'
        },
        {
            type: 'success',
            icon: CheckCircle,
            color: '#10b981',
            title: 'Collection Milestone',
            message: 'Successfully collected 90% of the expected annual fee. Only 2 months remaining.',
            action: 'View Report'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-brand">Fee Management</div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <div className="user-avatar">A</div>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Admin</span>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-text-secondary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '1.5rem',
                        fontSize: '0.95rem',
                        padding: '0.5rem',
                        transition: 'color 0.2s'
                    }}
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="card" style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                    color: 'white',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '72px',
                            height: '72px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Brain size={40} color="white" />
                        </div>
                        <div>
                            <h2 style={{ marginBottom: '0.5rem', color: 'white' }}>AI Analytics Dashboard</h2>
                            <p style={{ marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)' }}>
                                Intelligent insights and predictions powered by machine learning
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Insights Grid */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>AI-Powered Insights</h3>
                    <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                        {aiInsights.map((insight, index) => {
                            const IconComponent = insight.icon;
                            return (
                                <div
                                    key={index}
                                    className="card"
                                    style={{
                                        padding: '1.5rem',
                                        borderLeft: `4px solid ${insight.color}`
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            background: `${insight.color}20`,
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <IconComponent size={28} color={insight.color} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                                                {insight.title}
                                            </h4>
                                            <p style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                                                {insight.message}
                                            </p>
                                            <button
                                                className="btn btn-sm btn-outline"
                                                style={{ borderColor: insight.color, color: insight.color }}
                                            >
                                                {insight.action}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Monthly Trend Chart */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Monthly Payment Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="collected"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Collected Amount"
                                    dot={{ fill: '#10b981', r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expected"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Expected Amount"
                                    dot={{ fill: '#2563eb', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Payment Pattern Pie Chart */}
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Payment Patterns</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentPatternData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentPatternData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class-wise Analysis */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Class-wise Fee Collection</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={classWiseData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="class" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="paid" fill="#10b981" name="Paid Students" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="pending" fill="#f59e0b" name="Pending Students" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AIAnalytics;
