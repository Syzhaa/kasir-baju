import { useAppContext } from '../context/AppContext';
import styles from '../styles/TopBar.module.css';

export default function TopBar({ pageTitle }) {
  const { currentUser } = useAppContext();
  return (
    <div className={styles.topbar}>
      <h1 className={styles.title}>{pageTitle}</h1>
      <div className={styles.userInfo}>
        <span>Selamat datang, <strong>{currentUser?.username}</strong></span>
      </div>
    </div>
  );
}