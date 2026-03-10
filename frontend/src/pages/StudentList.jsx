import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, DollarSign, Search, MessageSquare, Trash2, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function StudentList({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        try {
            const { data } = await API.get('/admin/students');
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();

        // Set school filter from navigation state if available
        if (location.state?.filterSchool) {
            setSchoolFilter(location.state.filterSchool);
        }
    }, [location.state]);

    const [editingStudent, setEditingStudent] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        rollNo: '',
        class: '',
        mobile: '',
        schoolName: '',
        pendingFee: 0,
        password: ''
    });

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? All associated transaction records will also be removed.`)) {
            try {
                await API.delete(`/admin/students/${id}`);
                setStudents(students.filter(s => s._id !== id));
                alert('Student deleted successfully');
            } catch (error) {
                console.error('Error deleting student:', error);
                alert(error.response?.data?.message || 'Failed to delete student');
            }
        }
    };

    const handleEditClick = (student) => {
        setEditingStudent(student);
        setEditFormData({
            name: student.name,
            rollNo: student.rollNo,
            class: student.class,
            mobile: student.mobile,
            schoolName: student.schoolName,
            pendingFee: student.pendingFee,
            password: '' // Keep empty unless changing
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/admin/students/${editingStudent._id}`, editFormData);
            setStudents(students.map(s => s._id === editingStudent._id ? data : s));
            setEditingStudent(null);
            alert('Student details updated successfully');
        } catch (error) {
            console.error('Error updating student:', error);
            alert(error.response?.data?.message || 'Failed to update student');
        }
    };

    // Get unique school names for filter dropdown
    const schoolNames = [...new Set(students.map(s => s.schoolName).filter(Boolean))];

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.schoolName && student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSchool = !schoolFilter || student.schoolName === schoolFilter;

        return matchesSearch && matchesSchool;
    });

    if (loading) {
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
                    <div className="card-header">
                        <div>
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('students')}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                {students.length} {t('students')}
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/admin/add-student', { state: { selectedSchool: schoolFilter } })}
                        >
                            {t('addStudent')}
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                            <Search
                                size={20}
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)'
                                }}
                            />
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '3rem' }}
                            />
                        </div>

                        {schoolNames.length > 0 && (
                            <div style={{ minWidth: '200px' }}>
                                <select
                                    className="form-select"
                                    value={schoolFilter}
                                    onChange={(e) => setSchoolFilter(e.target.value)}
                                    style={{ height: '100%' }}
                                >
                                    <option value="">{t('allStudents')} - {t('school')}</option>
                                    {schoolNames.map(school => (
                                        <option key={school} value={school}>{school}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('rollNo')}</th>
                                    <th>{t('name')}</th>
                                    <th>{t('class')}</th>
                                    <th>{t('school')}</th>
                                    <th>{t('mobile')}</th>
                                    <th>{t('status')}</th>
                                    <th>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {student.rollNo}
                                        </td>
                                        <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                            {student.name}
                                        </td>
                                        <td>{student.class}</td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>
                                            {student.schoolName || 'N/A'}
                                        </td>
                                        <td>{student.mobile}</td>
                                        <td>
                                            {student.pendingFee > 0 ? (
                                                <span className="badge badge-warning">
                                                    ₹{student.pendingFee} {t('pending')}
                                                </span>
                                            ) : (
                                                <span className="badge badge-success">
                                                    {t('paid')}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleEditClick(student)}
                                                    title="Edit Student"
                                                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)' }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {student.pendingFee > 0 && (
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() => navigate('/admin/collect-fee', { state: { studentId: student._id } })}
                                                        title="Collect Fee"
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                )}
                                                {student.pendingFee > 0 && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => {
                                                            alert(`SMS Sent to ${student.name} (${student.mobile}):\n"Dear ${student.name}, your fee of ₹${student.pendingFee} is pending. Please pay at the earliest. Regards, Fee Management System."`);
                                                        }}
                                                        title="Send SMS Reminder"
                                                        style={{ color: '#e11d48', borderColor: '#ffe4e6' }}
                                                    >
                                                        <MessageSquare size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDelete(student._id, student.name)}
                                                    title="Delete Student"
                                                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* No results */}
                    {filteredStudents.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            <p>No students found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingStudent && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{t('studentDetails')}</h3>
                            <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                <ArrowLeft size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="grid grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">{t('fullName')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('rollNo')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.rollNo}
                                        onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('class')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.class}
                                        onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('mobile')}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editFormData.mobile}
                                        onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('school')}</label>
                                <select
                                    className="form-select"
                                    value={editFormData.schoolName}
                                    onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                                    required
                                >
                                    {schoolNames.map(school => (
                                        <option key={school} value={school}>{school}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('pendingAmount')} (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editFormData.pendingFee}
                                    onChange={(e) => setEditFormData({ ...editFormData, pendingFee: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('newPassword')}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={editFormData.password}
                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                    placeholder={t('enterPassword')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {t('saveChanges')}
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingStudent(null)}>
                                    {t('cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentList;
