import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    setIsAuthenticated: (authenticated: boolean) => void;
    setRole: (role: string | null) => void; // Dodajemy setRole jako właściwość
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated, setRole }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Reset błędu przed logowaniem

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
            localStorage.setItem("token", data.token); // Zapisz token
            localStorage.setItem("role", data.role); // Zapisz rolę
            console.log("Role from backend:", data.role);

            setIsAuthenticated(true);
            setRole(data.role); // Ustaw rolę w stanie
            navigate("/"); // Przekierowanie na stronę główną
        } catch (err: any) {
            setError(err.message);
        }
    };

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
        </div>
    );
};

export default Login;
