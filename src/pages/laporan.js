import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Laporan.module.css';

export default function LaporanPage() {
  const { transactions, products, members } = useAppContext();
  const [filter, setFilter] = useState({ startDate: '', endDate: '', memberStatus: 'all' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        const startDate = filter.startDate ? new Date(filter.startDate) : null;
        const endDate = filter.endDate ? new Date(filter.endDate) : null;
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        return true;
      })
      .filter(t => {
        if (filter.memberStatus === 'all') return true;
        if (filter.memberStatus === 'member') return !!t.memberId;
        if (filter.memberStatus === 'non-member') return !t.memberId;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter]);
  
  const totalPendapatan = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);

  const rekapHarian = useMemo(() => {
    const rekap = {};
    filteredTransactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('id-ID');
        if(!rekap[date]) rekap[date] = 0;
        rekap[date] += t.total;
    });
    return rekap;
  }, [filteredTransactions]);

  const rekapBulanan = useMemo(() => {
    const rekap = {};
    filteredTransactions.forEach(t => {
        const month = new Date(t.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long'});
        if(!rekap[month]) rekap[month] = 0;
        rekap[month] += t.total;
    });
    return rekap;
  }, [filteredTransactions]);


  return (
    <div>
      <h1>Laporan Keuangan & Transaksi</h1>

      <div className={`${styles.rekapContainer} card`}>
        <div className={styles.rekapItem}>
            <h3>Total Pendapatan (Filtered)</h3>
            <p>Rp {totalPendapatan.toLocaleString('id-ID')}</p>
        </div>
        <div className={styles.rekapItem}>
            <h3>Rekap Harian</h3>
            <ul>{Object.entries(rekapHarian).map(([tgl, total]) => <li key={tgl}>{tgl}: Rp {total.toLocaleString('id-ID')}</li>)}</ul>
        </div>
         <div className={styles.rekapItem}>
            <h3>Rekap Bulanan</h3>
            <ul>{Object.entries(rekapBulanan).map(([bln, total]) => <li key={bln}>{bln}: Rp {total.toLocaleString('id-ID')}</li>)}</ul>
        </div>
      </div>
      
      <div className={`${styles.filterContainer} card`}>
        <h3>Filter Laporan</h3>
        <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
        <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
        <select name="memberStatus" value={filter.memberStatus} onChange={handleFilterChange}>
          <option value="all">Semua</option>
          <option value="member">Member</option>
          <option value="non-member">Non-Member</option>
        </select>
      </div>

      <div className="card">
        <h2>Detail Transaksi</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Member</th>
              <th>Diskon</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => {
              const member = members.find(m => m.id === t.memberId);
              return (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{new Date(t.date).toLocaleString('id-ID')}</td>
                  <td>
                    <ul>
                      {t.items.map(item => <li key={item.cartId}>{item.name} ({item.size}) x {item.quantity}</li>)}
                    </ul>
                  </td>
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
  );
}