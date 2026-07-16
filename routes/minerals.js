import express from "express";
import Mineral from "../models/Mineral.js";

const router = express.Router();

// GET /api/minerals — todos los minerales (para el juego)
router.get("/", async (req, res) => {
  try {
    const minerales = await Mineral.find();
    res.json(minerales);
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

export default router;