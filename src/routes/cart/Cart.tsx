import React, { useState } from "react";
import "./Cart.scss";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface CartProps {
    cart: CartItem[];
    updateCart: (updatedCart: CartItem[]) => void;
}

const Cart: React.FC<CartProps> = ({ cart, updateCart }) => {
    const [coupon, setCoupon] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // For showing spinner during updates

    const handleQuantityChange = async (id: number, quantity: number) => {
        setLoading(true); // Start loading
        const updatedCart = cart.map((item) =>
            item.product.id === id
                ? { ...item, quantity }
                : item
        );

        // Simulate delay for updating cart
        setTimeout(() => {
            updateCart(updatedCart);
            setLoading(false); // Stop loading
        }, 500); // Simulate server response delay
    };

    const handleRemoveProduct = (id: number) => {
        const updatedCart = cart.filter((item) => item.product.id !== id);
        updateCart(updatedCart);
    };

    const handleApplyCoupon = () => {
        console.log(`Applying coupon: ${coupon}`);
        // Logic to validate and apply the coupon
    };

    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return (
        <div className="cart-container">
            <h1>Twój koszyk</h1>
            {cart.length === 0 ? (
                <p>Twój koszyk jest pusty.</p>
            ) : (
                <>
                    <div className="cart-items">
                        {cart.map((item) => (
                            <div key={item.product.id} className="cart-card">
                                <div className="cart-card-info">
                                    <h2>{item.product.name}</h2>
                                    <p>Cena: {item.product.price} PLN</p>
                                </div>
                                <div className="cart-card-controls">
                                    <select
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleQuantityChange(
                                                item.product.id,
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        {Array.from(
                                            { length: item.product.quantity },
                                            (_, i) => i + 1
                                        ).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="remove-button"
                                        onClick={() =>
                                            handleRemoveProduct(item.product.id)
                                        }
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-footer">
                        <div className="coupon-container">
                            <input
                                type="text"
                                placeholder="Wpisz kod rabatowy"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                            />
                            <button
                                className="apply-coupon-button"
                                onClick={handleApplyCoupon}
                            >
                                Użyj kodu
                            </button>
                        </div>
                        <div className="cart-summary">
                            <h3>
                                Łączna kwota:{" "}
                                {loading ? (
                                    <span className="spinner"></span> // Show spinner when loading
                                ) : (
                                    `${total} PLN`
                                )}
                            </h3>
                            <button className="order-button">
                                Złóż zamówienie
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
