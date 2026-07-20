import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config"
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import statsRoutes from "./routes/stats.js";
import shareRoutes from "./routes/share.js";
import mineralRoutes from "./routes/minerals.js";

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
app.use("/api/share", shareRoutes);
app.use("/api/minerals", mineralRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✔ Conectado a MongoDB");
    app.listen(PORT, () => {
      console.log(`✔ Servidor en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err.message);
    process.exit(1);
  });