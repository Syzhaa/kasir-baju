// src/components/TopBar.js
import styles from '../styles/TopBar.module.css';

export default function TopBar({ pageTitle }) {
  return (
    <div className={styles.topbar}>
      <h1 className={styles.title}>{pageTitle}</h1>
      {/* Info user dihapus dari sini */}
    </div>
  );
}