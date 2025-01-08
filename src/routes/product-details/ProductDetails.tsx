import React from "react";
import { useParams } from "react-router-dom";
import "./ProductDetails.scss"; // Import stylów z pliku

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
            alert("Product added to cart!");
        }
    };

    const handleUpdateProduct = async () => {
        try {
            const response = await fetch(`http://localhost:8080/products/${id}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(product),
            });

            if (!response.ok) throw new Error("Failed to update product.");
            alert("Product updated successfully!");
            setEditMode(false);
        } catch (error) {
            console.error(error);
            setError("Failed to update product.");
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        try {
            const response = await fetch(`http://localhost:8080/reviews/${reviewId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!response.ok) throw new Error("Failed to delete review.");
            setReviews((prev) => prev.filter((review) => review.id !== reviewId));
        } catch (error) {
            console.error(error);
            setError("Failed to delete review.");
        }
    };

    const handleSetQuantityToZero = async () => {
        if (product) {
            try {
                const response = await fetch(`http://localhost:8080/products/${id}`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ ...product, quantity: 0 }),
                });

                if (!response.ok) throw new Error("Failed to update product quantity.");
                setProduct({ ...product, quantity: 0 });
                alert("Product marked as unavailable.");
            } catch (error) {
                console.error(error);
                setError("Failed to update product quantity.");
            }
        }
    };

    const quantityOptions = product
        ? Array.from({ length: product.quantity }, (_, i) => i + 1)
        : [];

    return (
        <div className="product-details-container">
            {loading && <p className="loading-text">Loading...</p>}
            {error && <p className="error-text">{error}</p>}
            {!loading && product && (
                <div className="product-details">
                    {editMode ? (
                        <div className="edit-mode">
                            <label htmlFor="name">Product Name:</label>
                            <input
                                id="name"
                                type="text"
                                value={product.name}
                                onChange={(e) =>
                                    setProduct((prev) => prev && { ...prev, name: e.target.value })
                                }
                            />

                            <label htmlFor="description">Description:</label>
                            <textarea
                                id="description"
                                value={product.description}
                                onChange={(e) =>
                                    setProduct((prev) => prev && { ...prev, description: e.target.value })
                                }
                            />

                            <label htmlFor="price">Cena:</label>
                            <input
                                id="price"
                                type="number"
                                value={product.price}
                                onChange={(e) =>
                                    setProduct((prev) => prev && { ...prev, price: Number(e.target.value) })
                                }
                            />

                            <label htmlFor="quantity">Quantity:</label>
                            <input
                                id="quantity"
                                type="number"
                                value={product.quantity}
                                onChange={(e) =>
                                    setProduct((prev) => prev && { ...prev, quantity: Number(e.target.value) })
                                }
                            />

                            <div className="edit-mode-buttons">
                                <button className="edit-product-button" onClick={handleUpdateProduct}>
                                    Save Changes
                                </button>
                                <button className="cancel-edit-button" onClick={() => setEditMode(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1>{product.name}</h1>
                            <p className="product-description">{product.description}</p>
                            <p className="product-price">Cena: {product.price} PLN</p>
                            <p className="product-quantity">Ilość: {product.quantity}</p>
                            <div className="add-to-cart-container">
                                <select
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="select-quantity"
                                >
                                    {quantityOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <button className="add-to-cart-button" onClick={handleAddToCart}>
                                    Dodaj do koszyka
                                </button>
                            </div>
                        </>
                    )}
                    {isAdmin && !editMode && (
                        <div className="admin-buttons">
                            <button className="edit-product-button" onClick={() => setEditMode(true)}>
                                Edit Product
                            </button>
                            <button className="remove-product-button" onClick={handleSetQuantityToZero}>
                                Remove Product
                            </button>
                        </div>
                    )}
                </div>
            )}
            <h3 className="reviews-header">Opinie</h3>
            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review.id} className="review-item">
                        <p>{review.content}</p>
                        <p className="review-rating">Ocena: {review.rating}/5</p>
                        {isAdmin && (
                            <button className="delete-review-button" onClick={() => handleDeleteReview(review.id)}>
                                Delete Review
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <p className="no-reviews-text">Brak opinii dla tego produktu.</p>
            )}
        </div>
    );
};

export default ProductDetails;
