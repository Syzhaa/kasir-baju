import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import MemberForm from './MemberForm'; // Kita akan buat komponen ini
import Receipt from './Receipt'; // Untuk cetak struk
import { useReactToPrint } from 'react-to-print';
import styles from '../styles/Cart.module.css';

const MEMBER_DISCOUNT_PERCENT = 10; // Diskon 10% untuk member

export default function Cart() {
  const { cart, removeFromCart, clearCart, members, addTransaction } = useAppContext();
  const [customerType, setCustomerType] = useState('Non-Member');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  
  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const filteredMembers = searchTerm
    ? members.filter(
        m =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.phone.includes(searchTerm)
      )
    : [];

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = customerType === 'Member' && selectedMember ? (subtotal * MEMBER_DISCOUNT_PERCENT) / 100 : 0;
  const total = subtotal - discount;

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm('');
  };
  
  const handleCompleteTransaction = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    if (customerType === 'Member' && !selectedMember) {
        alert("Pilih member terlebih dahulu atau daftarkan member baru.");
        return;
    }

    const transactionData = {
        items: cart,
        member: selectedMember,
        total: total,
        discount: discount
    };
    
    const newTransaction = addTransaction(transactionData);
    setLastTransaction(newTransaction);
    alert("Transaksi berhasil!");
    // Reset state
    setSelectedMember(null);
    setSearchTerm('');
  };

  if (lastTransaction) {
    return (
      <div className={styles.receiptContainer}>
         <h3>Transaksi Selesai!</h3>
         <Receipt ref={receiptRef} transaction={lastTransaction} />
         <div className={styles.receiptActions}>
            <button onClick={handlePrint}>Cetak Struk</button>
            <button onClick={() => setLastTransaction(null)} className="button-secondary">Transaksi Baru</button>
         </div>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      {cart.length === 0 ? (
        <p>Keranjang kosong.</p>
      ) : (
        <ul className={styles.cartList}>
          {cart.map(item => (
            <li key={item.cartId} className={styles.cartItem}>
              <span>{item.name} ({item.size}) x {item.quantity}</span>
              <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
              <button onClick={() => removeFromCart(item.cartId)} className={styles.removeBtn}>x</button>
            </li>
          ))}
        </ul>
      )}
      
      <div className={styles.summary}>
        <p>Subtotal: <span>Rp {subtotal.toLocaleString('id-ID')}</span></p>
        {discount > 0 && <p className={styles.discount}>Diskon Member ({MEMBER_DISCOUNT_PERCENT}%): <span>- Rp {discount.toLocaleString('id-ID')}</span></p>}
        <hr />
        <p className={styles.total}>Total: <span>Rp {total.toLocaleString('id-ID')}</span></p>
      </div>

      <div className={styles.customerSection}>
        <label>Jenis Pelanggan:</label>
        <select value={customerType} onChange={(e) => {setCustomerType(e.target.value); setSelectedMember(null)}}>
          <option>Non-Member</option>
          <option>Member</option>
        </select>
      </div>
      
      {customerType === 'Member' && (
        <div className={styles.memberSearch}>
          {selectedMember ? (
            <div className={styles.selectedMember}>
              <p>Member: {selectedMember.name} ({selectedMember.phone})</p>
              <button onClick={() => setSelectedMember(null)} className="button-secondary">Ganti Member</button>
            </div>
          ) : (
            <>
              <input 
                type="text"
                placeholder="Cari member (nama/no. HP)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filteredMembers.length > 0 && searchTerm && (
                <ul className={styles.memberDropdown}>
                  {filteredMembers.map(m => (
                    <li key={m.id} onClick={() => handleSelectMember(m)}>
                      {m.name} - {m.phone}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setShowNewMemberForm(true)} style={{marginTop: '10px'}}>+ Daftarkan Member Baru</button>
            </>
          )}
        </div>
      )}

      {showNewMemberForm && (
        <div className={styles.modal}>
          <div className={`${styles.modalContent} card`}>
            <h3>Daftar Member Baru</h3>
            <MemberForm onFormSubmit={(newMember) => {
              handleSelectMember(newMember);
              setShowNewMemberForm(false);
            }}/>
            <button onClick={() => setShowNewMemberForm(false)} className="button-secondary" style={{marginTop: '10px'}}>Tutup</button>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button onClick={handleCompleteTransaction} className={styles.checkoutBtn} disabled={cart.length === 0}>Selesaikan Transaksi</button>
        <button onClick={clearCart} className="button-danger">Kosongkan Keranjang</button>
      </div>
    </div>
  );
}