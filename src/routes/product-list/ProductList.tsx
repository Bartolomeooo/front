import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductList.scss";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface ProductListProps {
    addToCart: (product: Product, quantity: number) => void;
}

const ProductList: React.FC<ProductListProps> = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8080/products");
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                setProducts(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="product-list-container">
            <h1>Lista Produktów</h1>
            {loading && <p>Ładowanie...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading &&
                !error &&
                products.map((product) => (
                    <div className="product-card" key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <h2>{product.name}</h2>
                            <p>Cena: {product.price} PLN</p>
                            <p>Ilość: {product.quantity}</p>
                        </Link>
                    </div>
                ))}
        </div>
    );
};

export default ProductList;
