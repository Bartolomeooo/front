import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Login.scss';

interface LoginProps {
    setIsAuthenticated: (authenticated: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Zapobiegaj domyślnemu zachowaniu formularza
        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Nieprawidłowy login lub hasło.");
                } else {
                    throw new Error("Logowanie nie powiodło się.");
                }
            }

            const data = await response.json();
            localStorage.setItem("token", data.token); // Przechowaj token w localStorage
            setIsAuthenticated(true); // Ustaw zalogowanie
            navigate("/"); // Przekierowanie na stronę główną
        } catch (error: any) {
            console.error(error.message);
            setError(error.message);
        }
    };

    // Zwrot elementu JSX musi być w ciele funkcji Login
    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Zaloguj</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p>
                Nie masz konta? <Link to="/register">Zarejestruj się</Link>
            </p>
        </div>
    );
};

export default Login;
