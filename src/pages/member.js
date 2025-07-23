import { useAppContext } from '../context/AppContext';
import MemberForm from '../components/MemberForm';
import styles from '../styles/List.module.css';

export default function MemberPage() {
  const { members } = useAppContext();

  return (
    <div>
      <h1>Manajemen Member</h1>
      <div className="card" style={{marginBottom: '20px'}}>
        <h2>Daftarkan Member Baru</h2>
        <MemberForm />
      </div>

      <div className="card">
        <h2>Daftar Member</h2>
        {members.length === 0 ? (
          <p>Belum ada member terdaftar.</p>
        ) : (
          <div className={styles.list}>
            {members.map(member => (
              <div key={member.id} className={styles.item}>
                <div className={styles.details}>
                  <strong>{member.name}</strong>
                  <p>HP: {member.phone}</p>
                  <p>Email: {member.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}