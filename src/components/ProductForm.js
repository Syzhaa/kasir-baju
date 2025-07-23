import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import styles from '../styles/Form.module.css';

const initialStock = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

export default function ProductForm({ productToEdit, onFormSubmit }) {
  const { addProduct, updateProduct } = useAppContext();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: initialStock
  });

  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      setProduct({ name: '', description: '', price: '', imageUrl: '', stock: initialStock });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      stock: { ...prev.stock, [name]: Number(value) || 0 }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.name || !product.price) {
      alert('Nama dan Harga produk wajib diisi!');
      return;
    }

    if (productToEdit) {
      updateProduct(product);
    } else {
      addProduct(product);
    }

    setProduct({ name: '', description: '', price: '', imageUrl: '', stock: initialStock });
    if(onFormSubmit) onFormSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input name="name" value={product.name} onChange={handleChange} placeholder="Nama Produk" required />
      <textarea name="description" value={product.description} onChange={handleChange} placeholder="Deskripsi"></textarea>
      <input name="price" type="number" value={product.price} onChange={handleChange} placeholder="Harga (Rp)" required />
      <input name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="URL Gambar Produk" />
      
      <fieldset className={styles.fieldset}>
        <legend>Stok per Ukuran</legend>
        <div className={styles.stockGrid}>
          {Object.keys(initialStock).map(size => (
            <div key={size}>
              <label>{size}</label>
              <input name={size} type="number" value={product.stock[size]} onChange={handleStockChange} min="0" />
            </div>
          ))}
        </div>
      </fieldset>
      
      <button type="submit">{productToEdit ? 'Update Produk' : 'Tambah Produk'}</button>
    </form>
  );
}