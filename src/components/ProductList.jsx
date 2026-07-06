import React, { useEffect, useState } from 'react';
import api from '../services/api';

function ProductList() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/api/products')
            .then(response => {
                setProducts(response.data.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p>Hata: {error}</p>;

    return (
        <div>
            <h2>Ürün Listesi</h2>
            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>İsim</th>
                        <th>Fiyat</th>
                        <th>Stok</th>
                        <th>Kategori</th>
                        <th>Durum</th>
                    </tr>
                </thead>
                <tbody>
                    {products?.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.price} ₺</td>
                            <td>{product.stock}</td>
                            <td>{product.category ? product.category.name : '-'}</td>
                            <td>{product.status ? '✅ Aktif' : '❌ Pasif'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProductList;