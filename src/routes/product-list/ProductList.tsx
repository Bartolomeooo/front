import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductList.scss";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    categories: { id: number; name: string }[];
}

interface Category {
    id: number;
    name: string;
}

interface ProductListProps {
    addToCart: (product: Product, quantity: number) => void;
}

const ProductList: React.FC<ProductListProps> = ({ addToCart }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
    const [sortOption, setSortOption] = useState<string>("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8080/categories");
                if (!response.ok) throw new Error("Failed to fetch categories");
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = async (categoryIds: number[] = []) => {
        try {
            setLoading(true);
            const url =
                categoryIds.length > 0
                    ? `http://localhost:8080/products?categoryIds=${categoryIds.join(",")}`
                    : "http://localhost:8080/products";

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch products");
            const data = await response.json();
            setProducts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(Array.from(selectedCategories));
    }, [selectedCategories]);

    const toggleCategory = (categoryId: number) => {
        setSelectedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleSortChange = (option: string) => {
        setSortOption(option);
        const sortedProducts = [...products];
        if (option === "name") {
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (option === "price") {
            sortedProducts.sort((a, b) => a.price - b.price);
        }
        setProducts(sortedProducts);
    };

    return (
        <div className="product-list-container">
            <aside className="category-sidebar">
                <h3>Kategorie</h3>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`category-card ${
                            selectedCategories.has(category.id) ? "selected" : ""
                        }`}
                        onClick={() => toggleCategory(category.id)}
                    >
                        {category.name}
                    </div>
                ))}
                <div className="sort-options">
                    <h4>Sortuj według:</h4>
                    <button onClick={() => handleSortChange("name")}>Nazwa</button>
                    <button onClick={() => handleSortChange("price")}>Cena</button>
                </div>
            </aside>
            <main className="product-grid">
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
            </main>
        </div>
    );
};

export default ProductList;
