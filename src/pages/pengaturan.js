import { useAppContext } from '../context/AppContext';
import Papa from 'papaparse';
import styles from '../styles/Pengaturan.module.css';

export default function PengaturanPage() {
  const { resetData, getBackupData, transactions, products, members } = useAppContext();

  const handleDownloadBackup = () => {
    constjsonData = getBackupData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleExportCSV = () => {
    const dataToExport = transactions.map(t => {
        const member = members.find(m => m.id === t.memberId);
        return {
            'ID Transaksi': t.id,
            'Tanggal': new Date(t.date).toLocaleString('id-ID'),
            'Produk': t.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(', '),
            'Status Member': member ? 'Member' : 'Non-Member',
            'Nama Member': member ? member.name : '-',
            'Diskon': t.discount,
            'Total': t.total,
        }
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_transaksi_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1>Pengaturan & Data</h1>
      <div className="card">
        <h2>Manajemen Data</h2>
        <div className={styles.buttonGroup}>
          <button onClick={handleDownloadBackup}>
            Download Backup (JSON)
          </button>
          <button onClick={handleExportCSV} className="button-secondary">
            Ekspor Transaksi (CSV)
          </button>
          <button onClick={resetData} className="button-danger">
            Reset Semua Data
          </button>
        </div>
        <p className={styles.warning}>
          <strong>Perhatian:</strong> "Reset Semua Data" akan menghapus seluruh produk, member, dan riwayat transaksi secara permanen dari browser ini.
        </p>
      </div>
    </div>
  );
}