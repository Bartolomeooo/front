import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProductList from "./routes/product-list/ProductList";
import ProductDetails from "./routes/product-details/ProductDetails";
import Cart from "./routes/cart/Cart";

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

function App() {
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

    const addToCart = (product: Product, quantity: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { product, quantity }];
        });
    };

    const updateCart = (updatedCart: { product: Product; quantity: number }[]) => {
        setCart(updatedCart);
    };

    return (
        <Router>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#007BFF",
                    color: "white",
                    padding: "15px 20px",
                }}
            >
                <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>
                    Produkty
                </Link>
                <Link
                    to="/cart"
                    style={{
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    Koszyk: {cart.reduce((total, item) => total + item.quantity, 0)} elementy
                </Link>
            </header>
            <Routes>
                <Route path="/" element={<ProductList addToCart={addToCart} />} />
                <Route path="/products/:id" element={<ProductDetails addToCart={addToCart} />} />
                <Route path="/cart" element={<Cart cart={cart} updateCart={updateCart} />} />
            </Routes>
        </Router>
    );
}

export default App;
