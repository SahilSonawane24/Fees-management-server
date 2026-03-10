import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Search, MessageSquare, AlertCircle, CheckCircle, Download, Edit, Trash2, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function PendingFees({ onLogout }) {
    const navigate = useNavigate();
    const { t, language, tEn } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingSms, setSendingSms] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
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

    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/admin/students');
            setStudents(data.filter(s => s.pendingFee > 0));
        } catch (error) {
            console.error('Error fetching pending students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const sendSms = (student) => {
        setSendingSms(student._id);
        // Simulate API call
        setTimeout(() => {
            setSendingSms(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            alert(`${t('smsSentTo')} ${student.name} (${student.mobile})`);
        }, 1500);
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
            password: ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await API.delete(`/admin/students/${id}`);
                setStudents(prev => prev.filter(s => s._id !== id));
                alert(t('recordsDeleted'));
            } catch (error) {
                console.error('Error deleting student:', error);
                alert(t('failed'));
            }
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/admin/students/${editingStudent._id}`, editFormData);
            setStudents(prev => prev.map(s => s._id === editingStudent._id ? data : s).filter(s => s.pendingFee > 0));
            setEditingStudent(null);
            alert(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating student:', error);
            alert(t('failed'));
        }
    };

    const sendAllSms = () => {
        if (window.confirm(t('sendSmsRemindersAllConfirm'))) {
            setSendingSms('all');
            setTimeout(() => {
                setSendingSms(null);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                alert(`${t('smsRemindersSent')} to ${filteredStudents.length} students.`);
            }, 2000);
        }
    };

    const handleDownload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        const drawHeader = (d) => {
            d.setFillColor(37, 99, 235);
            d.rect(0, 0, pageWidth, 18, 'F');
            d.setFontSize(18);
            d.setTextColor(255, 255, 255);
            d.setFont('helvetica', 'bold');
            d.text(tEn('schoolBranding'), pageWidth / 2, 10, { align: 'center' });
            d.setFontSize(10);
            d.setFont('helvetica', 'normal');
            d.text(tEn('pendingFeesReport'), pageWidth / 2, 16, { align: 'center' });
        };

        drawHeader(doc);

        // Meta Info
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text(`${tEn('generatedAt')}: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`${tEn('totalCount')}: ${filteredStudents.length} ${tEn('students')}`, 14, 33);

        const totalOutstanding = filteredStudents.reduce((sum, s) => sum + s.pendingFee, 0);

        // Summary box
        doc.setDrawColor(239, 68, 68); // Red for pending
        doc.setLineWidth(0.5);
        doc.setFillColor(254, 242, 242);
        doc.roundedRect(14, 45, 170, 18, 2, 2, 'FD');

        doc.setTextColor(153, 27, 27);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${tEn('totalOutstandingBalance')}: Rs. ${totalOutstanding.toLocaleString()}`, 20, 57);

        // Table
        const tableColumn = [tEn('name'), tEn('rollNumber'), tEn('class'), tEn('mobileNumber'), tEn('pendingAmount')];
        const tableRows = filteredStudents.map(s => [
            s.name,
            s.rollNo,
            s.class,
            s.mobile,
            `Rs. ${s.pendingFee.toLocaleString()}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: {
                fillColor: [239, 68, 68],
                halign: 'center'
            },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [255, 245, 245] },
            margin: { top: 25 },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    drawHeader(doc);
                }
            }
        });

        // Final Totals at the end
        const finalY = doc.lastAutoTable.finalY + 10;
        const totalPaid = filteredStudents.reduce((sum, s) => sum + (s.totalPaid || 0), 0);

        doc.setDrawColor(239, 68, 68);
        doc.setFillColor(254, 242, 242);
        doc.rect(14, finalY, 170, 25, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74); // Green
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('grandTotalPaid')}: Rs. ${totalPaid.toLocaleString()}`, 20, finalY + 10);

        doc.setTextColor(220, 38, 38); // Red
        doc.text(`${t('grandTotalPending')}: Rs. ${totalOutstanding.toLocaleString()}`, 20, finalY + 20);

        doc.save(`Pending_Fees_Report_${new Date().getTime()}.pdf`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

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

                <div className="card" style={{ padding: '2.5rem' }}>
                    <div className="card-header" style={{ marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('pendingFeeReminders')}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                {t('sendSmsAlerts')}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={handleDownload} disabled={filteredStudents.length === 0}>
                                <Download size={18} />
                                {t('exportData')}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={sendAllSms}
                                disabled={sendingSms === 'all' || filteredStudents.length === 0}
                            >
                                <MessageSquare size={18} />
                                {sendingSms === 'all' ? t('sending') : t('sendAllReminders')}
                            </button>
                        </div>
                    </div>

                    {/* Notification Bar */}
                    {showSuccess && (
                        <div className="alert alert-success" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <CheckCircle size={20} />
                            {t('smsRemindersSent')}
                        </div>
                    )}

                    {/* Summary Card */}
                    <div style={{
                        background: 'var(--color-bg-hover)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444'
                        }}>
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{t('totalOutstanding')}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                                ₹{students.reduce((sum, s) => sum + s.pendingFee, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', maxWidth: '450px' }}>
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
                                style={{ paddingLeft: '3rem', height: '3rem' }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('studentDetails')}</th>
                                    <th>{t('mobile')}</th>
                                    <th>{t('pendingAmount')}</th>
                                    <th>{t('lastReminder')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.2rem' }}>
                                                {student.name}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {student.rollNo} • {student.class}
                                            </div>
                                        </td>
                                        <td>{student.mobile}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: '#ef4444' }}>
                                                ₹{student.pendingFee.toLocaleString()}
                                            </span>
                                        </td>
                                        <td>{student.lastReminder || t('neverSms')}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => navigate('/admin/collect-fee', { state: { studentId: student._id } })}
                                                    title={t('collectFee')}
                                                >
                                                    <DollarSign size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleEditClick(student)}
                                                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)' }}
                                                    title={t('edit')}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDelete(student._id)}
                                                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => sendSms(student)}
                                                    disabled={sendingSms === student._id || sendingSms === 'all'}
                                                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                                                >
                                                    {sendingSms === student._id ? (
                                                        t('sending')
                                                    ) : (
                                                        <><MessageSquare size={14} /> SMS</>
                                                    )}
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
                            padding: '4rem',
                            color: 'var(--color-text-muted)'
                        }}>
                            <Search size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
                            <p>No students found with pending fees matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Student Modal */}
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
                    zIndex: 2000
                }}>
                    <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{t('editStudentDetails')} {t('for')} {editingStudent?.name}</h2>
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
                                    <label className="form-label">{t('rollNumber')}</label>
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
                                    <label className="form-label">{t('mobileNumber')}</label>
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
                                <label className="form-label">{t('schoolName')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editFormData.schoolName}
                                    onChange={(e) => setEditFormData({ ...editFormData, schoolName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('pendingAmount')} (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editFormData.pendingFee}
                                    onChange={(e) => setEditFormData({ ...editFormData, pendingFee: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('newPasswordNote')}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={editFormData.password}
                                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                    placeholder={t('passwordPlaceholder')}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('updateStudent')}</button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setEditingStudent(null)}
                                    style={{ flex: 1 }}
                                >
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

export default PendingFees;
