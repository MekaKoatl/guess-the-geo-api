import express from "express";
import Game from "../models/Game.js";
import User from "../models/User.js";

const router = express.Router();


// GET /api/share/:username/:fecha — resultado público de una partida
router.get("/:username/:fecha", async (req, res) => {
  try {
    const { username, fecha } = req.params;

    // Buscar el usuario 
    const user = await User.findOne({ username }).select("_id username");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Buscar su partida 
    const partida = await Game.findOne({ userId: user._id, fecha });
    if (!partida) {
      return res.status(404).json({ error: "Sin partida esa fecha." });
    }

    // 
    const patron = partida.guesses.map((g) => g.estado); // 

    res.json({
      username: user.username,
      fecha: partida.fecha,
      estado: partida.estado, // ganado | perdido | jugando
      intentos: partida.guesses.length,
      patron,
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

export default router;