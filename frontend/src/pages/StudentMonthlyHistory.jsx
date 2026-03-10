import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function StudentMonthlyHistory({ student, onLogout }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    useEffect(() => {
        const fetchMyHistory = async () => {
            try {
                const { data } = await API.get('/transactions/my');
                // Assuming the API returns an array of paid transactions
                // Each transaction might have properties like: id, amount, transactionDate, description
                setHistory(data);
            } catch (error) {
                console.error('Error fetching history:', error);
                // Optionally, set an error state to display to the user
            } finally {
                setLoading(false);
            }
        };
        fetchMyHistory();
    }, []);

    const totalPaid = history.filter(h => h.status === 'Paid').reduce((sum, h) => sum + h.amount, 0);
    const totalPendingBalance = student?.pendingFee || 0;
    const pendingTransAmount = history.filter(h => h.status === 'Pending').reduce((sum, h) => sum + h.amount, 0);
    const unpaidTransAmount = history.filter(h => h.status === 'Unpaid').reduce((sum, h) => sum + h.amount, 0);
    const paidCount = history.filter(h => h.status === 'Paid').length;

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
                userName={student?.name || 'Student'}
                userRole="Student"
            />

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate('/student/dashboard')}
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
                    {t('backToDashboard')}
                </button>

                <div className="card" style={{ padding: '2.5rem' }}>
                    <div className="card-header" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('monthlyCollection')} {t('history')}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                {t('viewCompleteFeeRecords')}
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-2" style={{ marginBottom: '2rem', gap: '1rem' }}>
                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid var(--color-success)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Check size={24} color="#10b981" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary-dark)' }}>Total Paid</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{totalPaid.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid var(--color-error)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <AlertCircle size={24} color="#ef4444" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>Pending Balance</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{totalPendingBalance.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid var(--color-warning)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Calendar size={24} color="#f59e0b" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#92400e' }}>In Process (Pending)</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{pendingTransAmount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px solid #9333ea'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <X size={24} color="#9333ea" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#6b21a8' }}>Unpaid Amount</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{unpaidTransAmount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment History List */}
                    <h3 style={{ marginBottom: '1.5rem' }}>Payment Records</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {history.length > 0 ? (
                            history.map((record) => (
                                <div
                                    key={record._id}
                                    className="card"
                                    style={{
                                        padding: '1.5rem',
                                        background: record.status === 'Paid' ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : record.status === 'Pending' ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                                        border: `2px solid ${record.status === 'Paid' ? 'var(--color-success)' : record.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-error)'}`,
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                background: record.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : record.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {record.status === 'Paid' ? (
                                                    <Check size={28} color="#10b981" strokeWidth={3} />
                                                ) : record.status === 'Pending' ? (
                                                    <Calendar size={28} color="#f59e0b" strokeWidth={3} />
                                                ) : (
                                                    <X size={28} color="#ef4444" strokeWidth={3} />
                                                )}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ marginBottom: 0, color: 'var(--color-text-primary)' }}>
                                                        {record.month} {record.year}
                                                    </h4>
                                                    <span className={`badge badge-${record.status === 'Paid' ? 'success' : record.status === 'Pending' ? 'warning' : 'error'}`}>{record.status}</span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '2rem',
                                                    fontSize: '0.95rem',
                                                    color: 'var(--color-text-secondary)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <DollarSign size={16} />
                                                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            ₹{record.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={16} />
                                                        <span>{record.status === 'Paid' ? 'Paid on' : 'Recorded on'}: {new Date(record.paymentDate || record.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderStyle: 'dashed' }}>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: 0 }}>No payment records found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentMonthlyHistory;
