import mongoose from "mongoose";

// Estructura flexible: refleja lo que ya tienes en minerals.js
const mineralSchema = new mongoose.Schema({
  idNum: { type: Number, index: true },
  id: { type: String, unique: true }, // slug: "cuarzo", "amatista"...
  nombre: { type: String, required: true },
  tipo: { type: String }, // "mineral" | "roca"
  imagen: { type: String },
  familia: { type: String, default: "" },
  color: { type: String, default: "" },
  sistema: { type: String, default: "" },
  densidad: { type: String, default: "" },
  brillo: { type: String, default: "" },
  raya: { type: String, default: "" },
  // campos de roca
  rocaTipo: { type: String, default: "" },
  textura: { type: String, default: "" },
  composicion: { type: String, default: "" },
  // las pistas ya construidas
  pistas: { type: [String], default: [] },
});

export default mongoose.model("Mineral", mineralSchema);