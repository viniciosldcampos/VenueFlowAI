const express = require("express");
const {
  getAll, getById, create, update, remove,
  saveLayout, getSectors, createSector,
} = require("../controllers/room.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

// rotas públicas para usuários autenticados
router.get("/",    getAll);
router.get("/:id", getById);

// rotas admin/operador
router.post  ("/",               authorize("ADMIN"),              create);
router.put   ("/:id",            authorize("ADMIN"),              update);
router.delete("/:id",            authorize("ADMIN"),              remove);
router.put   ("/:id/layout",     authorize("ADMIN"),              saveLayout);
router.get   ("/:id/sectors",    authorize("ADMIN", "OPERATOR"),  getSectors);
router.post  ("/:id/sectors",    authorize("ADMIN"),              createSector);

module.exports = router;