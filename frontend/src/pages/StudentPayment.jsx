import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Building2, Wallet } from 'lucide-react';
import API from '../utils/api';

function StudentPayment({ student, onLogout }) {
    const navigate = useNavigate();
    const [currentStudent, setCurrentStudent] = useState(student);
    const [paymentStep, setPaymentStep] = useState('selection'); // selection, processing, success
    const [selectedAmount, setSelectedAmount] = useState(15000);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get('/students/profile');
                setCurrentStudent(data);
                // Set default amount to pending fee if it's less than 15000, or just keep 15000
                if (data.pendingFee > 0 && data.pendingFee < 15000) {
                    setSelectedAmount(data.pendingFee);
                }
            } catch (error) {
                console.error('Error fetching student profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const handleProcessPayment = async () => {
        setPaymentStep('processing');

        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear().toString();

        try {
            await API.post('/transactions/pay', {
                amount: selectedAmount,
                month,
                year
            });
            setPaymentStep('success');
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            setPaymentStep('selection');
        }
    };

    const handleBackToDashboard = () => {
        navigate('/student/dashboard');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (paymentStep === 'success') {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div className="card slide-in-up" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem'
                    }}>
                        <CheckCircle2 size={48} color="#10b981" />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Your fee payment of ₹{selectedAmount.toLocaleString()} has been processed and recorded successfully.
                    </p>
                    <div style={{
                        background: 'var(--color-bg-hover)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Receipt ID:</span>
                            <span style={{ fontWeight: 600 }}>#FEC-{Math.floor(Math.random() * 900000 + 100000)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
                            <span style={{ fontWeight: 600 }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Method:</span>
                            <span style={{ fontWeight: 600 }}>{paymentMethod}</span>
                        </div>
                    </div>
                    <button className="btn btn-primary btn-block" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-brand">Fee Management</div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <div className="user-avatar">{currentStudent?.name?.charAt(0) || 'S'}</div>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{currentStudent?.name || 'Student'}</span>
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
                <button
                    onClick={handleBackToDashboard}
                    className="btn btn-outline"
                    style={{ border: 'none', background: 'transparent', marginBottom: '1.5rem' }}
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'flex-start' }}>
                    {/* Payment Form Card */}
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CreditCard size={28} color="var(--color-primary)" />
                            Pay Your Fees
                        </h2>

                        {paymentStep === 'selection' ? (
                            <>
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label className="form-label">Select Fee Amount</label>
                                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                                        <div
                                            onClick={() => setSelectedAmount(15000)}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${selectedAmount === 15000 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                background: selectedAmount === 15000 ? 'rgba(37, 99, 235, 0.05)' : 'white',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>₹15,000</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current Month Fee</div>
                                        </div>
                                        <div
                                            onClick={() => setSelectedAmount(45000)}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${selectedAmount === 45000 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                background: selectedAmount === 45000 ? 'rgba(37, 99, 235, 0.05)' : 'white',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>₹45,000</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Full Quarter Payment</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label className="form-label">Choose Payment Method</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {[
                                            { id: 'UPI', label: 'UPI (PhonePe, Google Pay)', icon: <Building2 size={20} /> },
                                            { id: 'CARD', label: 'Debit / Credit Card', icon: <CreditCard size={20} /> },
                                            { id: 'NETBANKING', label: 'Net Banking', icon: <Building2 size={20} /> },
                                            { id: 'WALLET', label: 'Wallets', icon: <Wallet size={20} /> }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                style={{
                                                    padding: '1.25rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: `1px solid ${paymentMethod === method.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    cursor: 'pointer',
                                                    background: paymentMethod === method.id ? 'rgba(37, 99, 235, 0.05)' : 'white',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ color: paymentMethod === method.id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                                    {method.icon}
                                                </div>
                                                <div style={{ flex: 1, fontWeight: 500 }}>{method.label}</div>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    border: '2px solid var(--color-border)',
                                                    position: 'relative'
                                                }}>
                                                    {paymentMethod === method.id && (
                                                        <div style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '50%',
                                                            background: 'var(--color-primary)',
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)'
                                                        }} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--color-info-light)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}>
                                    <ShieldCheck size={24} color="var(--color-primary)" />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)', marginBottom: 0 }}>
                                        Your payment is encrypted and 100% secure.
                                    </p>
                                </div>

                                <button
                                    className="btn btn-primary btn-block btn-lg"
                                    onClick={handleProcessPayment}
                                >
                                    Proceed to Pay ₹{selectedAmount.toLocaleString()}
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ width: '50px', height: '50px', marginBottom: '1.5rem' }}></div>
                                <h3 style={{ marginBottom: '0.5rem' }}>Processing Payment...</h3>
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Please do not refresh the page or click "Back".
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Student Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Name</div>
                                    <div style={{ fontWeight: 600 }}>{currentStudent?.name || 'Student'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Roll Number</div>
                                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{currentStudent?.rollNo || '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Academic Class</div>
                                    <div style={{ fontWeight: 600 }}>{currentStudent?.class || '-'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Payment Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Tution Fee</span>
                                    <span>₹{(selectedAmount * 0.9).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Platform Fee</span>
                                    <span>₹{(selectedAmount * 0.1).toLocaleString()}</span>
                                </div>
                                <div style={{
                                    height: '1px',
                                    background: 'var(--color-border)',
                                    margin: '0.5rem 0'
                                }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                                    <span>Total Amount</span>
                                    <span>₹{selectedAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-info">
                            <AlertCircle size={20} />
                            <div style={{ fontSize: '0.85rem' }}>
                                After successful payment, the digital receipt will be automatically generated and sent to your email.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentPayment;
