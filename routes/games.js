import express from "express";
import Game from "../models/Game.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Todas las rutas de aquí requieren estar logueado
router.use(auth);

// POST /api/games — crear o actualizar la partida de una fecha
router.post("/", async (req, res) => {
  try {
    const { fecha, guesses, estado } = req.body;

    if (!fecha) {
      return res.status(400).json({ error: "Falta la fecha." });
    }

    // Buscar la partida de ese usuario y fecha; si existe, actualizar; si no, crear
    const partida = await Game.findOneAndUpdate(
      { userId: req.user.id, fecha },
      { guesses, estado },
      { new: true, upsert: true }, // new: devuelve el actualizado; upsert: crea si no existe
    );

    res.json(partida);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

// GET /api/games — todas las partidas del usuario
router.get("/", async (req, res) => {
  try {
    const partidas = await Game.find({ userId: req.user.id }).sort({ fecha: -1 });
    res.json(partidas);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

export default router;