import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Users, DollarSign, Search, Filter, Trash2, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function AdminMonthlyCollection({ onLogout }) {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const currentYear = new Date().getFullYear().toString();
    const currentMonthLong = new Date().toLocaleString('default', { month: 'long' });

    const [selectedMonth, setSelectedMonth] = useState(currentMonthLong);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = ['2024', '2025', '2026', '2027'];

    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        status: 'Paid',
        paymentDate: ''
    });

    useEffect(() => {
        const fetchMonthlyTransactions = async () => {
            // ... existing fetch logic
            setLoading(true);
            try {
                const { data } = await API.get(`/transactions/monthly?month=${selectedMonth}&year=${selectedYear}`);
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching monthly transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyTransactions();
    }, [selectedMonth, selectedYear]);

    const handleDeleteTransaction = async (id) => {
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await API.delete(`/transactions/${id}`);
                setTransactions(transactions.filter(t => t._id !== id));
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert(t('failed'));
            }
        }
    };

    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        setEditFormData({
            amount: transaction.amount,
            status: transaction.status,
            paymentDate: transaction.paymentDate ? new Date(transaction.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingTransaction) return;

        try {
            const { data } = await API.put(`/transactions/${editingTransaction._id}`, editFormData);

            // Update local state
            setTransactions(transactions.map(txn =>
                txn._id === editingTransaction._id ? { ...txn, ...data, student: txn.student } : txn
            ));

            setEditingTransaction(null);
            alert(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert(t('failed'));
        }
    };

    const filteredTransactions = (transactions || []).filter(t =>
    (t?.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t?.student?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalCollection = filteredTransactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + (t?.amount || 0), 0);

    const handleDownload = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        const drawHeader = (d) => {
            d.setFillColor(37, 99, 235);
            d.rect(0, 0, pageWidth, 18, 'F');
            d.setFontSize(18);
            d.setTextColor(255, 255, 255);
            d.setFont('helvetica', 'bold');
            d.text('OM SAI SCHOOL VAN SERVICE', pageWidth / 2, 8, { align: 'center' });
            d.setFontSize(10);
            d.setFont('helvetica', 'normal');
            d.text(t('monthlyCollection'), pageWidth / 2, 14, { align: 'center' });
        };

        drawHeader(doc);

        // Meta Info
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Period: ${selectedMonth} ${selectedYear}`, 14, 33);

        // Summary box
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 45, 180, 18, 2, 2, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('totalCollection')}: Rs. ${totalCollection.toLocaleString()}`, 20, 57);
        doc.text(`${t('paid')} ${t('students')}: ${filteredTransactions.filter(t => t.status === 'Paid').length}`, 120, 57);

        // Table
        const tableColumn = [t('name'), t('mobile'), t('rollNo'), t('totalAmount'), t('paidAmount'), t('paymentDate'), t('status')];
        const tableRows = filteredTransactions.map(txn => [
            txn.student?.name || 'N/A',
            txn.student?.mobile || '-',
            txn.student?.rollNo || 'N/A',
            `Rs. ${txn.amount.toLocaleString()}`,
            `Rs. ${txn.amount.toLocaleString()}`,
            new Date(txn.paymentDate || txn.createdAt).toLocaleDateString(),
            txn.status === 'Paid' ? t('paid') : t('pending')
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                halign: 'center'
            },
            styles: { fontSize: 8, cellPadding: 2 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 25 },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    drawHeader(doc);
                }
            }
        });

        // Final Totals at the end
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setDrawColor(37, 99, 235);
        doc.setFillColor(248, 250, 252);
        doc.rect(14, finalY, 170, 15, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74); // Green
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('totalCollected').toUpperCase()}: Rs. ${totalCollection.toLocaleString()}`, 20, finalY + 10);

        doc.save(`Monthly_Collection_${selectedMonth}_${selectedYear}.pdf`);
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
            <Navbar onLogout={onLogout} userName="Admin" userRole="Admin" />

            {/* Main Content */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="btn btn-outline"
                    style={{
                        padding: '0.5rem 1rem',
                        marginBottom: '1.5rem',
                        border: 'none',
                        background: 'transparent'
                    }}
                >
                    <ArrowLeft size={20} />
                    {t('backToDashboard')}
                </button>

                <div className="card" style={{ padding: '2.5rem' }}>
                    <div className="card-header" style={{ marginBottom: '2.5rem' }}>
                        <div>
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('monthlyCollection')}</h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                {t('trackPayments')} {language === 'mr' ? (
                                    (() => {
                                        const marathiMonths = {
                                            'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                            'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                            'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                        };
                                        return marathiMonths[selectedMonth] || selectedMonth;
                                    })()
                                ) : selectedMonth} {selectedYear}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => navigate('/admin/collect-fee')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <DollarSign size={18} />
                                {t('collectFee')}
                            </button>
                            <button className="btn btn-primary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Download size={18} />
                                {t('exportData')}
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, var(--color-primary), #1e40af)',
                            borderRadius: 'var(--radius-lg)',
                            color: 'white',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('totalMonthlyCollection')}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>₹{totalCollection.toLocaleString()}</div>
                        </div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{t('paid')} {t('students')}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{filteredTransactions.filter(t => t.status === 'Paid').length}</div>
                        </div>
                        <div style={{
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{t('avgPayment')}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                                ₹{filteredTransactions.filter(t => t.status === 'Paid').length > 0 ? Math.round(totalCollection / filteredTransactions.filter(t => t.status === 'Paid').length).toLocaleString() : 0}
                            </div>
                        </div>
                    </div>

                    {/* Filters bar */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'var(--color-bg-hover)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '2rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        alignItems: 'flex-end'
                    }}>
                        <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}><Filter size={12} style={{ marginRight: '0.3rem' }} /> {t('month')}</label>
                            <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                {months.map(m => {
                                    const marathiMonths = {
                                        'January': 'जानेवारी', 'February': 'फेब्रुवारी', 'March': 'मार्च', 'April': 'एप्रिल',
                                        'May': 'मे', 'June': 'जुन', 'July': 'जुलै', 'August': 'ऑगस्ट',
                                        'September': 'सप्टेंबर', 'October': 'ऑक्टोबर', 'November': 'नोव्हेंबर', 'December': 'डिसेंबर'
                                    };
                                    return <option key={m} value={m}>{language === 'mr' ? marathiMonths[m] : m}</option>
                                })}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, minWidth: '100px' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>{t('year')}</label>
                            <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}><Search size={12} style={{ marginRight: '0.3rem' }} /> {t('search')} {t('student')}</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('search') + "..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('name')}</th>
                                    <th>{t('rollNo')}</th>
                                    <th>{t('totalAmount')}</th>
                                    <th>{t('paidAmount')}</th>
                                    <th>{t('paymentDate')}</th>
                                    <th>{t('status')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn) => (
                                        <tr key={txn._id}>
                                            <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{txn.student?.name}</td>
                                            <td>{txn.student?.rollNo}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>₹{txn.amount.toLocaleString()}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>₹{txn.amount.toLocaleString()}</td>
                                            <td>{new Date(txn.paymentDate || txn.createdAt).toLocaleDateString()}</td>
                                            <td><span className={`badge badge-${txn.status === 'Paid' ? 'success' : 'danger'}`}>{txn.status === 'Paid' ? t('paid') : t('pending')}</span></td>
                                            <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleEditClick(txn)}
                                                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', padding: '0.4rem' }}
                                                    title={t('edit')}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDeleteTransaction(txn._id)}
                                                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)', padding: '0.4rem' }}
                                                    title={t('delete')}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                                            <div style={{ marginBottom: '1rem' }}><Search size={48} opacity={0.2} /></div>
                                            {t('noResults')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTransaction && (
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
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('edit')}</h3>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <label className="form-label">{t('amount')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editFormData.amount}
                                    onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('paymentDate')}</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={editFormData.paymentDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, paymentDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('status')}</label>
                                <select
                                    className="form-select"
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                >
                                    <option value="Paid">{t('paid')}</option>
                                    <option value="Pending">{t('pending')}</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{t('saveChanges')}</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingTransaction(null)}>{t('cancel')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMonthlyCollection;
