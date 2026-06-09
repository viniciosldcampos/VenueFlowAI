const express = require("express");
const {
  join, getByEvent, callNext, convert, leave, myPosition,
} = require("../controllers/waitlist.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

// cliente entra na fila
router.post("/", join);

// minha posição na fila
router.get ("/my-position/:eventId", myPosition);

// sair da fila
router.put ("/:id/leave", leave);

// admin/operador
router.get ("/event/:eventId", authorize("ADMIN", "OPERATOR"), getByEvent);
router.put ("/event/:eventId/call-next", authorize("ADMIN", "OPERATOR"), callNext);
router.put ("/:id/convert", authorize("ADMIN", "OPERATOR"), convert);

module.exports = router;