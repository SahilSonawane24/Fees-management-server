import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, CheckCircle, User, Phone, Mail, Camera } from 'lucide-react';
import API from '../utils/api';

function EditProfile({ user, onUpdate, onLogout, isStudent = true }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        email: user?.email || '',
        username: user?.username || ''
    });
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!isStudent) {
                // Admin Update - Real API
                const { data } = await API.put('/admin/profile', formData);

                // Update local state in App.jsx
                if (onUpdate) {
                    onUpdate(data);
                }

                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    navigate('/admin/dashboard');
                }, 1500);
            } else {
                // Student Update - Simulated for now (as in original code)
                // If you want to make this real, you'd need a /students/profile PUT endpoint
                setTimeout(() => {
                    if (onUpdate) {
                        onUpdate(formData);
                    }
                    setSuccess(true);

                    setTimeout(() => {
                        setSuccess(false);
                        navigate('/student/dashboard');
                    }, 1500);
                }, 800);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-brand">Fee Management</div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                    {user?.name || 'User'}
                                </span>
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
                    onClick={() => navigate(isStudent ? '/student/dashboard' : '/admin/dashboard')}
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
                        padding: '0.5rem'
                    }}
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <button style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    <Camera size={16} color="var(--color-text-secondary)" />
                                </button>
                            </div>
                            <h2 style={{ marginTop: '1rem' }}>Edit Profile</h2>
                            <p style={{ color: 'var(--color-text-secondary)' }}>Update your personal information</p>
                        </div>

                        {success && (
                            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                                <CheckCircle size={20} />
                                Profile updated successfully!
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {!isStudent && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        className="form-input"
                                        value={formData.username || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            )}

                            {isStudent && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">
                                            <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            className="form-input"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="e.g. rahul@example.com"
                                        />
                                    </div>
                                </>
                            )}

                            {!isStudent && (
                                <div className="form-group">
                                    <label className="form-label">
                                        Change Password (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input"
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate(isStudent ? '/student/dashboard' : '/admin/dashboard')}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
