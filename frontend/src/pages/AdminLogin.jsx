import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import API from '../utils/api';

function AdminLogin({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
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
            const { data } = await API.post('/admin/login', formData);
            sessionStorage.setItem('userInfo', JSON.stringify({ ...data, role: 'admin' }));
            onLogin({ ...data, role: 'admin' });
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
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
                            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                            borderRadius: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
                        }}>
                            <Shield size={40} color="white" strokeWidth={2} />
                        </div>

                        {/* Title */}
                        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                            Admin Login
                        </h2>
                        <p style={{
                            textAlign: 'center',
                            color: 'var(--color-text-secondary)',
                            marginBottom: '2rem'
                        }}>
                            Access your admin dashboard
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
                                <label className="form-label" htmlFor="username">
                                    <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    placeholder="Enter your username"
                                    value={formData.username}
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
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
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
{/* 
                         Demo credentials hint 
                        <div style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'var(--color-info-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-primary-dark)'
                        }}>
                             {/*<strong>Demo Credentials:</strong><br />
                            Username: Sahil<br />
                            Password: 2005 
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
