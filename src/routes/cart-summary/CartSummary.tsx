import React from "react";
import "./CartSummary.scss";

interface CartItem {
    product: { id: number; name: string; price: number; quantity: number };
    quantity: number;
}

interface CartSummaryProps {
    cart: CartItem[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ cart }) => {
    const totalAmount = cart.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

    return (
        <div className="cart-summary">
            <h3>Podsumowanie koszyka</h3>
            {cart.map((item, index) => (
                <div key={index}>
                    {item.product.name} - {item.quantity} x {item.product.price} PLN
                </div>
            ))}
            {cart.length > 0 && (
                <div className="cart-total">
                    <p>Łączna kwota: {totalAmount} PLN</p>
                </div>
            )}
        </div>
    );
};

export default CartSummary;
