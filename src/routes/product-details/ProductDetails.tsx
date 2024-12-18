import React from "react";
import { useParams } from "react-router-dom";

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
    isAdmin: boolean; // Dodano do sprawdzania, czy użytkownik jest adminem
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

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", textAlign: "center" }}>
            {loading && <p>Ładowanie...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loading && product && (
                <>
                    <div
                        style={{
                            padding: "20px",
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            backgroundColor: "#fff",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            textAlign: "center",
                        }}
                    >
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
                                <button onClick={handleUpdateProduct}>Zapisz zmiany</button>
                            </>
                        ) : (
                            <>
                                <h1>{product.name}</h1>
                                <p
                                    style={{
                                        fontStyle: "italic",
                                        color: "#555",
                                        margin: "10px 0 20px",
                                    }}
                                >
                                    {product.description}
                                </p>
                                <p style={{ fontSize: "1.2rem", margin: "10px 0" }}>
                                    Cena: <strong>{product.price} PLN</strong>
                                </p>
                                <p style={{ marginBottom: "20px" }}>
                                    Ilość dostępna: {product.quantity}{" "}
                                    {product.quantity === 0 && (
                                        <span style={{ color: "red", fontWeight: "bold" }}>Produkt niedostępny</span>
                                    )}
                                </p>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <button onClick={() => setEditMode(!editMode)}>
                                    {editMode ? "Anuluj" : "Edytuj produkt"}
                                </button>
                                <button onClick={handleSetQuantityToZero} style={{ marginLeft: "10px" }}>
                                    Usuń produkt
                                </button>
                            </>
                        )}
                    </div>
                    <h3 style={{ marginTop: "30px" }}>Opinie</h3>
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div
                                key={review.id}
                                style={{
                                    margin: "10px 0",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "5px",
                                    backgroundColor: "#f9f9f9",
                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <p>{review.content}</p>
                                <p style={{ fontWeight: "bold" }}>Ocena: {review.rating}/5</p>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        style={{ backgroundColor: "red", color: "white", border: "none" }}
                                    >
                                        Usuń opinię
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>Brak opinii dla tego produktu.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductDetails;
