import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
} from "react-router-dom";
import ProductList from "./routes/product-list/ProductList";
import ProductDetails from "./routes/product-details/ProductDetails";
import Cart from "./routes/cart/Cart";
import Login from "./routes/login/Login";
import Register from "./routes/register/Register";
import CreateProduct from "./routes/create-product/CreateProduct";
import OrderHistory from "./routes/order-history/OrderHistory";
import OrderDetails from "./routes/order-details/OrderDetails";


interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
        []
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        if (token) {
            setIsAuthenticated(true);
            setRole(userRole);
        }
    }, []);

    const addToCart = (product: Product, quantity: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (item) => item.product.id === product.id
            );
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

    const isAdmin = role === "ADMIN";

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsAuthenticated(false);
        setRole(null);
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
                <Link
                    to="/"
                    style={{
                        color: "white",
                        textDecoration: "none",
                        fontWeight: "bold",
                    }}
                >
                    Produkty
                </Link>
                {isAuthenticated ? (
                    <div style={{ display: "flex", gap: "15px" }}>
                        <Link
                            to="/order-history"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: "bold",
                            }}
                        >
                            Historia zamówień
                        </Link>
                        <Link
                            to="/cart"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: "bold",
                            }}
                        >
                            Koszyk: {cart.reduce((total, item) => total + item.quantity, 0)}{" "}
                            elementy
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/create-product"
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                }}
                            >
                                Dodaj produkt
                            </Link>
                        )}
                        <button
                            onClick={logout}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "white",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "16px"
                            }}
                        >
                            Wyloguj się
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: "15px" }}>
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
                        <Link
                            to="/register"
                            style={{
                                color: "white",
                                textDecoration: "none",
                                fontWeight: "bold",
                            }}
                        >
                            Zarejestruj się
                        </Link>
                    </div>
                )}
            </header>
            <Routes>
                {!isAuthenticated ? (
                    <>
                        <Route
                            path="/login"
                            element={
                                <Login
                                    setIsAuthenticated={setIsAuthenticated}
                                    setRole={setRole}
                                />
                            }
                        />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                ) : (
                    <>
                        <Route
                            path="/"
                            element={<ProductList addToCart={addToCart} isAdmin={isAdmin} />}
                        />
                        <Route
                            path="/products/:id"
                            element={<ProductDetails addToCart={addToCart} isAdmin={role === "ADMIN"} />}
                        />

                        <Route path="/orders/:id" element={<OrderDetails />} />
                        <Route
                            path="/cart"
                            element={<Cart cart={cart} updateCart={updateCart} />}
                        />
                        <Route path="/order-history" element={<OrderHistory />} />
                        {isAdmin && (
                            <Route path="/create-product" element={<CreateProduct />} />
                        )}
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                )}
            </Routes>
        </Router>
    );
}

export default App;
