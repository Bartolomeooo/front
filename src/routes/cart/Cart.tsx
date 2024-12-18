import React, { useState, useEffect } from "react";
import "./Cart.scss";
import { useNavigate } from "react-router-dom";

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
    const [coupon, setCoupon] = useState<string>(""); // Kod kuponu
    const [discount, setDiscount] = useState<number>(0); // Rabat w procentach
    const [couponLoading, setCouponLoading] = useState<boolean>(false);
    const [orderLoading, setOrderLoading] = useState<boolean>(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [orderError, setOrderError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Funkcja do pobrania tokenu z localStorage
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

    // Przywracanie kuponu i rabatu z localStorage
    useEffect(() => {
        const savedCoupon = localStorage.getItem("couponCode");
        const savedDiscount = localStorage.getItem("discount");

        if (savedCoupon && savedDiscount) {
            setCoupon(savedCoupon);
            setDiscount(Number(savedDiscount));
        }
    }, []);

    const handleQuantityChange = (id: number, quantity: number) => {
        const updatedCart = cart.map((item) =>
            item.product.id === id ? { ...item, quantity } : item
        );
        updateCart(updatedCart);
    };

    const handleRemoveProduct = (id: number) => {
        const updatedCart = cart.filter((item) => item.product.id !== id);
        updateCart(updatedCart);
    };

    const handleApplyCoupon = async () => {
        setCouponLoading(true);
        setCouponError(null);

        try {
            const response = await fetch(
                `http://localhost:8080/coupons/validate?code=${coupon}&orderTotal=${total}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Nieprawidłowy kupon.");
            }

            const result = await response.json();
            setDiscount(result.discount); // Rabat w procentach
            localStorage.setItem("couponCode", coupon);
            localStorage.setItem("discount", result.discount.toString());
            alert("Kupon został zastosowany!");
        } catch (err: any) {
            setCouponError(err.message);
            setDiscount(0);
            localStorage.removeItem("couponCode");
            localStorage.removeItem("discount");
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        setOrderLoading(true);
        setOrderError(null);

        try {
            const response = await fetch("http://localhost:8080/orders", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    products: cart.map((item) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                    })),
                    couponCode: discount > 0 ? coupon : null,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || "Nie udało się złożyć zamówienia.");
            }

            alert("Zamówienie złożone pomyślnie!");
            updateCart([]); // Wyczyść koszyk po zamówieniu
            localStorage.removeItem("couponCode");
            localStorage.removeItem("discount");
            navigate("/order-history");
        } catch (err: any) {
            setOrderError(err.message);
        } finally {
            setOrderLoading(false);
        }
    };

    const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const discountedTotal = discount > 0 ? total * (1 - discount / 100) : total;

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
                                    <p>
                                        Cena: {item.product.price.toFixed(2)} PLN
                                    </p>
                                </div>
                                <div className="cart-card-controls">
                                    <select
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleQuantityChange(item.product.id, Number(e.target.value))
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
                                        onClick={() => handleRemoveProduct(item.product.id)}
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
                                disabled={couponLoading || !coupon}
                            >
                                {couponLoading ? "Sprawdzanie..." : "Użyj kodu"}
                            </button>
                            {couponError && <p style={{ color: "red" }}>{couponError}</p>}
                        </div>
                        <div className="cart-summary">
                            <h3>
                                Łączna kwota:{" "}
                                {discount > 0 ? (
                                    <>
                                        <span style={{ textDecoration: "line-through", color: "gray" }}>
                                            {total.toFixed(2)} PLN
                                        </span>{" "}
                                        {discountedTotal.toFixed(2)} PLN
                                    </>
                                ) : (
                                    `${total.toFixed(2)} PLN`
                                )}
                            </h3>
                            <button
                                className="order-button"
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                            >
                                {orderLoading ? "Składanie zamówienia..." : "Złóż zamówienie"}
                            </button>
                            {orderError && <p style={{ color: "red" }}>{orderError}</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
