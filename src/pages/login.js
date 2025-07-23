import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Auth.module.css';

export default function LoginPage() {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { await login(username, password); } catch (err) { setError(err.message); }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formCard}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}