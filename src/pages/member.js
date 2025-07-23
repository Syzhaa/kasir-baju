// src/pages/member.js
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MemberForm from '../components/MemberForm';
import styles from '../styles/List.module.css';

export default function MemberPage() {
  // Ambil fungsi deleteMember dari context
  const { members, deleteMember } = useAppContext(); 
  const [editingMember, setEditingMember] = useState(null);

  const handleEdit = (member) => {
    setEditingMember(member);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
  };

  // Tidak perlu membuat fungsi handleDelete karena sudah ada di context
  // dan sudah menyertakan window.confirm

  return (
    <div>
      
      <div className="card" style={{marginBottom: '30px'}}>
        <h2>{editingMember ? `Edit Member: ${editingMember.name}` : 'Daftarkan Member Baru'}</h2>
        <MemberForm 
          key={editingMember ? editingMember.id : 'new'}
          memberToEdit={editingMember}
          onFormSubmit={handleCancelEdit}
        />
        {editingMember && (
          <button onClick={handleCancelEdit} className="button-secondary" style={{marginTop: '10px', width: '100%'}}>
            Batal Edit
          </button>
        )}
      </div>

      <div className="card">
        <h2>Daftar Member</h2>
        {members.length === 0 ? (
          <p>Belum ada member terdaftar.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>No. HP</th>
                  <th>Email</th>
                  <th>Diskon (%)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.phone}</td>
                    <td>{member.email || '-'}</td>
                    {/* Ini adalah perbaikan dari bug diskon */}
                    <td>{member.discount || 0}%</td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleEdit(member)} className="button-secondary">Edit</button>
                        {/* Tambahkan tombol Hapus di sini */}
                        <button onClick={() => deleteMember(member.id)} className="button-danger">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}