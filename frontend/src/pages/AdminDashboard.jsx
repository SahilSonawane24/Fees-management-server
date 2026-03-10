import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    DollarSign,
    AlertCircle,
    UserPlus,
    Wallet,
    FileText,
    Brain,
    User,
    Eye,
    TrendingUp,
    MessageSquare,
    Trash2,
    School,
    Edit
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function AdminDashboard({ onLogout }) {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [stats, setStats] = useState(null);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            console.log('🔄 Fetching admin dashboard data...');

            // Fetch stats
            const statsRes = await API.get('/admin/stats');
            console.log('📊 Stats received:', statsRes.data);
            setStats(statsRes.data);

            // Fetch students for pending list
            const studentsRes = await API.get('/admin/students');
            console.log('👥 Students received:', studentsRes.data.length);
            const pending = studentsRes.data
                .filter(s => s.pendingFee > 0)
                .sort((a, b) => b.pendingFee - a.pendingFee)
                .slice(0, 5);
            setPendingStudents(pending);

            // Fetch Recent Transactions
            const transRes = await API.get('/transactions');
            console.log('💳 Transactions received:', transRes.data.length);
            const sortedTrans = transRes.data
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentTransactions(sortedTrans);

            console.log('✅ Dashboard data loaded successfully');
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            console.error('Error details:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        status: 'Paid',
        paymentDate: ''
    });

    const handleDeleteTransaction = async (id) => {
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await API.delete(`/transactions/${id}`);
                fetchDashboardData(); // Refresh everything
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert(t('failed'));
            }
        }
    };

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        setEditFormData({
            amount: transaction.amount,
            status: transaction.status,
            paymentDate: transaction.paymentDate ? new Date(transaction.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingTransaction) return;
        try {
            await API.put(`/transactions/${editingTransaction._id}`, editFormData);
            setEditingTransaction(null);
            fetchDashboardData();
            alert(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert(t('failed'));
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            <Navbar onLogout={onLogout} userName="Admin" userRole="Admin" />

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{t('admin')} {t('dashboard')}</h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>{t('overview')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/view-profile')}><Eye size={16} />{t('viewProfile')}</button>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/edit-profile')}><User size={16} />{t('editProfile')}</button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}><Users size={24} color="#2563eb" /></div>
                        <div className="stat-value">{stats?.totalStudents || 0}</div>
                        <div className="stat-label">{t('totalStudents')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}><DollarSign size={24} color="#10b981" /></div>
                        <div className="stat-value">₹{((stats?.totalCollected || 0) / 100000).toFixed(1)}L</div>
                        <div className="stat-label">{t('totalCollected')}</div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/admin/pending-fees')} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}><AlertCircle size={24} color="#ef4444" /></div>
                        <div className="stat-value">₹{((stats?.pendingFees || 0) / 100000).toFixed(1)}L</div>
                        <div className="stat-label">{t('pendingFees')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}><Wallet size={24} color="#f59e0b" /></div>
                        <div className="stat-value">₹{((stats?.thisMonth || 0) / 100000).toFixed(1)}L</div>
                        <div className="stat-label">{t('thisMonth')}</div>
                    </div>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('quickActions')}</h3>
                    <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                        {[
                            { title: t('addStudent'), desc: t('registerStudentDesc'), icon: <UserPlus size={32} color="#2563eb" />, bg: '#eff6ff', border: '#dbeafe', path: '/admin/add-student' },
                            { title: t('collectFee'), desc: t('collectFeeDesc'), icon: <Wallet size={32} color="#10b981" />, bg: '#f0fdf4', border: '#d1fae5', path: '/admin/collect-fee' },
                            { title: t('students'), desc: t('studentListDesc'), icon: <Users size={32} color="#f59e0b" />, bg: '#fef3c7', border: '#fde68a', path: '/admin/students' },
                            { title: t('schools'), desc: t('schoolsDesc'), icon: <School size={32} color="#6366f1" />, bg: '#e0e7ff', border: '#c7d2fe', path: '/admin/schools' },
                            { title: t('monthlyCollection'), desc: t('monthlyCollectionDesc'), icon: <TrendingUp size={32} color="#ef4444" />, bg: '#fef2f2', border: '#fee2e2', path: '/admin/monthly-collection' },
                            { title: t('yearlyReport'), desc: t('yearlyReportDesc'), icon: <FileText size={32} color="#9333ea" />, bg: '#f3e8ff', border: '#e9d5ff', path: '/admin/yearly-report' },
                            { title: t('smsReminders'), desc: t('smsRemindersDesc'), icon: <MessageSquare size={32} color="#e11d48" />, bg: '#fff1f2', border: '#ffe4e6', path: '/admin/pending-fees' }
                        ].map((action, i) => (
                            <div key={i} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(action.path)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${action.bg}, ${action.border})`, borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{action.icon}</div>
                                    <div><h4 style={{ marginBottom: '0.25rem' }}>{action.title}</h4><p style={{ fontSize: '0.9rem', marginBottom: 0 }}>{action.desc}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: 0 }}>{t('recentPayments')}</h3>
                            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/monthly-collection')}>{t('viewMonthlyReport')}</button>
                        </div>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-wrapper">
                                <table style={{ marginBottom: 0 }}>
                                    <thead>
                                        <tr>
                                            <th>{t('name')}</th><th>{t('monthlyCollection')}</th><th>{t('amount')}</th><th>{t('status')}</th><th>{t('paymentDate')}</th><th style={{ textAlign: 'right' }}>{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentTransactions.map((transaction) => (
                                            <tr key={transaction._id}>
                                                <td style={{ fontWeight: 600 }}>{transaction.student?.name}</td>
                                                <td>{(() => {
                                                    const marathiMonths = {
                                                        'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                                        'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                                        'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                                    };
                                                    return (language === 'mr' ? marathiMonths[transaction.month] : transaction.month) || transaction.month;
                                                })()} {transaction.year}</td>
                                                <td style={{ fontWeight: 700 }}>₹{transaction.amount.toLocaleString()}</td>
                                                <td><span className={`badge badge-${transaction.status === 'Paid' ? 'success' : 'danger'}`}>{transaction.status === 'Paid' ? t('paid') : t('pending')}</span></td>
                                                <td style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{new Date(transaction.paymentDate || transaction.createdAt).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                                        <button className="btn btn-sm btn-outline" onClick={() => handleEditClick(transaction)} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', padding: '0.3rem' }} title={t('edit')}><Edit size={12} /></button>
                                                        <button className="btn btn-sm btn-outline" onClick={() => handleDeleteTransaction(transaction._id)} style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)', padding: '0.3rem' }} title={t('delete')}><Trash2 size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ marginBottom: 0 }}>{t('highestPending')}</h3>
                            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/pending-fees')}>{t('viewAll')}</button>
                        </div>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="table-wrapper">
                                <table style={{ marginBottom: 0 }}>
                                    <thead><tr><th>{t('name')}</th><th>{t('class')}</th><th>{t('pendingAmount')}</th><th style={{ textAlign: 'right' }}>{t('action')}</th></tr></thead>
                                    <tbody>
                                        {pendingStudents.map((student) => (
                                            <tr key={student._id}>
                                                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{student.name}</td>
                                                <td>{student.class}</td>
                                                <td style={{ fontWeight: 700, color: '#ef4444' }}>₹{student.pendingFee.toLocaleString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-sm btn-outline" onClick={() => navigate('/admin/collect-fee', { state: { studentId: student._id } })} title={t('collectFee')}><DollarSign size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '2rem', cursor: 'pointer', background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: 'white' }} onClick={() => navigate('/admin/ai-analytics')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={32} color="white" /></div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ marginBottom: '0.25rem', color: 'white' }}>{t('aiAnalyticsTitle')}</h4>
                                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'rgba(255, 255, 255, 0.9)' }}>{t('aiAnalyticsDesc')}</p>
                            </div>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>{t('aiPowered')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {editingTransaction && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '400px', padding: '2rem', background: 'white' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('edit')}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                            {t('edit')} {t('paidAmount')} {t('for')} <strong>{editingTransaction.student?.name}</strong> ({(() => {
                                const marathiMonths = {
                                    'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                    'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                    'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                };
                                return (language === 'mr' ? marathiMonths[editingTransaction.month] : editingTransaction.month) || editingTransaction.month;
                            })()} {editingTransaction.year})
                        </p>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group"><label className="form-label">{t('amount')} (₹)</label><input type="number" className="form-input" value={editFormData.amount} onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">{t('paymentDate')}</label><input type="date" className="form-input" value={editFormData.paymentDate} onChange={(e) => setEditFormData({ ...editFormData, paymentDate: e.target.value })} required /></div>
                            <div className="form-group"><label className="form-label">{t('status')}</label><select className="form-select" value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}><option value="Paid">{t('paid')}</option><option value="Pending">{t('pending')}</option></select></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}><button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('saveChanges')}</button><button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingTransaction(null)}>{t('cancel')}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
