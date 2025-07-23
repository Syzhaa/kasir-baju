import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import MemberForm from '../components/MemberForm';
import styles from '../styles/List.module.css';

const ITEMS_PER_PAGE = 5; // Menetapkan 5 member per halaman

export default function MemberPage() {
  const { members, deleteMember } = useAppContext(); 
  const [editingMember, setEditingMember] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Mengurutkan member dari yang terbaru
  const sortedMembers = useMemo(() => {
    return [...members].reverse();
  }, [members]);

  // Menghitung total halaman
  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);

  // Mengambil data untuk halaman yang aktif
  const paginatedMembers = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return sortedMembers.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, sortedMembers]);

  // Menghitung nomor awal untuk setiap halaman
  const nomorAwal = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleEdit = (member) => {
    setEditingMember(member);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
  };

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
        {sortedMembers.length === 0 ? (
          <p>Belum ada member terdaftar.</p>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Nama</th>
                    <th>No. HP</th>
                    <th>Email</th>
                    <th>Diskon (%)</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member, index) => (
                    <tr key={member.id}>
                      <td>{nomorAwal + index + 1}</td>
                      <td>{member.name}</td>
                      <td>{member.phone}</td>
                      <td>{member.email || '-'}</td>
                      <td>{member.discount || 0}%</td>
                      <td>
                        <div className={styles.actions}>
                          <button onClick={() => handleEdit(member)} className="button-secondary">Edit</button>
                          <button onClick={() => deleteMember(member.id)} className="button-danger">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tombol Navigasi Halaman */}
            {totalPages > 1 && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </button>
                <span style={{ margin: '0 15px' }}>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                >
                  Berikutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}