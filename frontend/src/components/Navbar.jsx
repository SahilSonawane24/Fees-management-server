import { useNavigate } from 'react-router-dom';
import { LogOut, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';

function Navbar({ onLogout, userName = 'User', userRole = 'Student' }) {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();
    const [showLangMenu, setShowLangMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowLangMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const languages = [
        { code: 'en', name: 'English', label: 'EN' },
        { code: 'hi', name: 'Hindi', label: 'हिंदी' },
        { code: 'mr', name: 'Marathi', label: 'मराठी' }
    ];

    const currentLang = languages.find(l => l.code === language) || languages[0];

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <div className="navbar-brand" onClick={() => navigate(userRole === 'Admin' ? '/admin/dashboard' : '/student/dashboard')} style={{ cursor: 'pointer' }}>
                        {t('appName')}
                    </div>

                    <div className="navbar-actions">
                        {/* Language Selector */}
                        <div style={{ position: 'relative' }} ref={menuRef}>
                            <button
                                className="btn btn-outline btn-sm"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '100px', justifyContent: 'space-between' }}
                                onClick={() => setShowLangMenu(!showLangMenu)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Globe size={16} />
                                    <span>{currentLang.label}</span>
                                </div>
                                <ChevronDown size={14} style={{ transform: showLangMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            {showLangMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: 'var(--color-bg-card)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid var(--color-border)',
                                    width: '150px',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    animation: 'fadeIn 0.2s ease-out'
                                }}>
                                    {languages.map((lang) => (
                                        <div
                                            key={lang.code}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                background: language === lang.code ? 'var(--color-primary-ultra-light)' : 'transparent',
                                                color: language === lang.code ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setShowLangMenu(false);
                                            }}
                                            onMouseEnter={(e) => {
                                                if (language !== lang.code) e.currentTarget.style.background = 'var(--color-bg-hover)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (language !== lang.code) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <span>{lang.name}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{lang.code.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="user-info">
                            <div className="user-avatar">{userName?.charAt(0) || 'U'}</div>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{userName}</span>
                        </div>

                        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                            <LogOut size={16} />
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
