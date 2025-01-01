import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./OrderDetails.scss";

interface Product {
    id: number;
    name: string;
    price: number;
}

interface OrderProduct {
    product: Product;
    quantity: number;
}

interface Order {
    id: number;
    totalPrice: number;
    orderDate: string;
    orderProducts: OrderProduct[];
}

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
    const [reviews, setReviews] = useState<{ [key: number]: { content: string; rating: number } }>({});

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

    const handleToggleReview = (productId: number) => {
        setExpanded((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    const handleReviewChange = (productId: number, field: "content" | "rating", value: string | number) => {
        setReviews((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            },
        }));
    };

    const handleSubmitReview = async (productId: number) => {
        const review = reviews[productId];
        if (!review || !review.content || !review.rating) {
            alert("Proszę wypełnić treść opinii i wybrać ocenę.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/reviews", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    productId: productId,
                    content: review.content,
                    rating: review.rating,
                }),
            });

            if (!response.ok) {
                throw new Error("Nie udało się wysłać opinii.");
            }

            alert("Opinia została pomyślnie dodana.");
            setReviews((prev) => ({
                ...prev,
                [productId]: { content: "", rating: 0 },
            }));
            setExpanded((prev) => ({ ...prev, [productId]: false }));
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd podczas wysyłania opinii.");
        }
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/orders/${id}`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error("Nie udało się pobrać szczegółów zamówienia.");
                }

                const data: Order = await response.json();
                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="order-details-container">
            <h1>Szczegóły zamówienia #{order?.id}</h1>
            <p>
                <strong>Łączna kwota:</strong> {order?.totalPrice.toFixed(2)} PLN
            </p>
            <p>
                <strong>Data zamówienia:</strong>{" "}
                {order?.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Nieznana"}
            </p>
            <h2>Produkty:</h2>
            <ul className="product-list">
                {order?.orderProducts.map((item) => (
                    <li key={item.product.id} className="product-item">
                        <div className="product-info">
                            <strong>{item.product.name}</strong> - {item.quantity} szt. x{" "}
                            {item.product.price.toFixed(2)} PLN ={" "}
                            <strong>
                                {(item.quantity * item.product.price).toFixed(2)} PLN
                            </strong>
                        </div>
                        <button
                            className="toggle-button"
                            onClick={() => handleToggleReview(item.product.id)}
                        >
                            Dodaj opinię{" "}
                            <span className={`arrow ${expanded[item.product.id] ? "up" : "down"}`}>
                                {expanded[item.product.id] ? "▲" : "▼"}
                            </span>
                        </button>
                        {expanded[item.product.id] && (
                            <div className="review-form">
                                <textarea
                                    placeholder="Napisz swoją opinię..."
                                    className="review-input"
                                    value={reviews[item.product.id]?.content || ""}
                                    onChange={(e) =>
                                        handleReviewChange(item.product.id, "content", e.target.value)
                                    }
                                ></textarea>
                                <select
                                    className="review-rating-order"
                                    value={reviews[item.product.id]?.rating || ""}
                                    onChange={(e) =>
                                        handleReviewChange(
                                            item.product.id,
                                            "rating",
                                            Number(e.target.value)
                                        )
                                    }
                                >
                                    <option value="">Wybierz ocenę</option>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <option key={rating} value={rating}>
                                            {rating} gwiazdek
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className="submit-review-button"
                                    onClick={() => handleSubmitReview(item.product.id)}
                                >
                                    Wyślij opinię
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderDetails;
