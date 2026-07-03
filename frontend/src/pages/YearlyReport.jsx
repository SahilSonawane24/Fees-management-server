import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Download, Calendar, TrendingUp, Check, X, Search, Filter, Trash2, Edit, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLanguage } from '../context/LanguageContext';
import API from '../utils/api';

function YearlyReport({ onLogout, isStudent = false, student: initialStudent = null }) {
    const navigate = useNavigate();
    const { t, language, tEn } = useLanguage();

    // Academic year like "2025-26" — June(startYear) to April(endYear)
    const currentCalYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed, June=5
    // If we're in Jan-May, academic year started last calendar year
    const defaultAcademicStartYear = currentMonth >= 5 ? currentCalYear : currentCalYear - 1;
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(
        `${defaultAcademicStartYear}-${String(defaultAcademicStartYear + 1).slice(-2)}`
    );

    // Helper: get the calendar year for a given month name within the academic year
    const firstHalfMonths = ['June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const getYearForMonth = (monthName) => {
        const startYear = parseInt(selectedAcademicYear.split('-')[0]);
        return firstHalfMonths.includes(monthName) ? String(startYear) : String(startYear + 1);
    };

    const academicYears = ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27', '2027-28'];

    const [feeData, setFeeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(initialStudent);

    // Date range filter
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Admin specific states
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const reportMonths = [
        { name: 'June', marathi: 'जुन' },
        { name: 'July', marathi: 'जुलै' },
        { name: 'August', marathi: 'ऑगस्ट' },
        { name: 'September', marathi: 'सप्टेंबर' },
        { name: 'October', marathi: 'आक्टोंबर' },
        { name: 'November', marathi: 'नोव्हेंबर' },
        { name: 'December', marathi: 'डिसेंबर' },
        { name: 'January', marathi: 'जानेवारी' },
        { name: 'February', marathi: 'फेब्रुवारी' },
        { name: 'March', marathi: 'मार्च' },
        { name: 'April', marathi: 'एप्रिल' }
    ];

    const [gridData, setGridData] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!isStudent) {
                try {
                    const { data } = await API.get('/admin/students');
                    setAllStudents(data);
                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            }
        };
        fetchStudents();
    }, [isStudent]);

    // Helper: check if a date string falls within fromDate–toDate range
    const isInDateRange = (rawDate) => {
        if (!fromDate && !toDate) return true;
        if (!rawDate) return false;
        const d = new Date(rawDate);
        if (fromDate && d < new Date(fromDate)) return false;
        if (toDate && d > new Date(toDate + 'T23:59:59')) return false;
        return true;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (isStudent && !student) {
                try {
                    const profileRes = await API.get('/students/profile');
                    setStudent(profileRes.data);
                } catch (error) {
                    console.error('Error fetching student profile:', error);
                }
            }

            setLoading(true);
            try {
                const url = isStudent ? '/transactions/my' : '/transactions';
                const res = await API.get(url);
                const transactions = res.data;

                if (!isStudent && selectedStudentId === 'all') {
                    // Group data for Grid View (Admin only) — academic year aware
                    const gridRows = allStudents.map(s => {
                        const studentTrans = transactions.filter(t =>
                            t.student?._id === s._id &&
                            t.year === getYearForMonth(t.month) &&
                            firstHalfMonths.concat(['January','February','March','April']).includes(t.month)
                        ).filter(t => t.year === getYearForMonth(t.month));

                        // Re-filter: keep only transactions belonging to this academic year
                        const academicTrans = transactions.filter(t => {
                            if (t.student?._id !== s._id) return false;
                            return t.year === getYearForMonth(t.month) &&
                                reportMonths.some(m => m.name === t.month);
                        });

                        const rowMonths = reportMonths.reduce((acc, month) => {
                            const trans = academicTrans.find(t => t.month === month.name);
                            acc[month.name] = trans ? trans.amount : 0;
                            acc[month.name + '_date'] = trans ? (trans.paymentDate || trans.createdAt) : null;
                            return acc;
                        }, {});

                        const rowTotal = Object.values(
                            Object.fromEntries(Object.entries(rowMonths).filter(([k]) => !k.endsWith('_date')))
                        ).reduce((sum, amt) => sum + amt, 0);

                        return {
                            studentId: s._id,
                            studentName: s.name,
                            rollNo: s.rollNo,
                            mobile: s.mobile,
                            total: rowTotal,
                            ...rowMonths
                        };
                    });
                    setGridData(gridRows);
                    setFeeData([]);
                } else {
                    // Single Student or Specific Student View — academic year aware
                    const idToFind = isStudent ? (student?._id) : selectedStudentId;

                    const studentTrans = transactions.filter(t => {
                        const idMatch = isStudent ? (t.student?._id === idToFind) : (t.student?._id === selectedStudentId);
                        if (!idMatch) return false;
                        // Match month to correct calendar year within academic year
                        return t.year === getYearForMonth(t.month) &&
                            reportMonths.some(m => m.name === t.month);
                    });

                    const processedData = reportMonths.map(m => {
                        const trans = studentTrans.find(t => t.month === m.name);
                        return {
                            transactionId: trans ? trans._id : null,
                            studentId: isStudent ? student?._id : selectedStudentId,
                            studentName: isStudent ? (student?.name || 'Self') : allStudents.find(std => std._id === selectedStudentId)?.name,
                            mobile: isStudent ? (student?.mobile || '-') : allStudents.find(std => std._id === selectedStudentId)?.mobile,
                            month: m.name,
                            marathiMonth: m.marathi,
                            year: getYearForMonth(m.name),
                            amount: trans ? trans.amount : 0,
                            totalAmount: trans ? trans.amount : 0,
                            rawDate: trans ? (trans.paymentDate || trans.createdAt) : null,
                            date: trans ? new Date(trans.paymentDate || trans.createdAt).toLocaleDateString() : '-',
                            status: trans ? trans.status : 'Unpaid'
                        };
                    });
                    setFeeData(processedData);
                    setGridData([]);
                }
            } catch (error) {
                console.error('Error fetching yearly data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (allStudents.length > 0 || isStudent) {
            fetchData();
        }
    }, [selectedAcademicYear, isStudent, selectedStudentId, allStudents.length, student?._id]);

    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editFormData, setEditFormData] = useState({
        amount: '',
        status: 'Paid',
        paymentDate: ''
    });

    const handleDeleteTransaction = async (id) => {
        if (!id) return;
        if (window.confirm(t('deleteConfirm'))) {
            try {
                await API.delete(`/transactions/${id}`);
                setFeeData(prev => prev.map(item =>
                    item.transactionId === id
                        ? { ...item, transactionId: null, amount: 0, status: 'Unpaid', date: '-' }
                        : item
                ));
                alert(t('recordsDeleted'));
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert(t('failed'));
            }
        }
    };

    const handleEditClick = (item) => {
        if (!item.transactionId) return;
        setEditingTransaction(item);
        setEditFormData({
            amount: item.amount,
            status: item.status,
            paymentDate: item.rawDate ? new Date(item.rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingTransaction) return;

        try {
            const { data } = await API.put(`/transactions/${editingTransaction.transactionId}`, editFormData);

            setFeeData(prev => prev.map(item =>
                item.transactionId === editingTransaction.transactionId
                    ? {
                        ...item,
                        amount: data.amount,
                        status: data.status,
                        date: new Date(data.paymentDate || data.createdAt).toLocaleDateString(),
                        rawDate: data.paymentDate || data.createdAt
                    }
                    : item
            ));

            setEditingTransaction(null);
            alert(t('updateSuccess'));
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert(t('failed'));
        }
    };

    const filteredData = feeData.filter(item => {
        const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.rollNo && item.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesDate = isInDateRange(item.rawDate);
        return matchesSearch && matchesStatus && (item.status === 'Unpaid' || matchesDate);
    });

    const filteredGridData = gridData.filter(item => {
        const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.rollNo && item.rollNo.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const totalPaid = gridData.length > 0
        ? filteredGridData.reduce((sum, row) => {
            return sum + reportMonths.reduce((mSum, m) => mSum + (row[m.name] || 0), 0);
        }, 0)
        : filteredData.filter(f => f.status === 'Paid').reduce((sum, fee) => sum + fee.amount, 0);

    const totalPending = !isStudent && selectedStudentId === 'all'
        ? allStudents.reduce((sum, s) => sum + (s.pendingFee || 0), 0)
        : (isStudent ? student?.pendingFee : allStudents.find(s => s._id === selectedStudentId)?.pendingFee) || 0;

    const paidRecords = gridData.length > 0
        ? filteredGridData.reduce((count, row) => {
            return count + reportMonths.filter(m => row[m.name] > 0).length;
        }, 0)
        : filteredData.filter(fee => fee.status === 'Paid').length;

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const handleDownloadReport = () => {
        if (gridData.length > 0) {
            // Landscape Grid View Export
            const doc = new jsPDF({ orientation: 'landscape' });
            const pageWidth = doc.internal.pageSize.width;

            const drawHeader = (d) => {
                d.setFillColor(37, 99, 235);
                d.rect(0, 0, pageWidth, 18, 'F');
                d.setFontSize(18);
                d.setTextColor(255, 255, 255);
                d.setFont('helvetica', 'bold');
                d.text(tEn('schoolBranding'), pageWidth / 2, 8, { align: 'center' });
                d.setFontSize(10);
                d.setFont('helvetica', 'normal');
                const dateRangeLabel = fromDate || toDate ? ` | ${fromDate || '...'} to ${toDate || '...'}` : '';
                d.text(`${tEn('YearlyCollectionReport')} - ${selectedAcademicYear}${dateRangeLabel}`, pageWidth / 2, 14, { align: 'center' });
            };

            drawHeader(doc);

            // Use English headers for the PDF to avoid font issues
            const tableColumn = ['Name', ...reportMonths.map(m => m.name), 'Total'];
            const tableRows = filteredGridData.map(item => [
                item.studentName,
                ...reportMonths.map(m => {
                    const amt = item[m.name] || 0;
                    const dateVal = item[m.name + '_date'];
                    if (amt > 0 && isInDateRange(dateVal)) return `Rs. ${amt}`;
                    if (amt > 0 && !fromDate && !toDate) return `Rs. ${amt}`;
                    return '-';
                }),
                `Rs. ${item.total.toLocaleString()}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 25,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], fontSize: 8, halign: 'center' },
                styles: { fontSize: 7, cellPadding: 1 },
                margin: { top: 20 },
                didDrawPage: (data) => { if (data.pageNumber > 1) drawHeader(doc); }
            });

            doc.save(`Yearly_Report_${selectedAcademicYear}.pdf`);
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        const drawHeader = (d) => {
            d.setFillColor(37, 99, 235);
            d.rect(0, 0, pageWidth, 18, 'F');
            d.setFontSize(18);
            d.setTextColor(255, 255, 255);
            d.setFont('helvetica', 'bold');
            d.text(tEn('schoolBranding'), pageWidth / 2, 8, { align: 'center' });
            d.setFontSize(10);
            d.setFont('helvetica', 'normal');
            d.text(tEn('yearlyFeeReport'), pageWidth / 2, 14, { align: 'center' });
        };

        drawHeader(doc);

        // Meta Info
        doc.setTextColor(100);
        doc.setFontSize(10);
        doc.text(`${tEn('generatedAt')}: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`${tEn('academicYear')}: ${selectedAcademicYear}`, 14, 33);
        if (fromDate || toDate) {
            doc.text(`Date Range: ${fromDate || 'Start'} to ${toDate || 'Today'}`, 14, 38);
        }

        if (isStudent || selectedStudentId !== 'all') {
            const displayStudent = isStudent ? student : allStudents.find(s => s._id === selectedStudentId);
            doc.setFont('helvetica', 'bold');
            doc.text(`${tEn('fullName')}: ${displayStudent?.name || 'N/A'}`, 14, 38);
            doc.text(`${tEn('rollNumber')}: ${displayStudent?.rollNo || 'N/A'}`, 14, 43);
            doc.text(`${tEn('mobileNumber')}: ${displayStudent?.mobile || 'N/A'}`, 14, 48);
        } else {
            doc.text(`${tEn('reportType')}: ${tEn('comprehensiveSummary')}`, 14, 38);
        }

        // Summary Cards Section
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 55, 170, 18, 2, 2, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${t('totalYearlyPaid')}: Rs. ${totalPaid.toLocaleString()}`, 20, 67);
        doc.text(`${t('collected')}: ${paidRecords} ${t('months')}`, 120, 67);

        // Table Data
        const tableColumn = [];
        if (selectedStudentId === 'all' && !isStudent) tableColumn.push(tEn('fullName'));
        tableColumn.push(tEn('mobileNumber'), tEn('month') + '/' + tEn('year'), tEn('totalAmount'), tEn('paidAmount'), tEn('paymentDate'), tEn('status'));

        const tableRows = filteredData.map(item => {
            const row = [];
            if (selectedStudentId === 'all' && !isStudent) row.push(item.studentName);
            row.push(item.mobile || '-');
            row.push(`${item.month} ${item.year}`);
            row.push(item.amount > 0 ? `Rs. ${item.amount.toLocaleString()}` : '-');
            row.push(item.amount > 0 ? `Rs. ${item.amount.toLocaleString()}` : '-');
            row.push(item.date);
            row.push(item.status);
            return row;
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 75,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
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
        const finalY = doc.lastAutoTable.finalY + 5;

        // Calculate total pending
        let totalPending = 0;
        if (selectedStudentId === 'all' && !isStudent) {
            // Sum unique students pending fees
            const uniqueStudents = [...new Set(filteredData.map(item => item.studentId))];
            totalPending = uniqueStudents.reduce((sum, id) => {
                const std = allStudents.find(s => s._id === id);
                return sum + (std?.pendingFee || 0);
            }, 0);
        } else {
            totalPending = student?.pendingFee || 0;
        }

        doc.setDrawColor(37, 99, 235);
        doc.setFillColor(248, 250, 252);
        doc.rect(14, finalY, 170, 15, 'FD');

        doc.setFontSize(14);
        doc.setTextColor(22, 163, 74); // Success Green
        doc.text(`${tEn('grandTotalPaid')}: Rs. ${totalPaid.toLocaleString()}`, 20, finalY + 10);

        doc.setTextColor(220, 38, 38); // Error Red
        doc.text(`${tEn('totalPendingBalance')}: Rs. ${totalPending.toLocaleString()}`, 20, finalY + 20);

        const fileName = isStudent ? `Yearly_Report_${student?.rollNo}_${selectedAcademicYear}.pdf` : `Yearly_Collection_${selectedAcademicYear}.pdf`;
        doc.save(fileName);
    };

    // Generate PDF for a single student from the grid view
    const handleDownloadSingleStudentReport = (item) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const studentInfo = allStudents.find(s => s._id === item.studentId) || {};

        // ── Header ──
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, pageWidth, 22, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Fee Management System', pageWidth / 2, 9, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const dateRangeLabel = fromDate || toDate ? ` | ${fromDate || '...'} to ${toDate || '...'}` : ` | ${selectedAcademicYear}`;
        doc.text(`Student Fee Report${dateRangeLabel}`, pageWidth / 2, 16, { align: 'center' });

        // ── Student Info Box ──
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(14, 26, pageWidth - 28, 36, 3, 3, 'FD');

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Student Details', 18, 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Name   : ${item.studentName}`, 18, 41);
        doc.text(`Roll No: ${item.rollNo || 'N/A'}`, 18, 47);
        doc.text(`Mobile : ${item.mobile || 'N/A'}`, 18, 53);
        doc.text(`School : ${studentInfo.schoolName || 'N/A'}`, 110, 41);
        doc.text(`Class  : ${studentInfo.class || 'N/A'}`, 110, 47);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 110, 53);

        // ── Payment Table ──
        const tableColumns = ['Month', 'Amount (Rs.)', 'Payment Date', 'Status'];
        const tableRows = reportMonths.map(m => {
            const amt = item[m.name] || 0;
            const dateVal = item[m.name + '_date'];
            const inRange = !fromDate && !toDate ? true : isInDateRange(dateVal);
            const displayAmt = amt > 0 && inRange ? `Rs. ${amt.toLocaleString()}` : '-';
            const displayDate = dateVal && inRange ? new Date(dateVal).toLocaleDateString() : '-';
            const status = amt > 0 && inRange ? 'Paid' : 'Unpaid';
            return [m.name, displayAmt, displayDate, status];
        });

        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 68,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'center' },
            styles: { fontSize: 8.5, cellPadding: 2.5 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: {
                    halign: 'center',
                    fontStyle: 'bold'
                }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: (data) => {
                if (data.column.index === 3 && data.section === 'body') {
                    data.cell.styles.textColor = data.cell.raw === 'Paid' ? [22, 163, 74] : [220, 38, 38];
                }
            }
        });

        // ── Footer Summary ──
        const finalY = doc.lastAutoTable.finalY + 6;
        const studentTotalPaid = reportMonths.reduce((sum, m) => {
            const amt = item[m.name] || 0;
            const dateVal = item[m.name + '_date'];
            const inRange = !fromDate && !toDate ? true : isInDateRange(dateVal);
            return sum + (inRange ? amt : 0);
        }, 0);
        const pendingBalance = studentInfo.pendingFee || 0;

        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(22, 163, 74);
        doc.roundedRect(14, finalY, (pageWidth - 28) / 2 - 4, 14, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74);
        doc.text(`Total Paid: Rs. ${studentTotalPaid.toLocaleString()}`, 18, finalY + 9);

        doc.setFillColor(254, 242, 242);
        doc.setDrawColor(220, 38, 38);
        doc.roundedRect(14 + (pageWidth - 28) / 2 + 4, finalY, (pageWidth - 28) / 2 - 4, 14, 2, 2, 'FD');
        doc.setTextColor(220, 38, 38);
        doc.text(`Pending Balance: Rs. ${pendingBalance.toLocaleString()}`, 18 + (pageWidth - 28) / 2 + 4, finalY + 9);

        doc.save(`Report_${item.studentName.replace(/\s+/g, '_')}_${selectedAcademicYear}.pdf`);
    };

    if (loading && feeData.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-main)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const backPath = isStudent ? '/student/dashboard' : '/admin/dashboard';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-main)' }}>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-brand">{t('appName')}</div>
                        <div className="navbar-actions">
                            <div className="user-info">
                                <div className="user-avatar">{isStudent ? student?.name?.charAt(0) || 'S' : 'A'}</div>
                                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                    {isStudent ? (student?.name || t('student')) : t('admin')}
                                </span>
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
                    onClick={() => navigate(backPath)}
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
                            <h2 style={{ marginBottom: '0.5rem' }}>{t('yearlyReport')}</h2>
                            {isStudent && student && (
                                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>
                                    {student.name} - {student.rollNo}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            {!isStudent && (
                                <div style={{ minWidth: '200px' }}>
                                    <select
                                        className="form-select"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        style={{ width: '100%' }}
                                    >
                                        <option value="all">{t('allStudents')}</option>
                                        {allStudents.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.rollNo} - {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Academic Year Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={20} color="var(--color-text-secondary)" />
                                <select
                                    className="form-select"
                                    value={selectedAcademicYear}
                                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                                    style={{ minWidth: '110px' }}
                                >
                                    {academicYears.map(ay => (
                                        <option key={ay} value={ay}>{ay}</option>
                                    ))}
                                </select>
                            </div>

                            {/* From - To Date Range */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        style={{ minWidth: '140px', fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        style={{ minWidth: '140px', fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                                    />
                                </div>
                                {(fromDate || toDate) && (
                                    <button
                                        className="btn btn-sm btn-outline"
                                        onClick={() => { setFromDate(''); setToDate(''); }}
                                        style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)', fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                                        title="Clear date filter"
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>

                            <button className="btn btn-primary" onClick={handleDownloadReport}>
                                <Download size={18} />
                                {t('exportData')}
                            </button>
                        </div>
                    </div>

                    {/* Filters for All Students View */}
                    {!isStudent && selectedStudentId === 'all' && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={t('search')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                            <div style={{ minWidth: '150px' }}>
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">{t('allStatus')}</option>
                                    <option value="paid">{t('paid')}</option>
                                    <option value="unpaid">{t('pending')}</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-2" style={{ margin: '2rem 0' }}>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: 'none' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-secondary-dark)', marginBottom: '0.5rem', fontWeight: '600' }}>{t('paidAmount')}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-secondary-dark)' }}>₹{totalPaid.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary-dark)', opacity: 0.8 }}>{paidRecords} {t('monthsCollected')}</div>
                        </div>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #fee2e2, #fecaca)', border: 'none' }}>
                            <div style={{ fontSize: '0.9rem', color: '#b91c1c', marginBottom: '0.5rem', fontWeight: '600' }}>{t('pendingAmount')}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b91c1c' }}>₹{totalPending.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', color: '#b91c1c', opacity: 0.8 }}>{t('totalBalance')}</div>
                        </div>
                    </div>

                    {/* Fee Table */}
                    <div className="table-wrapper">
                        {gridData.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('name')}</th>
                                        {reportMonths.map(m => (
                                            <th key={m.name} style={{ textAlign: 'center' }}>
                                                {language === 'mr' ? m.marathi : m.name}
                                            </th>
                                        ))}
                                        <th style={{ textAlign: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                                            {t('totalAmount')}
                                        </th>
                                        <th style={{ textAlign: 'center', background: '#f0fdf4', color: '#166534' }}>
                                            Report
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGridData.length > 0 ? (
                                        filteredGridData.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: 600 }}>{item.studentName}</td>
                                                {reportMonths.map(m => (
                                                    <td key={m.name} style={{ textAlign: 'center' }}>
                                                        {item[m.name] > 0 ? (
                                                            <div style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>₹{item[m.name]}</div>
                                                        ) : (
                                                            <div style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>-</div>
                                                        )}
                                                    </td>
                                                ))}
                                                <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)', background: '#f8fafc' }}>
                                                    ₹{item.total.toLocaleString()}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleDownloadSingleStudentReport(item)}
                                                        title={`Download report for ${item.studentName}`}
                                                        style={{
                                                            color: '#166534',
                                                            borderColor: '#bbf7d0',
                                                            padding: '0.3rem 0.6rem',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.3rem',
                                                            fontSize: '0.78rem'
                                                        }}
                                                    >
                                                        <Download size={13} />
                                                        PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={reportMonths.length + 1} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                                {t('noResults')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        {(selectedStudentId === 'all' && !isStudent) && <th>{t('name')}</th>}
                                        <th>{t('monthlyCollection')}</th>
                                        <th>{t('totalAmount')}</th>
                                        <th>{t('paidAmount')}</th>
                                        <th>{t('paymentDate')}</th>
                                        <th>{t('status')}</th>
                                        {!isStudent && <th style={{ textAlign: 'right' }}>{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => (
                                            <tr key={index}>
                                                {(selectedStudentId === 'all' && !isStudent) && (
                                                    <td style={{ fontWeight: 600 }}>{item.studentName}</td>
                                                )}
                                                <td>{language === 'mr' ? item.marathiMonth : item.month} {item.year}</td>
                                                <td style={{ fontWeight: 600 }}>
                                                    {item.amount > 0 ? `₹${item.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td style={{ fontWeight: 700 }}>
                                                    {item.amount > 0 ? `₹${item.amount.toLocaleString()}` : '-'}
                                                </td>
                                                <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                                    {item.date}
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'Paid' ? 'success' : 'danger'}`}>
                                                        {item.status === 'Paid' ? t('paid') : t('pending')}
                                                    </span>
                                                </td>
                                                {!isStudent && (
                                                    <td style={{ textAlign: 'right' }}>
                                                        {item.transactionId ? (
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                                <button
                                                                    className="btn btn-sm btn-outline"
                                                                    onClick={() => handleEditClick(item)}
                                                                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-light)', padding: '0.4rem' }}
                                                                    title={t('edit')}
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline"
                                                                    onClick={() => handleDeleteTransaction(item.transactionId)}
                                                                    style={{ color: 'var(--color-error)', borderColor: 'var(--color-error-light)', padding: '0.4rem' }}
                                                                    title={t('delete')}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => navigate('/admin/collect-fee', {
                                                                    state: {
                                                                        studentId: item.studentId,
                                                                        prefillMonth: item.month,
                                                                        prefillYear: item.year
                                                                    }
                                                                })}
                                                                style={{ padding: '0.4rem' }}
                                                                title={t('collectFee')}
                                                            >
                                                                <DollarSign size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                                {t('noResults')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Total Summary */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--color-success)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '1rem', color: 'var(--color-secondary-dark)', marginBottom: '0.25rem' }}>
                                {t('totalCollected')} ({selectedAcademicYear})
                                {(fromDate || toDate) && (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                        ({fromDate || '...'} → {toDate || '...'})
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                {paidRecords} {t('paid')}
                                {(!isStudent && selectedStudentId === 'all') ? '' : `, ${12 - paidRecords} ${t('pending')}`}
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-secondary-dark)' }}>
                            ₹{totalPaid.toLocaleString()}
                        </div>
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
                    zIndex: 2000
                }}>
                    <div className="card" style={{ width: '400px', padding: '2rem', background: 'white' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{t('edit')}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                            {t('edit')} {t('paidAmount')} {t('for')} <strong>{editingTransaction.studentName || t('student')}</strong> ({language === 'mr' ? editingTransaction.marathiMonth : editingTransaction.month} {editingTransaction.year})
                        </p>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="form-group">
                                <label className="form-label">{t('amount')} (₹)</label>
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
                                    <option value="Unpaid">{t('unpaid')}</option>
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

export default YearlyReport;
