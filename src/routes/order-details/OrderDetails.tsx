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

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleToggleReview = (productId: number) => {
        setExpanded((prev) => ({
            ...prev,
            [productId]: !prev[productId],
        }));
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
                                ></textarea>
                                <select className="review-rating">
                                    <option value="">Wybierz ocenę</option>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <option key={rating} value={rating}>
                                            {rating} gwiazdek
                                        </option>
                                    ))}
                                </select>
                                <button className="submit-review-button">
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
