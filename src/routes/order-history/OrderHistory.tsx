import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./OrderHistory.scss";

interface Order {
    id: number;
    total?: number;
    createdAt: string;
    products: string[];
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("http://localhost:8080/orders", {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error("Nie udało się pobrać historii zamówień.");
                }

                const data: Order[] = await response.json();
                setOrders(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="order-history-container">
            <h1>Historia zamówień</h1>
            {loading && <p>Ładowanie...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {orders.length > 0 ? (
                <div className="order-list">
                    {orders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <div>
                                <h2>ID Zamówienia: {order.id}</h2>
                                <p>
                                    Łączna kwota:{" "}
                                    {order.total !== undefined
                                        ? `${order.total.toFixed(2)} PLN`
                                        : "Brak danych"}
                                </p>
                                <p>Data: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Link className="order-details-link" to={`/orders/${order.id}`}>
                                    Zobacz szczegóły
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Brak zamówień do wyświetlenia.</p>
            )}

        </div>
    );
};

export default OrderHistory;
