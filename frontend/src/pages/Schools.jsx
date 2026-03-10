import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, School, Users, ChevronRight, Trash2, Plus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function Schools({ onLogout }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newSchoolAddress, setNewSchoolAddress] = useState('');
    const [newSchoolContact, setNewSchoolContact] = useState('');

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            // New endpoint that returns aggregated stats
            const { data } = await API.get('/admin/schools');
            setSchools(data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchool = async (e) => {
        e.preventDefault();
        try {
            await API.post('/admin/schools', {
                name: newSchoolName,
                address: newSchoolAddress,
                contact: newSchoolContact
            });
            setShowAddModal(false);
            setNewSchoolName('');
            setNewSchoolAddress('');
            setNewSchoolContact('');
            fetchSchools(); // Refresh list
        } catch (error) {
            console.error('Error adding school:', error);
            alert(error.response?.data?.message || 'Failed to add school');
        }
    };

    const handleSchoolClick = (schoolName) => {
        // Navigate to student list with school filter
        navigate('/admin/students', { state: { filterSchool: schoolName } });
    };

    const handleDeleteSchool = async (e, schoolName) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await API.delete(`/admin/schools/${schoolName}`);
                fetchSchools(); // Refresh list
            } catch (error) {
                console.error('Error deleting school:', error);
                alert(t('failed'));
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
                <Navbar onLogout={onLogout} userName="Admin" userRole="Admin" />

                {/* Main Content */}
                <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate('/admin/dashboard')}
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

                    <div className="card" style={{ padding: '2rem' }}>
                        <div className="card-header" style={{ marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <School size={28} />
                                    {t('schools')}
                                </h2>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                    {t('totalSchools')}: {schools.length}
                                </p>
                            </div>

                            <div style={{ marginLeft: 'auto' }}>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn btn-primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    <Plus size={20} />
                                    {t('addSchool')}
                                </button>
                            </div>
                        </div>

                        {/* Schools Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {schools.map((school, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSchoolClick(school.name)}
                                    style={{
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: 'var(--shadow-sm)',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                        e.currentTarget.style.borderColor = 'var(--color-border)';
                                    }}
                                >
                                    {/* explicit school indicator */}
                                    {school.isExplicit && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: 'var(--color-success)',
                                            opacity: 0.5
                                        }} title={t('verifiedSchool')} />
                                    )}

                                    {/* School Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                color: 'var(--color-text-primary)',
                                                marginBottom: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <School size={20} style={{ color: 'var(--color-primary)' }} />
                                                {school.name}
                                            </h3>
                                            {(school.address || school.contact) && (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                                    {[school.address, school.contact].filter(Boolean).join(' • ')}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button
                                                onClick={(e) => handleDeleteSchool(e, school.name)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--color-error)',
                                                    padding: '0.25rem',
                                                    borderRadius: '0.25rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '1rem',
                                        marginTop: '1rem'
                                    }}>
                                        <div style={{
                                            background: 'var(--color-bg-hover)',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-muted)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {t('students')}
                                            </div>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                color: 'var(--color-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <Users size={18} />
                                                {school.studentCount}
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'var(--color-bg-hover)',
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--color-text-muted)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {t('pending')}
                                            </div>
                                            <div style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 700,
                                                color: school.pendingFees > 0 ? 'var(--color-warning)' : 'var(--color-success)'
                                            }}>
                                                ₹{school.pendingFees.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--color-border)'
                                    }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {t('totalCollected')}
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 700,
                                            color: 'var(--color-success)'
                                        }}>
                                            ₹{school.totalCollected.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* No schools */}
                        {schools.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                <School size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>{t('noSchoolsFound')}</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn btn-outline"
                                    style={{ marginTop: '1rem' }}
                                >
                                    {t('addFirstSchool')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add School Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>{t('addSchool')}</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowAddModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSchool}>
                            <div className="form-group">
                                <label className="form-label">{t('schoolName')} *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Saint Mary's High School"
                                    value={newSchoolName}
                                    onChange={(e) => setNewSchoolName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('addressOptional')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Main Street, City"
                                    value={newSchoolAddress}
                                    onChange={(e) => setNewSchoolAddress(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('contactOptional')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. +91 98765 43210"
                                    value={newSchoolContact}
                                    onChange={(e) => setNewSchoolContact(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowAddModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    {t('createSchool')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Schools;
