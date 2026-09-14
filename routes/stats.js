import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.use(auth); // todas requieren login

// Fecha de hoy en UTC ("2026-07-14")
function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/stats — devuelve las stats del usuario
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("stats");
    res.json(user.stats);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

// POST /api/stats/registrar — registra el resultado de la partida de HOY
router.post("/registrar", async (req, res) => {
  try {
    const { gano, intentos } = req.body;

    const user = await User.findById(req.user.id);
    const stats = user.stats;
    const hoy = fechaHoy();

    // Si ya se registró hoy, no duplicar
    if (stats.ultimaFecha === hoy) {
      return res.json(stats);
    }

    // ¿La última partida fue ayer? Entonces la racha continúa
    const ayer = new Date();
    ayer.setUTCDate(ayer.getUTCDate() - 1);
    const fueAyer = stats.ultimaFecha === ayer.toISOString().slice(0, 10);

    stats.jugadas += 1;

    if (gano) {
      stats.ganadas += 1;
      stats.racha = fueAyer ? stats.racha + 1 : 1;
      stats.mejorRacha = Math.max(stats.mejorRacha, stats.racha);
      if (intentos >= 1 && intentos <= 6) {
        stats.distribucion[intentos - 1] += 1;
      }
    } else {
      stats.racha = 0;
    }

    stats.ultimaFecha = hoy;

    user.markModified("stats"); // avisar a Mongoose de que el sub-objeto cambió
    await user.save();

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

// POST /api/stats/importar — sube stats locales SOLO si la cuenta no tiene progreso
router.post("/importar", async (req, res) => {
  try {
    const { stats } = req.body;
    if (!stats) return res.status(400).json({ error: "Faltan stats." });

    const user = await User.findById(req.user.id);

    // Solo migrar a cuentas sin progreso, para no pisar datos reales
    if (user.stats.jugadas > 0) {
      return res.json(user.stats); // ya tiene datos: no tocar
    }

    // Normalizar cada campo numérico y validar la distribución
    const distribucion = Array.isArray(stats.distribucion)
      ? Array.from({ length: 6 }, (_, i) => {
          const n = Number(stats.distribucion[i]);
          return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
        })
      : [0, 0, 0, 0, 0, 0];

    const aNumero = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    };

    const fechaValida =
      typeof stats.ultimaFecha === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(stats.ultimaFecha)
        ? stats.ultimaFecha
        : null;

    user.stats = {
      jugadas: aNumero(stats.jugadas),
      ganadas: aNumero(stats.ganadas),
      racha: aNumero(stats.racha),
      mejorRacha: aNumero(stats.mejorRacha),
      ultimaFecha: fechaValida,
      distribucion,
    };
    user.markModified("stats");
    await user.save();
    res.json(user.stats);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

export default router;