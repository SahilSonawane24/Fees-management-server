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
        <div className="page-container page-hero">
            {/* Language Switcher for Landing Page */}
            <div className="language-switcher">
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
                <div className="hero-content">
                    {/* Logo/Icon */}
                    <div className="hero-logo">
                        <GraduationCap size={56} color="white" strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h1 className="landing-title">
                        {t('appName')}
                    </h1>

                    {/* Subtitle */}
                    <p className="landing-subtitle">
                        Smart, secure, and efficient student fee management system with AI-powered analytics and insights.
                    </p>

                    {/* Features */}
                    <div className="landing-feature-grid">
                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.2s both' }}>
                            <div className="landing-card-icon">
                                <Shield size={28} color="#2563eb" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Secure Access</h4>
                            <p style={{ fontSize: '0.95rem' }}>Protected admin and student portals with secure authentication</p>
                        </div>

                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.4s both' }}>
                            <div className="landing-card-icon" style={{ background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)' }}>
                                <Sparkles size={28} color="#10b981" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>AI Analytics</h4>
                            <p style={{ fontSize: '0.95rem' }}>Smart insights and predictions for payment trends</p>
                        </div>

                        <div className="card" style={{ animation: 'slideInUp 0.6s ease-out 0.6s both' }}>
                            <div className="landing-card-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                                <TrendingUp size={28} color="#f59e0b" />
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>Real-time Reports</h4>
                            <p style={{ fontSize: '0.95rem' }}>Comprehensive monthly and yearly fee reports</p>
                        </div>
                    </div>

                    <div className="hero-cta-group" style={{ animation: 'slideInUp 0.6s ease-out 0.8s both' }}>
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
