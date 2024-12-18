import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ProductList.scss";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    categories?: { id: number; name: string }[];
}

interface Category {
    id: number;
    name: string;
}

interface ProductListProps {
    addToCart: (product: Product, quantity: number) => void;
    isAdmin: boolean; // Dodano pole do sprawdzania, czy użytkownik jest adminem
}



const ProductList: React.FC<ProductListProps> = ({ addToCart, isAdmin }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number | null>(null);
    const [sortOption, setSortOption] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // Używane do nawigacji

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Dodanie tokenu
            }
            : {
                "Content-Type": "application/json", // Brak tokenu
            };
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8080/categories", {
                    method: "GET",
                    headers: getAuthHeaders(),
                });

                if (!response.ok) throw new Error("Failed to fetch categories");
                const data: Category[] = await response.json();
                setCategories(data);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = async (categoryId: number | null = null) => {
        try {
            setLoading(true);
            const url = categoryId
                ? `http://localhost:8080/products/by-category?categoryId=${categoryId}`
                : "http://localhost:8080/products";

            const response = await fetch(url, {
                method: "GET",
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error("Failed to fetch products");
            const data: Product[] = await response.json();
            setProducts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(selectedCategories);
    }, [selectedCategories]);

    const handleCategoryClick = (categoryId: number) => {
        setSelectedCategories((prev) => (prev === categoryId ? null : categoryId));
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

    const getCurrentCategoryName = () => {
        if (!selectedCategories) return "Wszystkie produkty";
        const selectedCategory = categories.find(
            (category) => category.id === selectedCategories
        );
        return selectedCategory ? selectedCategory.name : "Wszystkie produkty";
    };

    return (
        <div className="product-list-container">
            <aside className="category-sidebar">
                <h3>Kategorie</h3>
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`category-card ${
                            selectedCategories === category.id ? "selected" : ""
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
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
            <div className="main-content">
                <h2 className="product-header">{getCurrentCategoryName()}</h2>

                {/* Przycisk dla admina do tworzenia produktu */}
                {isAdmin && (
                    <button
                        className="create-product-button"
                        type="button" // Prevents default form behavior
                        onClick={() => navigate("/create-product")}
                    >
                        Dodaj produkt
                    </button>
                )}

                <div className="product-grid">
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
            </div>
        </div>
    );
};

export default ProductList;
