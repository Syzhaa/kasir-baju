import { useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Pengaturan.module.css';

export default function PengaturanPage() {
  const { resetData, getBackupData, restoreData } = useAppContext();
  const fileInputRef = useRef(null);

  const handleDownloadBackup = () => {
    const jsonData = getBackupData();
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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      restoreData(fileContent);
    };
    reader.onerror = () => {
        alert('Gagal membaca file.');
    };
    reader.readAsText(file);
    event.target.value = null;
  };
  
  return (
    <div>
      <div className="card">
        <h2>Manajemen Data</h2>
        <div className={styles.buttonGroup}>
          <button onClick={handleDownloadBackup}>
            Download Backup (JSON)
          </button>
          
          <button onClick={handleUploadClick} className="button-secondary">
            Restore dari Backup (JSON)
          </button>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }} 
          />
          
          <button onClick={resetData} className="button-danger">
            Reset Semua Data
          </button>
        </div>
        
        {/* --- PERBAIKAN DI BAGIAN INI --- */}
        <p className={styles.warning}>
          <strong>Perhatian:</strong>
          <br/>- Fitur {'"Restore"'} akan **MENGGANTI TOTAL** semua data saat ini.
          <br/>- Fitur {'"Reset"'} akan **MENGHAPUS TOTAL** semua data.
          <br/>Selalu backup data Anda terlebih dahulu jika ragu.
        </p>
        {/* ------------------------------- */}

      </div>
    </div>
  );
}