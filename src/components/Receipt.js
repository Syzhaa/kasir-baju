import React from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Receipt.module.css';

const Receipt = React.forwardRef(({ transaction }, ref) => {
  const { products, members } = useAppContext();

  // Komponen ini sekarang berasumsi 'transaction' pasti ada saat di-render
  const member = transaction ? members.find(m => m.id === transaction.memberId) : null;

  return (
    <div ref={ref} className={styles.receipt}>
      {transaction ? (
        <>
          <h2>Struk Belanja</h2>
          <p>Toko Baju Keren</p>
          <hr />
          <p><strong>No. Transaksi:</strong> {transaction.id}</p>
          <p><strong>Tanggal:</strong> {new Date(transaction.date).toLocaleString('id-ID')}</p>
          {member && <p><strong>Member:</strong> {member.name}</p>}
          <hr />
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                const productName = product ? product.name : 'Produk Dihapus';
                return (
                  <tr key={item.cartId || item.productId + item.size}>
                    <td>{productName} ({item.size})</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.price).toLocaleString('id-ID')}</td>
                    <td>{Number(item.price * item.quantity).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <hr />
          <div className={styles.totals}>
            <p><strong>Subtotal:</strong> Rp {Number(transaction.total + transaction.discount).toLocaleString('id-ID')}</p>
            {transaction.discount > 0 && <p><strong>Diskon:</strong> - Rp {Number(transaction.discount).toLocaleString('id-ID')}</p>}
            <p><strong>Total:</strong> Rp {Number(transaction.total).toLocaleString('id-ID')}</p>
          </div>
          <hr />
          <p className={styles.footer}>Terima kasih telah berbelanja!</p>
        </>
      ) : null}
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;