import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, Hash, ArrowLeft, AlertCircle } from 'lucide-react';
import API from '../utils/api';

function StudentLogin({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        rollNo: '', // This acts as UserID (Mobile/Roll)
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await API.post('/students/login', {
                userId: formData.rollNo,
                password: formData.password
            });
            sessionStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'student' }));
            onLogin(data);
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="container">
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                    {/* Back button */}
                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        marginBottom: '2rem',
                        transition: 'color 0.2s'
                    }}>
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>

                    <div className="card slide-in-up" style={{ padding: '2.5rem' }}>
                        {/* Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            borderRadius: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                        }}>
                            <GraduationCap size={40} color="white" strokeWidth={2} />
                        </div>

                        {/* Title */}
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            Student Login
                        </h2>
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '2rem'
                        }}>
                            Access your fee details and reports
                        </p>

                        {/* Error message */}
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="rollNo">
                                    <Hash size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    UserID (Mobile No / Roll No)
                                </label>
                                <input
                                    type="text"
                                    id="rollNo"
                                    name="rollNo"
                                    className="form-input"
                                    placeholder="Enter mobile number or roll no"
                                    value={formData.rollNo}
                                    onChange={handleChange}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">
                                    <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Enter your password (default: your mobile no)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-secondary btn-block btn-lg"
                                disabled={loading}
                                style={{ marginTop: '1.5rem' }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                        Logging in...
                                    </>
                                ) : (
                                    'Login to Dashboard'
                                )}
                            </button>
                        </form>

                        {/* Demo credentials hint */}
                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'var(--color-success-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-secondary-dark)'
                        }}>
                            {/* <strong>Demo Credentials:</strong><br />
                            Roll No: CS001<br />
                            Password: student123 */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;
