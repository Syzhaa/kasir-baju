import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Auth.module.css';

export default function ProfilePage() {
    const { currentUser, updateProfile } = useAppContext();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); setError('');
        if (newPassword.length < 6) { setError('Password baru minimal harus 6 karakter.'); return; }
        if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return; }
        try {
            await updateProfile(currentUser.id, newPassword);
            setMessage('Password berhasil diperbarui!');
            setNewPassword(''); setConfirmPassword('');
        } catch (err) { setError('Gagal memperbarui password.'); }
    };

    return (
        <div>
            <div className={`${styles.formCard} ${styles.profileContainer}`}>
                <h3>Ubah Password untuk: {currentUser?.username}</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {message && <p className={styles.success}>{message}</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password Baru" required />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi Password Baru" required />
                    <button type="submit">Update Password</button>
                </form>
            </div>
        </div>
    );
}