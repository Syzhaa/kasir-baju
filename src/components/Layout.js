import { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import TopBar from './TopBar'; // Pastikan 'B' besar di sini
import styles from '../styles/Layout.module.css';

const pageTitles = {
  '/': 'Dashboard',
  '/produk': 'Manajemen Produk',
  '/transaksi': 'Kasir / Transaksi Baru',
  '/member': 'Manajemen Member',
  '/laporan': 'Laporan Penjualan',
  '/pengaturan': 'Pengaturan & Data',
  '/profil': 'Edit Profil'
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const title = pageTitles[router.pathname] || 'Aplikasi Kasir';

  return (
    <div className={styles.layoutContainer} suppressHydrationWarning>
      <button className={styles.hamburger} onClick={() => setSidebarOpen(!isSidebarOpen)}>&#9776;</button>
      
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ''}`}>
        <Sidebar />
      </div>

      {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}
      
      <div className={styles.contentWrapper}>
        <TopBar pageTitle={title} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;