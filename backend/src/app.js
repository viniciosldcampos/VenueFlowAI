const express            = require("express");
const cors               = require("cors");
const helmet             = require("helmet");
require("dotenv").config();

const authRoutes        = require("./routes/auth.routes");
const userRoutes        = require("./routes/user.routes");
const roomRoutes        = require("./routes/room.routes");
const eventRoutes       = require("./routes/event.routes");
const reservationRoutes = require("./routes/reservation.routes");

const app = express();

app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    status:  "ok",
    message: "VenueFlow API funcionando!",
    version: "1.0.0",
    env:     process.env.NODE_ENV,
  });
});

app.use("/api/auth",         authRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/rooms",        roomRoutes);
app.use("/api/events",       eventRoutes);
app.use("/api/reservations", reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

module.exports = app;