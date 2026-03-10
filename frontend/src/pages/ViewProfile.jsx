import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Phone, Mail, GraduationCap, Hash, Edit3 } from 'lucide-react';

function ViewProfile({ user, onLogout, isStudent = true }) {
    const navigate = useNavigate();

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

                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        {/* Profile Header Background */}
                        <div style={{
                            height: '140px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => navigate(isStudent ? '/student/edit-profile' : '/admin/edit-profile')}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.5rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    borderRadius: 'var(--radius-md)',
                                    backdropFilter: 'blur(4px)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500
                                }}
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        </div>

                        <div style={{ padding: '0 2.5rem 2.5rem', marginTop: '-50px', position: 'relative' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '4px solid white',
                                background: 'white',
                                boxShadow: 'var(--shadow-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                color: 'var(--color-primary)',
                                marginBottom: '1.5rem'
                            }}>
                                {user?.name?.charAt(0) || 'U'}
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ marginBottom: '0.25rem' }}>{user?.name || 'Rahul Sharma'}</h2>
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    {isStudent ? (user?.class || 'B.Tech CSE - 3rd Year') : 'System Administrator'}
                                </p>
                            </div>

                            <div className="grid grid-2" style={{ gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--color-bg-hover)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-primary)'
                                    }}>
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                            Email Address
                                        </div>
                                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {user?.email || 'Not provided'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--color-bg-hover)',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#10b981'
                                    }}>
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                            Mobile Number
                                        </div>
                                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {user?.mobile || '+91 00000 00000'}
                                        </div>
                                    </div>
                                </div>

                                {isStudent && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: 'var(--color-bg-hover)',
                                                borderRadius: 'var(--radius-md)',
                                                color: '#f59e0b'
                                            }}>
                                                <Hash size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                                    Roll Number
                                                </div>
                                                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                    {user?.rollNo || 'CS001'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                            <div style={{
                                                padding: '0.75rem',
                                                background: 'var(--color-bg-hover)',
                                                borderRadius: 'var(--radius-md)',
                                                color: '#9333ea'
                                            }}>
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                                    Academic Class
                                                </div>
                                                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                    {user?.class || 'B.Tech CSE - 3rd Year'}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(isStudent ? '/student/edit-profile' : '/admin/edit-profile')}
                                    style={{ width: '100%' }}
                                >
                                    Update Profile Information
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewProfile;
