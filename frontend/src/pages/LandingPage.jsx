import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, TrendingUp, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

function LandingPage() {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();
    const [showLangMenu, setShowLangMenu] = useState(false);

    const languages = [
        { code: 'en', name: 'English', label: 'EN' },
        { code: 'hi', name: 'Hindi', label: 'HI' },
        { code: 'mr', name: 'Marathi', label: 'MR' }
    ];

    return (
        <div className="page-container" style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        }}>
            {/* Language Switcher for Landing Page */}
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
                <button
                    className="btn btn-outline btn-sm"
                    style={{ background: 'white', borderRadius: 'var(--radius-full)' }}
                    onClick={() => setShowLangMenu(!showLangMenu)}
                >
                    <Globe size={18} />
                    {languages.find(l => l.code === language)?.label}
                </button>
                {showLangMenu && (
                    <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                        background: 'white', borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)',
                        overflow: 'hidden', minWidth: '120px'
                    }}>
                        {languages.map(lang => (
                            <div
                                key={lang.code}
                                style={{
                                    padding: '0.75rem 1rem', cursor: 'pointer',
                                    background: language === lang.code ? 'var(--color-primary-ultra-light)' : 'transparent',
                                    color: language === lang.code ? 'var(--color-primary)' : 'var(--color-text-primary)'
                                }}
                                onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                            >
                                {lang.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="container">
                <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                    {/* Logo/Icon */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 2rem',
                        background: 'linear-gradient(135deg, #2563eb, #10b981)',
                        borderRadius: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'slideInUp 0.6s ease-out'
                    }}>
                        <GraduationCap size={56} color="white" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #2563eb, #10b981)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'fadeIn 0.8s ease-out'
                    }}>
                        {t('appName')}
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '3rem',
                        maxWidth: '600px',
                        margin: '0 auto 3rem',
                        animation: 'fadeIn 1s ease-out'
                    }}>
                        Smart, secure, and efficient student fee management system with AI-powered analytics and insights.
                    </p>

                    {/* Features */}
                    <div className="grid grid-3" style={{
                        marginBottom: '3rem',
                        gap: '1.5rem'
                    }}>
                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.2s both' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                margin: '0 auto 1rem',
                                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Shield size={28} color="#2563eb" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Secure Access</h4>
                            <p style={{ fontSize: '0.95rem' }}>Protected admin and student portals with secure authentication</p>
                        </div>

                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.4s both' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                margin: '0 auto 1rem',
                                background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={28} color="#10b981" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>AI Analytics</h4>
                            <p style={{ fontSize: '0.95rem' }}>Smart insights and predictions for payment trends</p>
                        </div>

                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.6s both' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                margin: '0 auto 1rem',
                                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp size={28} color="#f59e0b" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Real-time Reports</h4>
                            <p style={{ fontSize: '0.95rem' }}>Comprehensive monthly and yearly fee reports</p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        animation: 'slideInUp 0.6s ease-out 0.8s both'
                    }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate('/admin/login')}
                            style={{
                                minWidth: '200px',
                                fontSize: '1.125rem',
                                padding: '1.125rem 2.5rem'
                            }}
                        >
                            <Shield size={20} />
                            {t('admin')} {t('login')}
                        </button>
                        <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => navigate('/student/login')}
                            style={{
                                minWidth: '200px',
                                fontSize: '1.125rem',
                                padding: '1.125rem 2.5rem'
                            }}
                        >
                            <GraduationCap size={20} />
                            {t('student')} {t('login')}
                        </button>
                    </div>

                    {/* Footer tagline */}
                    <p style={{
                        marginTop: '3rem',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.95rem',
                        animation: 'fadeIn 1.2s ease-out'
                    }}>
                        Powered by AI • Secure • Efficient
                    </p>
                </div>
            </div>
        </div >
    );
}

export default LandingPage;
