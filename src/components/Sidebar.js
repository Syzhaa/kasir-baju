// src/components/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import styles from '../styles/Sidebar.module.css'; // Path CSS sudah diubah

const Sidebar = () => {
  const router = useRouter(); // Gunakan hook

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Link href="/">Kasir Toko Baju</Link>
      </div>
      <nav className={styles.navLinks}>
        {/* Cek jika path saat ini cocok dengan href, lalu tambahkan class 'active' */}
        <Link href="/" className={router.pathname === "/" ? styles.active : ""}>
          Katalog
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