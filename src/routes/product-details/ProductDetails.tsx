import React from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.scss";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

interface Review {
    id: number;
    content: string;
    rating: number;
}

interface ProductDetailsProps {
    addToCart: (product: Product, quantity: number) => void;
    isAdmin: boolean;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ addToCart, isAdmin }) => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = React.useState<Product | null>(null);
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(1);
    const [editMode, setEditMode] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
            : {
                "Content-Type": "application/json",
            };
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const productRes = await fetch(`http://localhost:8080/products/${id}`, {
                    method: "GET",
                    headers: getAuthHeaders(),
                });

                const reviewRes = await fetch(`http://localhost:8080/reviews/product/${id}`, {
                    method: "GET",
                    headers: getAuthHeaders(),
                });

                if (!productRes.ok) throw new Error("Failed to fetch product details");
                if (!reviewRes.ok) throw new Error("Failed to fetch reviews");

                const fetchedProduct = await productRes.json();
                const fetchedReviews = await reviewRes.json();

                setProduct(fetchedProduct);
                setReviews(fetchedReviews);
            } catch (err) {
                console.error(err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            alert("Produkt dodany do koszyka!");
        }
    };

    const quantityOptions = product
        ? Array.from({ length: product.quantity }, (_, i) => i + 1)
        : [];

    return (
        <div className="product-details-container">
            {loading && <p>Ładowanie...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && product && (
                <div className="product-details">
                    <div className="product-details-content">
                        {editMode ? (
                            <>
                                <input
                                    type="text"
                                    value={product.name}
                                    onChange={(e) =>
                                        setProduct((prev) => prev && { ...prev, name: e.target.value })
                                    }
                                />
                                <textarea
                                    value={product.description}
                                    onChange={(e) =>
                                        setProduct((prev) => prev && { ...prev, description: e.target.value })
                                    }
                                />
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) =>
                                        setProduct((prev) => prev && { ...prev, price: Number(e.target.value) })
                                    }
                                />
                                <input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) =>
                                        setProduct((prev) => prev && { ...prev, quantity: Number(e.target.value) })
                                    }
                                />
                                <button className="save-button" onClick={() => setEditMode(false)}>
                                    Zapisz zmiany
                                </button>
                            </>
                        ) : (
                            <>
                                <h1>{product.name}</h1>
                                <p className="product-description">{product.description}</p>
                                <p className="product-price">
                                    Cena: <strong>{product.price} PLN</strong>
                                </p>
                                <p className="product-quantity">
                                    Ilość dostępna: {product.quantity}
                                </p>
                                {product.quantity === 0 && (
                                    <p className="product-unavailable">Produkt niedostępny</p>
                                )}
                                {product.quantity > 0 && (
                                    <div className="add-to-cart">
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                        >
                                            {quantityOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            className="add-to-cart-button"
                                            onClick={handleAddToCart}
                                        >
                                            Dodaj do koszyka
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        {isAdmin && (
                            <div className="admin-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? "Anuluj" : "Edytuj produkt"}
                                </button>
                            </div>
                        )}
                    </div>
                    <h3>Opinie</h3>
                    <div className="reviews">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <p>{review.content}</p>
                                    <p className="review-rating">Ocena: {review.rating}/5</p>
                                    {isAdmin && (
                                        <button
                                            className="delete-review-button"
                                            onClick={() => console.log(`Usuń opinię: ${review.id}`)}
                                        >
                                            Usuń opinię
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>Brak opinii dla tego produktu.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
