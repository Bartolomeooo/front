import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProduct.scss";

interface Category {
    id: number;
    name: string;
}

const CreateProduct: React.FC = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8080/categories", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Dodanie tokena
                    },
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

    const handleCategoryChange = (categoryId: number) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:8080/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name,
                    description,
                    price,
                    quantity,
                    categories: selectedCategories.map((id) => ({ id })),
                }),
            });

            if (!response.ok) {
                throw new Error("Nie udało się utworzyć produktu.");
            }

            alert("Produkt został pomyślnie utworzony!");
            navigate("/products");
        } catch (error: any) {
            console.error(error.message);
            setError(error.message);
        }
    };

    return (
        <div className="create-product-container">
            <h1>Dodaj nowy produkt</h1>
            <form onSubmit={handleCreateProduct} className="create-product-form">
                <div className="form-group">
                    <label htmlFor="name">Nazwa produktu</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Opis</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Cena (PLN)</label>
                    <input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="quantity">Ilość</label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Kategorie</label>
                    <div className="categories-checkboxes">
                        {categories.map((category) => (
                            <div key={category.id} className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id={`category-${category.id}`}
                                    value={category.id}
                                    onChange={() => handleCategoryChange(category.id)}
                                />
                                <label htmlFor={`category-${category.id}`}>
                                    {category.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="submit-button">Dodaj produkt</button>
            </form>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default CreateProduct;
