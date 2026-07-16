import mongoose from "mongoose";
import "dotenv/config";
import Mineral from "../models/Mineral.js";
import { MINERALS } from "./minerals.js";

async function subir() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✔ Conectado a MongoDB");

    // Limpiar la colección antes de subir (para no duplicar)
    await Mineral.deleteMany({});
    console.log("✔ Colección de minerales vaciada");

    // Insertar todos los minerales
    const insertados = await Mineral.insertMany(MINERALS);
    console.log(`✔ ${insertados.length} minerales subidos a Mongo`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error subiendo minerales:", err.message);
    process.exit(1);
  }
}

subir();