// src/pages/laporan.js
import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Papa from 'papaparse'; // Import PapaParse untuk CSV
import styles from '../styles/Laporan.module.css';

// Import komponen chart
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Daftarkan modul chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function LaporanPage() {
  const { transactions, products, members } = useAppContext();
  const [filter, setFilter] = useState({ startDate: '', endDate: '', memberStatus: 'all' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Logika filter tidak berubah, tapi sekarang menjadi dasar untuk semua data di halaman ini
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (!filter.startDate && !filter.endDate) return true;
        const date = new Date(t.date);
        const startDate = filter.startDate ? new Date(filter.startDate) : null;
        const endDate = filter.endDate ? new Date(filter.endDate) : null;
        if (startDate && date < startDate) return false;
        if (endDate) {
          endDate.setHours(23, 59, 59, 999); // Set ke akhir hari
          if (date > endDate) return false;
        }
        return true;
      })
      .filter(t => {
        if (filter.memberStatus === 'all') return true;
        if (filter.memberStatus === 'member') return !!t.memberId;
        if (filter.memberStatus === 'non-member') return !t.memberId;
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions, filter]);
  
  // --- FUNGSI BARU UNTUK UNDUH CSV SESUAI FILTER ---
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diekspor sesuai filter yang dipilih.");
      return;
    }

    const dataToExport = filteredTransactions.map(t => {
        const member = members.find(m => m.id === t.memberId);
        return {
            'ID Transaksi': t.id,
            'Tanggal': new Date(t.date).toLocaleString('id-ID'),
            'Produk': t.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', '),
            'Status Member': member ? 'Member' : 'Non-Member',
            'Nama Member': member ? member.name : '-',
            'Diskon (Rp)': t.discount,
            'Total (Rp)': t.total,
        }
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- PERSIAPAN DATA UNTUK CHART ---
  const chartData = useMemo(() => {
    const dailyRevenue = {};
    filteredTransactions.forEach(t => {
        const date = new Date(t.date).toISOString().slice(0, 10);
        dailyRevenue[date] = (dailyRevenue[date] || 0) + t.total;
    });

    const labels = Object.keys(dailyRevenue);
    const data = Object.values(dailyRevenue);

    return {
      labels,
      datasets: [{
        label: 'Pendapatan Harian (Rp)',
        data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
      }],
    };
  }, [filteredTransactions]);


  return (
    <div>
      <h1>Laporan Keuangan & Transaksi</h1>

      <div className={`${styles.filterContainer} card`}>
        <h3>Filter Laporan</h3>
        <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
        <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
        <select name="memberStatus" value={filter.memberStatus} onChange={handleFilterChange}>
          <option value="all">Semua Member</option>
          <option value="member">Member</option>
          <option value="non-member">Non-Member</option>
        </select>
        {/* Tombol Unduh CSV dipindah ke sini */}
        <button onClick={handleExportCSV}>Unduh CSV (Hasil Filter)</button>
      </div>

      {/* --- KONTainer UNTUK CHART --- */}
      <div className="card" style={{ marginBottom: '20px' }}>
         <h3>Grafik Penjualan (Sesuai Filter)</h3>
         {filteredTransactions.length > 0 ? (
            <Line options={{ responsive: true }} data={chartData} />
         ) : (
            <p>Tidak ada data untuk ditampilkan pada grafik.</p>
         )}
      </div>

      <div className="card">
        <h2>Detail Transaksi</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Tanggal</th><th>Produk</th><th>Member</th><th>Diskon</th><th>Total</th></tr></thead>
            <tbody>
              {filteredTransactions.map(t => {
                const member = members.find(m => m.id === t.memberId);
                return (
                  <tr key={t.id}>
                    <td>{t.id.slice(-6)}</td>
                    <td>{new Date(t.date).toLocaleString('id-ID')}</td>
                    <td><ul>{t.items.map(item => <li key={item.cartId}>{item.name} ({item.size}) x {item.quantity}</li>)}</ul></td>
                    <td>{member ? member.name : 'Non-Member'}</td>
                    <td>Rp {t.discount.toLocaleString('id-ID')}</td>
                    <td>Rp {t.total.toLocaleString('id-ID')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}