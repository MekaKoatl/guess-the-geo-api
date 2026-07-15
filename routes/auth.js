import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/register — crear un usuario nuevo
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación mínima
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    // ¿Ya existe ese email o username?
    const existe = await User.findOne({ $or: [{ email }, { username }] });
    if (existe) {
      return res.status(409).json({ error: "El usuario o email ya existe." });
    }

    // Hashear la contraseña (nunca se guarda en texto plano)
    const hash = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await User.create({ username, email, password: hash });

    // Responder SIN la contraseña
    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

import jwt from "jsonwebtoken";

// POST /api/auth/login — iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan email o contraseña." });
    }

    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Comparar la contraseña con el hash guardado
    const coincide = await bcrypt.compare(password, user.password);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    // Crear el token (válido 7 días)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});


// GET /api/auth/me — devuelve el usuario actual (ruta protegida)
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
