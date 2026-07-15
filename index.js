import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config"
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import statsRoutes from "./routes/stats.js";

const app = express();

// Middlewares base
app.use(cors());          // permite que el frontend (otro origen) llame a la API
app.use(express.json());  // permite leer JSON en el cuerpo de las peticiones

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "API de Guess The Geo funcionando 🪨" });
});

// Conectar a Mongo y luego arrancar el servidor
const PORT = process.env.PORT || 4000;

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/stats", statsRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✔ Conectado a MongoDB");
    app.listen(PORT, () => {
      console.log(`✔ Servidor en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("X’ Error conectando a MongoDB:", err.message);
    process.exit(1);
  });