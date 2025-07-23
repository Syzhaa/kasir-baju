// src/components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Sidebar.module.css';

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link href="/">Kasir Toko Baju</Link>
      </div>
      <nav className={styles.navLinks}>
        {/* Link Katalog diubah menjadi Dashboard */}
        <Link href="/" className={router.pathname === "/" ? styles.active : ""}>
          Dashboard 
        </Link>
        <Link href="/produk" className={router.pathname === "/produk" ? styles.active : ""}>
          Produk
        </Link>
        <Link href="/transaksi" className={router.pathname === "/transaksi" ? styles.active : ""}>
          Transaksi
        </Link>
        <Link href="/member" className={router.pathname === "/member" ? styles.active : ""}>
          Member
        </Link>
        <Link href="/laporan" className={router.pathname === "/laporan" ? styles.active : ""}>
          Laporan
        </Link>
        <Link href="/pengaturan" className={router.pathname === "/pengaturan" ? styles.active : ""}>
          Pengaturan
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;