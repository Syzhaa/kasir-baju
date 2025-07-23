import { useAppContext } from '../context/AppContext';
import styles from '../styles/List.module.css';

export default function ProductList({ products, onEdit }) {
  const { deleteProduct } = useAppContext();

  if (!products || products.length === 0) {
    return <p>Belum ada produk. Silakan tambahkan produk baru.</p>;
  }

  return (
    <div className={styles.list}>
      {products.map(product => (
        <div key={product.id} className={styles.item}>
          <img src={product.imageUrl || 'https://via.placeholder.com/100'} alt={product.name} className={styles.image} />
          <div className={styles.details}>
            <strong>{product.name}</strong>
            <p>Rp {Number(product.price).toLocaleString('id-ID')}</p>
            <div className={styles.stockInfo}>
              {Object.entries(product.stock).map(([size, qty]) => (
                <span key={size}>{size}: {qty}</span>
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <button onClick={() => onEdit(product)} className="button-secondary">Edit</button>
            <button onClick={() => {
              if (window.confirm(`Yakin ingin menghapus ${product.name}?`)) {
                deleteProduct(product.id);
              }
            }} className="button-danger">Hapus</button>
          </div>
        </div>
      ))}
    </div>
  );
}