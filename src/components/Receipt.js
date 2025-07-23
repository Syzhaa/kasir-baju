import React from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Receipt.module.css';

const Receipt = React.forwardRef(({ transaction }, ref) => {
  const { products, members } = useAppContext();

  // 1. Validasi data utama untuk mencegah error
  if (!transaction || !Array.isArray(transaction.items)) {
    // Render div kosong dengan ref agar tidak error saat print
    return <div ref={ref} style={{ display: 'none' }} />;
  }

  // 2. Akses data dengan aman
  const member = transaction.memberId ? members.find(m => m.id === transaction.memberId) : null;
  const transactionDate = new Date(transaction.date || Date.now()).toLocaleString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div ref={ref} className={styles.receipt}>
      <div className={styles.header}>
        <h3>Toko Baju Keren</h3>
        <p>Jl. Merdeka No. 123, Kota Fiksi</p>
        <p>Telp: (021) 555-1234</p>
      </div>
      
      <hr className={styles.hr} />

      <div className={styles.details}>
        <p><span>No. Transaksi:</span> {transaction.id || 'N/A'}</p>
        <p><span>Tanggal:</span> {transactionDate}</p>
        {member && <p><span>Member:</span> {member.name || 'N/A'}</p>}
        <p><span>Kasir:</span> {useAppContext().currentUser?.username || 'Admin'}</p>
        <p><span>Pembayaran:</span> {transaction.paymentMethod || 'Tunai'}</p>
      </div>

      <hr className={styles.hr} />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Produk</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const productName = product ? product.name : 'Produk Dihapus';
            // 3. Kunci (key) yang unik dan aman
            const key = `${item.productId}-${item.size}-${index}`;
            return (
              <tr key={key}>
                <td>{productName} ({item.size || 'N/A'})</td>
                <td>{Number(item.quantity) || 0}</td>
                <td>{(Number(item.price) || 0).toLocaleString('id-ID')}</td>
                <td>{(Number(item.price * item.quantity) || 0).toLocaleString('id-ID')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <hr className={styles.hr} />

      <div className={styles.totals}>
        <p><span>Subtotal:</span> Rp {(Number(transaction.total) + Number(transaction.discount) || 0).toLocaleString('id-ID')}</p>
        {transaction.discount > 0 && (
          <p><span>Diskon:</span> - Rp {(Number(transaction.discount) || 0).toLocaleString('id-ID')}</p>
        )}
        <p className={styles.grandTotal}><span>Total:</span> Rp {(Number(transaction.total) || 0).toLocaleString('id-ID')}</p>
      </div>
      
      <hr className={styles.hr} />

      <div className={styles.footer}>
        <p>Terima kasih telah berbelanja!</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
