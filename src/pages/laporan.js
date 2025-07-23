import { useState, useMemo, useRef, useEffect } from 'react';
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

  const [currentPage, setCurrentPage] = useState(1);
  const [transactionToPrint, setTransactionToPrint] = useState(null);
  const receiptRef = useRef();

  // Fixed: Changed from 'content' to 'contentRef'
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    onAfterPrint: () => setTransactionToPrint(null),
  });
  
  useEffect(() => {
    if (transactionToPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [transactionToPrint, handlePrint]); // Added handlePrint to dependencies

  const handleReprint = (transaction) => {
    setTransactionToPrint(transaction);
  };

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
      if (!startDate && !endDate) return true;
      const date = new Date(t.date);
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, dailyFilter, monthlyFilter, yearlyFilter]);
  
  const paginatedTransactions = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, dailyFilter, monthlyFilter, yearlyFilter]);

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
        label: `Pendapatan (${filterType === 'tahunan' ? 'Bulanan' : 'Harian'})`, data,
        borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)', fill: true,
      }],
    };
  }, [filteredTransactions, filterType, yearlySummaryData]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diekspor."); return;
    }
    let dataToExport, filename;
    if (filterType === 'tahunan') {
      dataToExport = yearlySummaryData.map((month, index) => ({ 'Bulan': monthNames[index], 'Jumlah Transaksi': month.transactions, 'Item Terjual': month.itemsSold, 'Total Pendapatan (Rp)': month.total }));
      filename = `laporan_tahunan_${yearlyFilter}.csv`;
    } else {
      dataToExport = filteredTransactions.map(t => {
        const member = members.find(m => m.id === t.memberId);
        return { 'ID Transaksi': t.id, 'Tanggal': new Date(t.date).toLocaleString('id-ID'), 'Produk': t.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', '), 'Status Member': member ? 'Member' : 'Non-Member', 'Nama Member': member ? member.name : '-', 'Diskon (Rp)': t.discount, 'Total (Rp)': t.total };
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
              <input type="date" value={dailyFilter.startDate} onChange={(e) => setDailyFilter(prev => ({ ...prev, startDate: e.target.value }))} />
              <span>s/d</span>
              <input type="date" value={dailyFilter.endDate} onChange={(e) => setDailyFilter(prev => ({ ...prev, endDate: e.target.value }))} />
            </>
          )}
          {filterType === 'bulanan' && (<input type="month" value={monthlyFilter} onChange={(e) => setMonthlyFilter(e.target.value)} />)}
          {filterType === 'tahunan' && (<input type="number" value={yearlyFilter} placeholder="Tahun" onChange={(e) => setYearlyFilter(e.target.value)} style={{ width: '100px' }} />)}
          <button onClick={handleExportCSV}>Unduh CSV</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Grafik Penjualan</h3>
        {filteredTransactions.length > 0 ? <Line options={{ responsive: true, scales: { x: { ticks: { maxRotation: 45, minRotation: 45 }}}}} data={chartData} /> : <p>Tidak ada data untuk ditampilkan pada grafik.</p>}
      </div>

      <div className="card">
        <h2>{filterType === 'tahunan' ? `Rekap Tahunan ${yearlyFilter}` : 'Detail Transaksi'}</h2>
        <div className={styles.tableContainer}>
          {filterType === 'tahunan' ? (
            <table className={styles.table}>
              <thead><tr><th>Bulan</th><th>Jumlah Transaksi</th><th>Item Terjual</th><th>Total Pendapatan</th></tr></thead>
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
                <thead><tr><th>ID</th><th>Tanggal</th><th>Produk</th><th>Member</th><th>Total</th><th>Aksi</th></tr></thead>
                <tbody>
                  {paginatedTransactions.map(t => {
                    const member = members.find(m => m.id === t.memberId);
                    return (
                      <tr key={t.id}>
                        <td>{t.id.slice(-6)}</td>
                        <td>{new Date(t.date).toLocaleString('id-ID')}</td>
                        <td><ul>{t.items.map(item => <li key={item.cartId}>{item.name} ({item.size}) x{item.quantity}</li>)}</ul></td>
                        <td>{member ? member.name : 'Non-Member'}</td>
                        <td>Rp {t.total.toLocaleString('id-ID')}</td>
                        <td><button onClick={() => handleReprint(t)} className='button-secondary'>Cetak</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Sebelumnya</button>
                  <span>Halaman {currentPage} dari {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Berikutnya</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {transactionToPrint && (
        <div className={styles.printSource}>
          <Receipt ref={receiptRef} transaction={transactionToPrint} />
        </div>
      )}
    </div>
  );
}