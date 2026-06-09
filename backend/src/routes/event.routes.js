const express = require("express");
const {
  getAll, getById, create, update, remove,
  addTicket, getSeatMap,
} = require("../controllers/event.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

// rotas públicas para usuários autenticados
router.get("/",              getAll);
router.get("/:id",           getById);
router.get("/:id/seat-map",  getSeatMap);

// rotas admin/operador
router.post  ("/",           authorize("ADMIN"),             create);
router.put   ("/:id",        authorize("ADMIN"),             update);
router.delete("/:id",        authorize("ADMIN"),             remove);
router.post  ("/:id/tickets",authorize("ADMIN"),             addTicket);

module.exports = router;