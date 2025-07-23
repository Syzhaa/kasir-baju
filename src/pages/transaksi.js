import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Cart from '../components/Cart';
import styles from '../styles/Transaksi.module.css';

export default function TransaksiPage() {
  const { products, members, addToCart, cart } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize || quantity < 1) {
      setError('Pilih produk, ukuran, dan jumlah terlebih dahulu.');
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (product.stock[selectedSize] < quantity) {
      setError(`Stok ukuran ${selectedSize} tidak mencukupi (tersisa: ${product.stock[selectedSize]}).`);
      return;
    }
    setError('');
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: Number(quantity)
    });
    // Reset form
    setSelectedProduct('');
    setSelectedSize('');
    setQuantity(1);
  };

  const product = products.find(p => p.id === selectedProduct);

  return (
    <div>
      <h1>Halaman Transaksi / Kasir</h1>
      <div className={styles.transaksiGrid}>
        <div className={`${styles.productSelection} card`}>
          <h2>Pilih Produk</h2>
          <div className={styles.formGroup}>
            <label>Produk</label>
            <select value={selectedProduct} onChange={e => {setSelectedProduct(e.target.value); setSelectedSize('')}}>
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {product && (
            <>
              <div className={styles.formGroup}>
                <label>Ukuran</label>
                <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)}>
                   <option value="">-- Pilih Ukuran --</option>
                  {Object.keys(product.stock).filter(s => product.stock[s] > 0).map(size => (
                    <option key={size} value={size}>{size} (Stok: {product.stock[size]})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Jumlah</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
              </div>
            </>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button onClick={handleAddToCart} disabled={!selectedProduct || !selectedSize}>+ Tambah ke Keranjang</button>
        </div>
        
        <div className={`${styles.cartSection} card`}>
          <h2>Keranjang Belanja</h2>
          <Cart />
        </div>
      </div>
    </div>
  );
}