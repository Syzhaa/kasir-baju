// src/components/Layout.js
import { useState } from 'react';
import Sidebar from './Sidebar'; // Nama komponen sudah diubah
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      {/* Tombol hamburger untuk mobile */}
      <button 
        className={styles.hamburger} 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        &#9776; {/* Ini adalah karakter untuk ikon hamburger */}
      </button>

      {/* Gunakan class 'open' untuk menampilkan sidebar di mobile */}
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ''}`}>
        <Sidebar />
      </div>

      {/* Overlay untuk menutup sidebar saat diklik di luar area sidebar (mobile) */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}
      
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default Layout;