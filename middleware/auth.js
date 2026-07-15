import jwt from "jsonwebtoken";

// Verifica el token JWT que viene en la cabecera Authorization
export default function auth(req, res, next) {
  // El token llega como: "Authorization: Bearer <token>"
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Falta el token de autenticación." });
  }

  const token = cabecera.split(" ")[1]; // quedarse con la parte del token

  try {
    // Verificar que el token es válido y no ha expirado
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // guardar los datos del usuario en la petición
    next(); // dejar pasar a la ruta
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}