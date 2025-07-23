import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import styles from '../styles/Produk.module.css';

export default function ProdukPage() {
  const { products } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div>
      <h1>Manajemen Produk</h1>
      <div className={styles.container}>
        <div className={`${styles.formSection} card`}>
          <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <ProductForm 
            key={editingProduct ? editingProduct.id : 'new'}
            productToEdit={editingProduct} 
            onFormSubmit={handleCancelEdit} 
          />
          {editingProduct && <button onClick={handleCancelEdit} className="button-secondary" style={{marginTop: '10px'}}>Batal Edit</button>}
        </div>
        <div className={`${styles.listSection} card`}>
          <h2>Daftar Produk</h2>
          <ProductList products={products} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
}