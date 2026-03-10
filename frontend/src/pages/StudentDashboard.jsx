import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, AlertCircle, Phone, Hash, GraduationCap, User, Eye, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function StudentDashboard({ student, onLogout }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentStudent, setCurrentStudent] = useState(student);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('🔄 Fetching student dashboard data...');

                // Fetch Profile
                const profileRes = await API.get('/students/profile');
                console.log('👤 Profile received:', profileRes.data);
                setCurrentStudent(profileRes.data);

                // Fetch Recent Transactions
                const transRes = await API.get('/transactions/my');
                console.log('💳 My transactions received:', transRes.data.length);
                const sorted = transRes.data.sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt));
                setTransactions(sorted.slice(0, 4));

                console.log('✅ Student dashboard data loaded successfully');
            } catch (error) {
                console.error('❌ Error fetching dashboard data:', error);
                console.error('Error details:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const totalPendingBalance = currentStudent?.pendingFee || 0;
    const totalPaid = currentStudent?.totalPaid || 0;

    // Sums from transactions
    const pendingTransAmount = transactions
        .filter(t => t.status === 'Pending')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const unpaidTransAmount = transactions
        .filter(t => t.status === 'Unpaid')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalFees = totalPaid + totalPendingBalance;

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            <Navbar
                onLogout={onLogout}
                userName={currentStudent?.name || 'Student'}
                userRole="Student"
            />

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ marginBottom: '0.5rem' }}>{t('student')} {t('dashboard')}</h2>
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            {t('welcomeBack')}, {currentStudent?.name || 'Student'}!
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/student/view-profile')}
                        >
                            <Eye size={16} />
                            {t('viewProfile')}
                        </button>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/student/edit-profile')}
                        >
                            <User size={16} />
                            {t('editProfile')}
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                            <CreditCard size={24} color="#10b981" />
                        </div>
                        <div className="stat-value">₹{totalPaid.toLocaleString()}</div>
                        <div className="stat-label">Total Paid</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)' }}>
                            <AlertCircle size={24} color="#ef4444" />
                        </div>
                        <div className="stat-value">₹{totalPendingBalance.toLocaleString()}</div>
                        <div className="stat-label">Pending Balance</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                            <Calendar size={24} color="#f59e0b" />
                        </div>
                        <div className="stat-value">₹{pendingTransAmount.toLocaleString()}</div>
                        <div className="stat-label">Pending Trans.</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
                            <FileText size={24} color="#9333ea" />
                        </div>
                        <div className="stat-value">₹{totalFees.toLocaleString()}</div>
                        <div className="stat-label">Total Course Fee</div>
                    </div>
                </div>

                {/* Profile Card & QR Code Display */}
                <div className="grid" style={{ gridTemplateColumns: currentStudent?.qrImage ? '2fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('student')} {t('profile')}</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <GraduationCap size={24} color="#2563eb" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Full Name</div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {currentStudent?.name || 'Rahul Sharma'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Hash size={24} color="#10b981" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Roll Number</div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {currentStudent?.rollNo || 'CS001'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <GraduationCap size={24} color="#f59e0b" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Class</div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {currentStudent?.class || 'B.Tech CSE - 3rd Year'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Phone size={24} color="#9333ea" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Mobile Number</div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {currentStudent?.mobile || '+91 98765 43210'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {currentStudent?.qrImage && (
                        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Your QR Code</h3>
                            <div style={{
                                background: 'white',
                                padding: '10px',
                                borderRadius: 'var(--radius-md)',
                                display: 'inline-block',
                                border: '1px solid var(--color-border)',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <img
                                    src={currentStudent.qrImage}
                                    alt="Student QR Code"
                                    style={{ maxWidth: '100%', maxHeight: '150px', display: 'block' }}
                                />
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                Use this QR for verification and payments
                            </p>
                        </div>
                    )}
                </div>

                {/* Pending Fee Alert */}
                {totalPendingBalance > 0 && (
                    <div className="alert alert-warning" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <AlertCircle size={24} />
                            <div>
                                <strong>{t('pendingFees')} Alert!</strong>
                                <p style={{ marginBottom: 0, marginTop: '0.25rem' }}>
                                    You have ₹{totalPendingBalance.toLocaleString()} in pending fees.
                                </p>
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate('/student/payment')}
                        >
                            <CreditCard size={16} />
                            {t('payNow')}
                        </button>
                    </div>
                )}

                {/* Recent Activity Section */}
                <div style={{ marginTop: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: 0 }}>Recent Activity</h3>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/student/monthly-history')}
                        >
                            View All History
                        </button>
                    </div>
                    <div className="grid grid-1" style={{ gap: '1rem' }}>
                        {transactions.length > 0 ? (
                            transactions.map((record) => (
                                <div
                                    key={record._id}
                                    className="card"
                                    style={{
                                        padding: '1.25rem',
                                        background: 'white',
                                        border: `1px solid ${record.status === 'Paid' ? 'var(--color-success)' : record.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-error)'}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: record.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {record.status === 'Paid' ? (
                                                <CreditCard size={20} color="#10b981" />
                                            ) : record.status === 'Pending' ? (
                                                <Calendar size={20} color="#f59e0b" />
                                            ) : (
                                                <AlertCircle size={20} color="#ef4444" />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{record.month} {record.year} Fee</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                Recorded on {new Date(record.paymentDate || record.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            ₹{record.amount.toLocaleString()}
                                        </div>
                                        <span className={`badge badge-${record.status === 'Paid' ? 'success' : record.status === 'Pending' ? 'warning' : 'error'}`} style={{ fontSize: '0.75rem' }}>
                                            {record.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                No recent transactions found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('quickActions')}</h3>
                    <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                        {/* ... keep existing buttons ... */}
                        <div
                            className="card"
                            style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--color-primary-light)' }}
                            onClick={() => navigate('/student/payment')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--color-primary), #1e40af)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <CreditCard size={32} color="white" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '0.25rem' }}>{t('payFee')}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                        Make online fee payments
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => navigate('/student/monthly-history')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Calendar size={32} color="#2563eb" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '0.25rem' }}>{t('history')}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                        View payment records
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="card"
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => navigate('/student/yearly-report')}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileText size={32} color="#10b981" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '0.25rem' }}>{t('reports')}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                        Download fee reports
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
