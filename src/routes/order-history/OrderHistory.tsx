import React, { useEffect, useState } from "react";

interface Order {
    id: number;
    date: string;
    totalAmount: number;
    items: { product: { name: string }; quantity: number }[];
}

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("http://localhost:8080/orders", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch orders.");
                }

                const data = await response.json();
                setOrders(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>Order History</h1>
            {orders.length > 0 ? (
                orders.map((order) => (
                    <div key={order.id}>
                        <h2>Order #{order.id}</h2>
                        <p>Date: {order.date}</p>
                        <p>Total: {order.totalAmount} PLN</p>
                        <ul>
                            {order.items.map((item, index) => (
                                <li key={index}>
                                    {item.product.name} - {item.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No orders found.</p>
            )}
        </div>
    );
};

export default OrderHistory;