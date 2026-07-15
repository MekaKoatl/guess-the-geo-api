import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // aquí se guarda el HASH, nunca la contraseña real
    },
    stats: {
      jugadas: { type: Number, default: 0 },
      ganadas: { type: Number, default: 0 },
      racha: { type: Number, default: 0 },
      mejorRacha: { type: Number, default: 0 },
      ultimaFecha: { type: String, default: null },
      distribucion: { type: [Number], default: [0, 0, 0, 0, 0, 0] },
    },
  },
  { timestamps: true }, // añade createdAt y updatedAt automáticamente
);

export default mongoose.model("User", userSchema);
