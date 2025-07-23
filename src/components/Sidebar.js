import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Sidebar.module.css';

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAppContext();
  const getLinkClass = (path) => router.pathname === path ? styles.active : "";
  
  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.brand}><Link href="/">Kasir Toko Baju</Link></div>
        <nav className={styles.navLinks}>
          <Link href="/" className={getLinkClass("/")}>Dashboard</Link>
          <Link href="/produk" className={getLinkClass("/produk")}>Produk</Link>
          <Link href="/transaksi" className={getLinkClass("/transaksi")}>Transaksi</Link>
          <Link href="/member" className={getLinkClass("/member")}>Member</Link>
          <Link href="/laporan" className={getLinkClass("/laporan")}>Laporan</Link>
          <Link href="/pengaturan" className={getLinkClass("/pengaturan")}>Pengaturan</Link>
        </nav>
      </div>
      <div className={styles.profileSection}>
        <Link href="/profil" className={getLinkClass("/profil")}>Edit Profil</Link>
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </div>
    </aside>
  );
};
export default Sidebar;