import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, User, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function CollectFee({ onLogout }) {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        studentId: '',
        month: '',
        year: new Date().getFullYear().toString(),
        amount: '',
        status: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (location.state) {
            const { studentId, prefillMonth, prefillYear } = location.state;
            setFormData(prev => ({
                ...prev,
                studentId: studentId || prev.studentId,
                month: prefillMonth || prev.month,
                year: prefillYear || prev.year
            }));
        }
    }, [location.state]);
    const [students, setStudents] = useState([]);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await API.get('/admin/students');
                setStudents(data);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setFetchingStudents(false);
            }
        };
        fetchStudents();
    }, []);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = [2022, 2023, 2024, 2025, 2026];

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
            await API.post('/transactions', {
                studentId: formData.studentId,
                amount: formData.amount,
                month: formData.month,
                year: formData.year,
                status: formData.status,
                paymentDate: formData.paymentDate
            });

            setSuccess(true);
            setLoading(false);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({
                    studentId: '',
                    month: '',
                    year: new Date().getFullYear().toString(),
                    amount: '',
                    status: 'Paid',
                    paymentDate: new Date().toISOString().split('T')[0]
                });
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record payment');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const selectedStudent = students.find(s => s._id === formData.studentId);

    if (fetchingStudents) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            <Navbar onLogout={onLogout} userName="Admin" userRole="Admin" />

            {/* Main Content */}

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

                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '2.5rem' }}>
                        <div className="card-header" style={{ marginBottom: '2rem', paddingBottom: '1rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.5rem' }}>{t('collectMonthlyFee')}</h2>
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                    {t('recordFeePayment')}
                                </p>
                            </div>
                        </div>

                        {/* Success message */}
                        {success && (
                            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                                <CheckCircle size={20} />
                                {t('paymentRecorded')}
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
                            {/* Student Selection */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="studentId">
                                    <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    {t('selectStudent')}
                                </label>
                                <select
                                    id="studentId"
                                    name="studentId"
                                    className="form-select"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">{t('chooseStudent')}</option>
                                    {students.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.rollNo} - {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected student card */}
                            {selectedStudent && (
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--color-primary-ultra-light)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1.5rem',
                                    border: '2px solid var(--color-border)'
                                }}>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                                        {selectedStudent.name}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                        {t('rollNo')}: {selectedStudent.rollNo}
                                    </div>
                                </div>
                            )}

                            {/* Month and Year */}
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="month">
                                        <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('month')}
                                    </label>
                                    <select
                                        id="month"
                                        name="month"
                                        className="form-select"
                                        value={formData.month}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">{t('selectMonth')}</option>
                                        {months.map((month) => {
                                            const marathiMonths = {
                                                'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                                'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                                'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                            };
                                            return (
                                                <option key={month} value={month}>
                                                    {language === 'mr' ? marathiMonths[month] : month}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="year">
                                        {t('year')}
                                    </label>
                                    <select
                                        id="year"
                                        name="year"
                                        className="form-select"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Amount and Date */}
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="amount">
                                        <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        {t('amount')} (₹)
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        className="form-input"
                                        placeholder="e.g., 15000"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        min="0"
                                        step="100"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="paymentDate">
                                        {t('paymentDate')}
                                    </label>
                                    <input
                                        type="date"
                                        id="paymentDate"
                                        name="paymentDate"
                                        className="form-input"
                                        value={formData.paymentDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="form-group">
                                <label className="form-label" htmlFor="status">
                                    <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    {t('status')}
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Paid">{t('paid')}</option>
                                    <option value="Pending">{t('pending')}</option>
                                    <option value="Unpaid">{t('unpaid')}</option>
                                </select>
                            </div>

                            {/* Payment Status Preview */}
                            {formData.amount && formData.month && (
                                <div style={{
                                    padding: '1.5rem',
                                    background: formData.status === 'Paid' ? 'var(--color-success-light)' : formData.status === 'Pending' ? 'var(--color-warning-light)' : 'var(--color-error-light)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: '1.5rem',
                                    border: `2px solid ${formData.status === 'Paid' ? 'var(--color-success)' : formData.status === 'Pending' ? 'var(--color-warning)' : 'var(--color-error)'}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                                {t('paymentSummary')}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                                ₹{formData.amount}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                                                {t('for')} {(() => {
                                                    const marathiMonths = {
                                                        'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                                        'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                                        'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                                    };
                                                    return (language === 'mr' ? marathiMonths[formData.month] : formData.month) || formData.month;
                                                })()} {formData.year}
                                            </div>
                                        </div>
                                        <span className={`badge badge-${formData.status === 'Paid' ? 'success' : 'danger'}`} style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                                            {formData.status === 'Paid' ? t('paid') : t('pending')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-secondary"
                                    disabled={loading}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                            {t('recordingPayment')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            {t('recordPayment')}
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate('/admin/dashboard')}
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

export default CollectFee;
