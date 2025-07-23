import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import Papa from 'papaparse';
import styles from '../styles/Laporan.module.css';
import { useReactToPrint } from 'react-to-print';
import Receipt from '../components/Receipt';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const ITEMS_PER_PAGE = 10;

export default function LaporanPage() {
  const { transactions, members } = useAppContext();
  const [filterType, setFilterType] = useState('harian');
  const [dailyFilter, setDailyFilter] = useState({ startDate: '', endDate: '' });
  const [monthlyFilter, setMonthlyFilter] = useState(new Date().toISOString().slice(0, 7));
  const [yearlyFilter, setYearlyFilter] = useState(new Date().getFullYear());
  const [paymentFilter, setPaymentFilter] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionToPrint, setTransactionToPrint] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef();

  // Callback untuk handle setelah print selesai
  const handleAfterPrint = useCallback(() => {
    setIsPrinting(false);
    setTransactionToPrint(null);
  }, []);

  // Callback untuk handle sebelum print
  const handleBeforePrint = useCallback(() => {
    setIsPrinting(true);
    return Promise.resolve();
  }, []);

  // Hook cetak dengan konfigurasi yang benar untuk versi terbaru react-to-print
  const handlePrint = useReactToPrint({
    contentRef: receiptRef, // Menggunakan contentRef alih-alih content
    onBeforeGetContent: handleBeforePrint,
    onAfterPrint: handleAfterPrint,
    documentTitle: `Struk-${transactionToPrint?.id || 'receipt'}`,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onPrintError: (errorLocation, error) => {
      console.error('Print Error:', errorLocation, error);
      setIsPrinting(false);
      alert('Terjadi kesalahan saat mencetak. Silakan coba lagi.');
    }
  });

  // Fungsi untuk membuka modal pratinjau dengan validasi
  const handleReprint = useCallback((transaction) => {
    if (!transaction) {
      alert('Data transaksi tidak valid');
      return;
    }
    setTransactionToPrint(transaction);
  }, []);

  // Fungsi untuk menutup modal
  const handleCloseModal = useCallback(() => {
    if (!isPrinting) {
      setTransactionToPrint(null);
    }
  }, [isPrinting]);

  // Fungsi untuk trigger print dengan validasi
  const triggerPrint = useCallback(() => {
    if (!receiptRef.current) {
      alert('Komponen struk belum siap. Silakan coba lagi.');
      return;
    }
    
    if (!transactionToPrint) {
      alert('Tidak ada data transaksi untuk dicetak.');
      return;
    }

    try {
      handlePrint();
    } catch (error) {
      console.error('Error triggering print:', error);
      alert('Terjadi kesalahan saat memulai proses cetak.');
      setIsPrinting(false);
    }
  }, [handlePrint, transactionToPrint]);

  const filteredTransactions = useMemo(() => {
    let startDate, endDate;
    if (filterType === 'harian') {
      startDate = dailyFilter.startDate ? new Date(dailyFilter.startDate) : null;
      endDate = dailyFilter.endDate ? new Date(dailyFilter.endDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);
    } else if (filterType === 'bulanan') {
      const [year, month] = monthlyFilter.split('-').map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else if (filterType === 'tahunan') {
      startDate = new Date(yearlyFilter, 0, 1);
      endDate = new Date(yearlyFilter, 11, 31, 23, 59, 59, 999);
    }
    return transactions.filter(t => {
      // Filter berdasarkan tanggal
      if (startDate || endDate) {
        const date = new Date(t.date);
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
      }
      
      // Filter berdasarkan metode pembayaran
      if (paymentFilter !== 'semua') {
        const paymentMethod = t.paymentMethod || 'Tunai';
        if (paymentFilter === 'tunai' && paymentMethod !== 'Tunai') return false;
        if (paymentFilter === 'nontunai' && paymentMethod === 'Tunai') return false;
      }
      
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, dailyFilter, monthlyFilter, yearlyFilter, paymentFilter]);
  
  const paginatedTransactions = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, dailyFilter, monthlyFilter, yearlyFilter, paymentFilter]);

  const yearlySummaryData = useMemo(() => {
    if (filterType !== 'tahunan') return [];
    const monthlySummary = Array(12).fill(0).map(() => ({ transactions: 0, itemsSold: 0, total: 0 }));
    filteredTransactions.forEach(t => {
      const monthIndex = new Date(t.date).getMonth();
      monthlySummary[monthIndex].transactions += 1;
      monthlySummary[monthIndex].itemsSold += t.items.reduce((sum, item) => sum + item.quantity, 0);
      monthlySummary[monthIndex].total += t.total;
    });
    return monthlySummary;
  }, [filteredTransactions, filterType]);

  const chartData = useMemo(() => {
    let labels, data;
    if (filterType === 'tahunan') {
      labels = monthNames;
      data = yearlySummaryData.map(month => month.total);
    } else {
      const dailyRevenue = {};
      const sortedTransactions = [...filteredTransactions].sort((a,b) => new Date(a.date) - new Date(b.date));
      sortedTransactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'});
        dailyRevenue[date] = (dailyRevenue[date] || 0) + t.total;
      });
      labels = Object.keys(dailyRevenue);
      data = Object.values(dailyRevenue);
    }
    return {
      labels,
      datasets: [{
        label: `Pendapatan (${filterType === 'tahunan' ? 'Bulanan' : 'Harian'})`, 
        data,
        borderColor: 'rgb(53, 162, 235)', 
        backgroundColor: 'rgba(53, 162, 235, 0.5)', 
        fill: true,
      }],
    };
  }, [filteredTransactions, filterType, yearlySummaryData]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diekspor."); 
      return;
    }
    let dataToExport, filename;
    if (filterType === 'tahunan') {
      dataToExport = yearlySummaryData.map((month, index) => ({ 
        'Bulan': monthNames[index], 
        'Jumlah Transaksi': month.transactions, 
        'Item Terjual': month.itemsSold, 
        'Total Pendapatan (Rp)': month.total 
      }));
      filename = `laporan_tahunan_${yearlyFilter}.csv`;
    } else {
      dataToExport = filteredTransactions.map(t => {
        const member = members.find(m => m.id === t.memberId);
        return { 
          'ID Transaksi': t.id, 
          'Tanggal': new Date(t.date).toLocaleString('id-ID'), 
          'Produk': t.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', '), 
          'Status Member': member ? 'Member' : 'Non-Member', 
          'Nama Member': member ? member.name : '-', 
          'Metode Pembayaran': t.paymentMethod || 'Tunai', 
          'Diskon (Rp)': t.discount, 
          'Total (Rp)': t.total 
        };
      });
      filename = `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    }
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = filename;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className={`${styles.filterContainer} card`}>
        <h3>Filter Laporan</h3>
        <div className={styles.filterGroup}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
          {filterType === 'harian' && (
            <>
              <input 
                type="date" 
                value={dailyFilter.startDate} 
                onChange={(e) => setDailyFilter(prev => ({ ...prev, startDate: e.target.value }))} 
              />
              <span>s/d</span>
              <input 
                type="date" 
                value={dailyFilter.endDate} 
                onChange={(e) => setDailyFilter(prev => ({ ...prev, endDate: e.target.value }))} 
              />
            </>
          )}
          {filterType === 'bulanan' && (
            <input 
              type="month" 
              value={monthlyFilter} 
              onChange={(e) => setMonthlyFilter(e.target.value)} 
            />
          )}
          {filterType === 'tahunan' && (
            <input 
              type="number" 
              value={yearlyFilter} 
              placeholder="Tahun" 
              onChange={(e) => setYearlyFilter(e.target.value)} 
              style={{ width: '100px' }} 
            />
          )}
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="semua">Semua Pembayaran</option>
            <option value="tunai">Tunai</option>
            <option value="nontunai">Non-Tunai</option>
          </select>
          <button onClick={handleExportCSV}>Unduh CSV</button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Grafik Penjualan</h3>
        {filteredTransactions.length > 0 ? (
          <Line 
            options={{ 
              responsive: true, 
              scales: { 
                x: { 
                  ticks: { 
                    maxRotation: 45, 
                    minRotation: 45 
                  }
                }
              }
            }} 
            data={chartData} 
          />
        ) : (
          <p>Tidak ada data untuk ditampilkan.</p>
        )}
      </div>
      
      <div className="card">
        <h2>{filterType === 'tahunan' ? `Rekap Tahunan ${yearlyFilter}` : 'Detail Transaksi'}</h2>
        <div className={styles.tableContainer}>
          {filterType === 'tahunan' ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Jml. Transaksi</th>
                  <th>Item Terjual</th>
                  <th>Total Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {yearlySummaryData.map((month, index) => (
                  <tr key={index}>
                    <td>{monthNames[index]}</td>
                    <td>{month.transactions.toLocaleString('id-ID')}</td>
                    <td>{month.itemsSold.toLocaleString('id-ID')}</td>
                    <td>Rp {month.total.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanggal</th>
                    <th>Produk</th>
                    <th>Member</th>
                    <th>Pembayaran</th>
                    <th>Total</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map(t => {
                    const member = members.find(m => m.id === t.memberId);
                    return (
                      <tr key={t.id}>
                        <td>{t.id.slice(-6)}</td>
                        <td>{new Date(t.date).toLocaleString('id-ID')}</td>
                        <td>
                          <ul>
                            {t.items.map(item => (
                              <li key={item.cartId}>
                                {item.name} ({item.size}) x{item.quantity}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>{member ? member.name : 'Non-Member'}</td>
                        <td>{t.paymentMethod || 'Tunai'}</td>
                        <td>Rp {t.total.toLocaleString('id-ID')}</td>
                        <td>
                          <button 
                            onClick={() => handleReprint(t)} 
                            className='button-secondary'
                            disabled={isPrinting}
                          >
                            {isPrinting ? 'Mencetak...' : 'Cetak'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </button>
                  <span>Halaman {currentPage} dari {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal untuk pratinjau cetak */}
      {transactionToPrint && (
        <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <div className={`${styles.modalContent} card`}>
            <h3>Pratinjau Struk</h3>
            <div className={styles.receiptPreview}>
              <Receipt ref={receiptRef} transaction={transactionToPrint} />
            </div>
            <div className={styles.modalActions}>
              <button 
                onClick={triggerPrint}
                disabled={isPrinting}
                className={isPrinting ? 'button-disabled' : ''}
              >
                {isPrinting ? 'Mencetak...' : 'Cetak Struk Ini'}
              </button>
              <button 
                onClick={handleCloseModal} 
                className="button-secondary"
                disabled={isPrinting}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}