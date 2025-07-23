import { useAppContext } from '../context/AppContext';
import styles from '../styles/Katalog.module.css';

export default function HomePage() {
  const { products } = useAppContext();

  return (
    <div>
      <h1>Katalog Produk</h1>
      {products.length === 0 ? (
        <p>Belum ada produk yang tersedia. Silakan tambahkan melalui halaman "Produk".</p>
      ) : (
        <div className={styles.productGrid}>
          {products.map(product => (
            <div key={product.id} className={`${styles.productCard} card`}>
              <img src={product.imageUrl || 'https://via.placeholder.com/300'} alt={product.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.productPrice}>Rp {Number(product.price).toLocaleString('id-ID')}</p>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.stockInfo}>
                  <strong>Stok Tersedia:</strong>
                  <div>
                    {Object.entries(product.stock)
                      .filter(([_, qty]) => qty > 0)
                      .map(([size, qty]) => (
                        <span key={size} className={styles.stockTag}>{size}: {qty}</span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}