import { useAppContext } from '../context/AppContext';
import styles from '../styles/List.module.css';

// 1. Terima 'nomorAwal' sebagai prop baru
export default function ProductList({ products, onEdit, nomorAwal = 0 }) {
  const { deleteProduct } = useAppContext();

  if (!products || products.length === 0) {
    return <p>Belum ada produk untuk halaman ini.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Nama Produk</th>
            <th>Harga</th>
            <th>Stok Ukuran</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              {/* 2. Gunakan 'nomorAwal' untuk penomoran yang benar */}
              <td>{nomorAwal + index + 1}</td>
              <td>{product.name}</td>
              <td>Rp {Number(product.price).toLocaleString('id-ID')}</td>
              <td>
                <div className={styles.stockInfo}>
                  {Object.entries(product.stock).map(([size, qty]) => (
                    <span key={size}>{size}: <strong>{qty}</strong></span>
                  ))}
                </div>
              </td>
              <td>
                <div className={styles.actions}>
                  <button onClick={() => onEdit(product)} className="button-secondary">Edit</button>
                  <button onClick={() => {
                    if (window.confirm(`Yakin ingin menghapus ${product.name}?`)) {
                      deleteProduct(product.id);
                    }
                  }} className="button-danger">Hapus</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}