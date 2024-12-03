import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import ProductList from "./routes/product-list/ProductList";
import ProductDetails from "./routes/product-details/ProductDetails";
import Cart from "./routes/cart/Cart";
import Login from "./routes/Login/Login";
import Register from "./routes/Register/Register";
import OrderHistory from "./routes/order-history/OrderHistory";

<Route path="/order-history" element={<OrderHistory />} />

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

const Header: React.FC<{ isAuthenticated: boolean; cartItems: number; handleLogout: () => void }> = ({
                                                                                                         isAuthenticated,
                                                                                                         cartItems,
                                                                                                         handleLogout,
                                                                                                     }) => {
    const location = useLocation();

    // Ukryj header na stronach logowania i rejestracji
    if (location.pathname === "/login" || location.pathname === "/register") {
        return null;
    }

    return (
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
            <div>
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/cart"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: "bold",
                                marginRight: "15px",
                            }}
                        >
                            Koszyk: {cartItems} elementy
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: "transparent",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "none", // Dodaj brakujący styl
                                padding: "0", // Usuń padding przycisku
                                fontSize: "15px",
                            }}
                        >
                            Wyloguj się
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        Zaloguj się
                    </Link>
                )}
            </div>
        </header>
    );
};

function App() {
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));

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

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <Header
                isAuthenticated={isAuthenticated}
                cartItems={cart.reduce((total, item) => total + item.quantity, 0)}
                handleLogout={handleLogout}
            />
            <Routes>
                {isAuthenticated ? (
                    <>
                        <Route path="/" element={<ProductList addToCart={addToCart} />} />
                        <Route path="/products/:id" element={<ProductDetails addToCart={addToCart} />} />
                        <Route path="/cart" element={<Cart cart={cart} updateCart={updateCart} />} />
                    </>
                ) : (
                    <>
                        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
