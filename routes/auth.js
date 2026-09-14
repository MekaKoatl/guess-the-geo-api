import express from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import User from "../models/User.js";
import Game from "../models/Game.js";
import auth from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { enviarCorreoRecuperacion } from "../utils/correo.js";

const router = express.Router();

const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máx 10 intentos por IP en esa ventana
  message: { error: "Demasiados intentos. Intenta de nuevo más tarde." },
});

// POST /api/auth/register — crear un usuario nuevo
router.post("/register", limiteAuth, async (req, res) => {
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


// POST /api/auth/login — iniciar sesión
router.post("/login", limiteAuth, async (req, res) => {
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


// DELETE /api/auth/me — borrar la cuenta del usuario y todas sus partidas
router.delete("/me", auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Falta la contraseña." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Verificar la contraseña antes de borrar
    const coincide = await bcrypt.compare(password, user.password);
    if (!coincide) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // Borrar las partidas del usuario y luego el usuario
    await Game.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ mensaje: "Cuenta eliminada." });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

// POST /api/auth/olvide-password — pide el correo y envía el enlace de recuperación
router.post("/olvide-password", limiteAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Falta el email." });
    }

    const user = await User.findOne({ email });

    // Por seguridad, siempre respondemos igual exista o no el email
    if (!user) {
      return res.json({
        mensaje: "Si el correo existe, se envió un enlace de recuperación.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetExpira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    await enviarCorreoRecuperacion(user.email, token);

    res.json({
      mensaje: "Si el correo existe, se envió un enlace de recuperación.",
    });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

// POST /api/auth/restablecer-password — usa el token del correo para poner nueva contraseña
router.post("/restablecer-password", limiteAuth, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Faltan datos." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres." });
    }

    const user = await User.findOne({
      resetToken: token,
      resetExpira: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Enlace inválido o expirado." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetExpira = null;
    await user.save();

    res.json({ mensaje: "Contraseña actualizada." });
  } catch (err) {
    res.status(500).json({ error: "Error del servidor: " + err.message });
  }
});

export default router;