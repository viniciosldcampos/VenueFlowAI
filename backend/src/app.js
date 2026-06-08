const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
require("dotenv").config();

const app = express();

// ─── MIDDLEWARES GLOBAIS ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROTA DE HEALTH CHECK ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status:  "ok",
    message: "VenueFlow API funcionando!",
    version: "1.0.0",
    env:     process.env.NODE_ENV,
  });
});

// ─── ROTA 404 ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ─── HANDLER DE ERROS ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

module.exports = app;