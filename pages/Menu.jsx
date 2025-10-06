import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const imagenesCarrusel = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80",
];

function Menu() {
  const [carruselIdx, setCarruselIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCarruselIdx(idx => (idx + 1) % imagenesCarrusel.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{
          width: "100%",
          height: 220,
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 16,
          boxShadow: "0 4px 24px rgba(124, 58, 237, 0.08)"
        }}>
          <img
            src={imagenesCarrusel[carruselIdx]}
            alt="Personas trabajando"
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.7s" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          {imagenesCarrusel.map((_, idx) => (
            <button
              key={idx}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: "none",
                background: idx === carruselIdx ? "#7c3aed" : "#ede9fe",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onClick={() => setCarruselIdx(idx)}
              aria-label={`Imagen ${idx + 1}`}
            />
          ))}
        </div>
        <h1 style={{ color: "#7c3aed", fontWeight: 800, fontSize: "2rem", marginBottom: 8 }}>
          Sistema de Horas Trabajadas
        </h1>
        <p style={{ color: "#444", marginBottom: 24 }}>
          Organiza y controla las horas trabajadas de tu equipo de manera simple y eficiente.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button className="button" style={{ width: 140 }} onClick={() => navigate("/login")}>
            Iniciar Sesión
          </button>
          <button className="button button-green" style={{ width: 140 }} onClick={() => navigate("/registro")}>
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;