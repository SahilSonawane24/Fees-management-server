import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LogOut, CheckCircle, User, Hash, School, Phone, Key, Image as ImageIcon, X, AlertCircle, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function AddStudent({ onLogout }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const location = useLocation();
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        rollNo: '',
        class: '',
        schoolName: '',
        mobile: '',
        username: '',
        password: '',
        qrImage: null
    });
    const [schools, setSchools] = useState([]);
    const [showNewSchoolInput, setShowNewSchoolInput] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [qrPreview, setQrPreview] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSchools();

        // Pre-fill school from state if coming from filtered school view
        if (location.state?.selectedSchool) {
            setFormData(prev => ({ ...prev, schoolName: location.state.selectedSchool }));
        }
    }, [location.state]);

    const fetchSchools = async () => {
        try {
            const { data } = await API.get('/admin/schools');
            // Extract school names from School objects
            const schoolNames = data.map(s => s.name);
            setSchools(schoolNames);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const handleAddNewSchool = () => {
        if (newSchoolName.trim()) {
            setFormData({ ...formData, schoolName: newSchoolName.trim() });
            setSchools([...schools, newSchoolName.trim()]);
            setNewSchoolName('');
            setShowNewSchoolInput(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrPreview(reader.result);
                setFormData(prev => ({ ...prev, qrImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setQrPreview(null);
        setFormData(prev => ({ ...prev, qrImage: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await API.post('/admin/students', {
                name: formData.name,
                rollNo: formData.rollNo,
                class: formData.class,
                schoolName: formData.schoolName,
                mobile: formData.mobile,
                password: formData.password || formData.mobile, // backend also handles this but good to be explicit
                pendingFee: 0 // Default for new student
            });

            setSuccess(true);
            setLoading(false);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({
                    name: '',
                    rollNo: '',
                    class: '',
                    mobile: '',
                    username: '',
                    password: '',
                    qrImage: null
                });
                setQrPreview(null);
                setSuccess(true);
                setLoading(false);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || t('failedToAddStudent'));
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
                        <div className="navbar-brand">{t('appName')}</div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <div className="user-avatar">A</div>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{t('admin')}</span>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                <LogOut size={16} />
                                {t('logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

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

                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div className="card-header" style={{ marginBottom: '2rem', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.5rem' }}>{t('addNewStudent')}</h2>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                    {t('registerStudentDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Success message */}
                        {success && (
                            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                                <CheckCircle size={20} />
                                {t('studentAddedSuccess')}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="name">
                                        <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('fullName')}
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="form-input"
                                        placeholder={t('namePlaceholder')}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="rollNo">
                                        <Hash size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('rollNumber')}
                                    </label>
                                    <input
                                        type="text"
                                        id="rollNo"
                                        name="rollNo"
                                        className="form-input"
                                        placeholder={t('rollNumber')}
                                        value={formData.rollNo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="class">
                                        <School size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('class')}
                                    </label>
                                    <select
                                        id="class"
                                        name="class"
                                        className="form-select"
                                        value={formData.class}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t('selectClass')}</option>
                                        <option value="1st Std">{t('std1')}</option>
                                        <option value="2nd Std">{t('std2')}</option>
                                        <option value="3rd Std">{t('std3')}</option>
                                        <option value="4th Std">{t('std4')}</option>
                                        <option value="5th Std">{t('std5')}</option>
                                        <option value="6th Std">{t('std6')}</option>
                                        <option value="7th Std">{t('std7')}</option>
                                        <option value="8th Std">{t('std8')}</option>
                                        <option value="9th Std">{t('std9')}</option>
                                        <option value="10th Std">{t('std10')}</option>
                                    </select>
                                </div>

                                {/* School Name Selection */}
                                <div className="form-group">
                                    <label className="form-label" htmlFor="schoolName">
                                        <School size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('schoolName')}
                                    </label>
                                    {!showNewSchoolInput ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select
                                                id="schoolName"
                                                name="schoolName"
                                                className="form-select"
                                                value={formData.schoolName}
                                                onChange={handleChange}
                                                required
                                                style={{ flex: 1 }}
                                            >
                                                <option value="">{t('selectSchool')}</option>
                                                {schools.map((school, index) => (
                                                    <option key={index} value={school}>{school}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => setShowNewSchoolInput(true)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}
                                                title={t('addSchool')}
                                            >
                                                <Plus size={16} />
                                                {t('new')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={t('enterNewSchoolName')}
                                                value={newSchoolName}
                                                onChange={(e) => setNewSchoolName(e.target.value)}
                                                style={{ flex: 1 }}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleAddNewSchool}
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                {t('add')}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    setShowNewSchoolInput(false);
                                                    setNewSchoolName('');
                                                }}
                                                style={{ padding: '0.5rem 1rem' }}
                                            >
                                                {t('cancel')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="mobile">
                                        <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('mobileNumber')}
                                    </label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        className="form-input"
                                        placeholder={t('mobilePlaceholder')}
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="username">
                                        <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('usernameUserID')}
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        className="form-input"
                                        placeholder={t('mobileNoDefault')}
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                        {t('leaveBlankForMobile')}
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="password">
                                        <Key size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('password')}
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        className="form-input"
                                        placeholder={t('mobileNoDefault')}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                        {t('leaveBlankForMobile')}
                                    </p>
                                </div>

                                <div className="form-group form-group-full" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">
                                        <ImageIcon size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('studentQrCode')}
                                    </label>
                                    <div style={{
                                        border: '2px dashed var(--color-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        background: 'var(--color-bg-hover)',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}>
                                        {!qrPreview ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    ref={fileInputRef}
                                                    style={{ display: 'none' }}
                                                    id="qr-upload"
                                                />
                                                <label htmlFor="qr-upload" style={{ cursor: 'pointer' }}>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <ImageIcon size={48} color="var(--color-text-muted)" />
                                                    </div>
                                                    <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                        {t('clickToUploadQr')}
                                                    </p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                                        {t('fileFormatNote')}
                                                    </p>
                                                </label>
                                            </>
                                        ) : (
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                <img
                                                    src={qrPreview}
                                                    alt="QR Preview"
                                                    style={{
                                                        maxWidth: '200px',
                                                        maxHeight: '200px',
                                                        borderRadius: 'var(--radius-md)',
                                                        boxShadow: 'var(--shadow-md)'
                                                    }}
                                                />
                                                <button
                                                    onClick={removeImage}
                                                    type="button"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '-10px',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--color-danger)',
                                                        color: 'white',
                                                        border: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                            {t('addingStudent')}
                                        </>
                                    ) : (
                                        t('addStudent')
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate('/admin/dashboard')}
                                    style={{ flex: 1 }}
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddStudent;
