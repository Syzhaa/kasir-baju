import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import MemberForm from './MemberForm';
import Receipt from './Receipt';
import { useReactToPrint } from 'react-to-print';
import styles from '../styles/Cart.module.css';

export default function Cart() {
  const { cart, removeFromCart, clearCart, members, addTransaction } = useAppContext();
  const [customerType, setCustomerType] = useState('Non-Member');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  
  const receiptRef = useRef(null);

  // Fixed: Changed from 'content' to 'contentRef' and added pageStyle
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: `
      @page {
        size: 80mm auto; /* Thermal printer 80mm width, auto height */
        margin: 0;
        padding: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .receipt-container {
          width: 80mm;
          max-width: 80mm;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          line-height: 1.2;
          padding: 2mm;
          margin: 0;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 3mm;
        }
        .receipt-item {
          font-size: 11px;
          margin: 1mm 0;
        }
        .receipt-total {
          border-top: 1px dashed #000;
          padding-top: 2mm;
          margin-top: 2mm;
          font-weight: bold;
        }
      }
    `,
    onBeforeGetContent: () => {
      // Ensure content is ready before printing
      return Promise.resolve();
    },
    onAfterPrint: () => {
      console.log('Print completed');
    }
  });

  const handleCompleteTransaction = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    if (customerType === 'Member' && !selectedMember) {
        alert("Pilih member terlebih dahulu atau daftarkan member baru.");
        return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const memberDiscountPercent = selectedMember ? selectedMember.discount : 0;
    const discount = customerType === 'Member' && selectedMember ? (subtotal * memberDiscountPercent) / 100 : 0;
    const total = subtotal - discount;

    const transactionData = {
        items: cart, member: selectedMember, total: total, discount: discount
    };
    
    const newTransaction = addTransaction(transactionData);
    setLastTransaction(newTransaction);
    setSelectedMember(null);
    setSearchTerm('');
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm('');
  };

  const filteredMembers = searchTerm
    ? members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm))
    : [];
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const memberDiscountPercent = selectedMember ? selectedMember.discount : 0;
  const discount = customerType === 'Member' && selectedMember ? (subtotal * memberDiscountPercent) / 100 : 0;
  const total = subtotal - discount;

  return (
    <div className={styles.cart}>
      {lastTransaction ? (
        <div className={styles.successMessage}>
          <h3>Transaksi Berhasil!</h3>
          <p>No. Transaksi: {lastTransaction.id}</p>
          <p>Silakan klik tombol di bawah untuk mencetak struk.</p>
          <button onClick={handlePrint} style={{marginRight: '10px'}}>Cetak Struk</button>
          <button onClick={() => setLastTransaction(null)} className="button-secondary">Transaksi Baru</button>
        </div>
      ) : (
        <>
          {cart.length === 0 ? <p>Keranjang kosong.</p> : (
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
            {discount > 0 && <p className={styles.discount}>Diskon Member ({memberDiscountPercent}%): <span>- Rp {discount.toLocaleString('id-ID')}</span></p>}
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
                  <input type="text" placeholder="Cari member (nama/no. HP)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  {filteredMembers.length > 0 && searchTerm && (
                    <ul className={styles.memberDropdown}>
                      {filteredMembers.map(m => (<li key={m.id} onClick={() => handleSelectMember(m)}>{m.name} - {m.phone}</li>))}
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
                <MemberForm onFormSubmit={(newMember) => { handleSelectMember(newMember); setShowNewMemberForm(false); }}/>
                <button onClick={() => setShowNewMemberForm(false)} className="button-secondary" style={{marginTop: '10px'}}>Tutup</button>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button onClick={handleCompleteTransaction} className={styles.checkoutBtn} disabled={cart.length === 0}>Selesaikan Transaksi</button>
            <button onClick={clearCart} className="button-danger">Kosongkan Keranjang</button>
          </div>
        </>
      )}

      {/* Komponen struk hanya di-render jika 'lastTransaction' ada isinya */}
      {lastTransaction && (
        <div className={styles.printSource}>
          <Receipt ref={receiptRef} transaction={lastTransaction} />
        </div>
      )}
    </div>
  );
}