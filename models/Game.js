import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fecha: {
      type: String, // "2026-07-14"
      required: true,
    },
    guesses: {
      type: Array, // los intentos: [{ nombre, estado, similares, imagen }]
      default: [],
    },
    estado: {
      type: String, // jugando | ganado | perdido
      default: "jugando",
    },
  },
  { timestamps: true },
);

// Un usuario solo puede tener UNA partida por fecha
gameSchema.index({ userId: 1, fecha: 1 }, { unique: true });

export default mongoose.model("Game", gameSchema);