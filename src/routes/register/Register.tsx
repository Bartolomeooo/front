import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Register.scss';

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault(); // Zatrzymaj domyślne przeładowanie strony
        setError(null); // Wyczyść poprzedni błąd
        setSuccess(false); // Wyczyść poprzedni sukces

        try {
            console.log("Sending data:", { username, email, password }); // Debugowanie

            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Rejestracja nie powiodła się. Sprawdź swoje dane.");
                } else {
                    throw new Error("Rejestracja nie powiodła się. Spróbuj ponownie później.");
                }
            }

            // Jeśli rejestracja się powiodła
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000); // Po 2 sekundach przekierowanie
        } catch (err: any) {
            console.error("Error during registration:", err.message);
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Rejestracja</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Nazwa użytkownika"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Zarejestruj się</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>Rejestracja udana! Przekierowywanie...</p>}
            <p>
                Masz już konto? <Link to="/login">Zaloguj się</Link>
            </p>
        </div>
    );
};

export default Register;
