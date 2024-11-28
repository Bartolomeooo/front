import React from "react";
import { useParams } from "react-router-dom";

interface Product {
    id: number;
    name: string;
    description: string; // Include description in the interface
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
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ addToCart }) => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = React.useState<Product | null>(null);
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [quantity, setQuantity] = React.useState(1);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const productRes = await fetch(`http://localhost:8080/products/${id}`);
                const reviewRes = await fetch(`http://localhost:8080/reviews/product/${id}`);

                if (!productRes.ok) throw new Error("Failed to fetch product details");
                if (!reviewRes.ok) throw new Error("Failed to fetch reviews");

                const fetchedProduct = await productRes.json();
                const fetchedReviews = await reviewRes.json();

                setProduct(fetchedProduct);
                setReviews(fetchedReviews);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const quantityOptions = product
        ? Array.from({ length: product.quantity }, (_, i) => i + 1)
        : [];

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", textAlign: "center" }}>
            {loading && <p>Ładowanie...</p>}
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
                        <p style={{ marginBottom: "20px" }}>Ilość dostępna: {product.quantity}</p>
                        <div style={{ marginBottom: "20px" }}>
                            <select
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                style={{
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ddd",
                                    fontSize: "1rem",
                                }}
                            >
                                {quantityOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => addToCart(product, quantity)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#28a745",
                                color: "#fff",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                        >
                            Dodaj do koszyka
                        </button>
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
