const express = require("express");
const { 
        getAll, getById, create,
        update, remove, updateProfile } = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// todas as rotas exigem autenticação
router.use(authenticate);

// perfil do usuário logado
router.get   ("/profile",     updateProfile);
router.put   ("/profile",     updateProfile);

// rotas admin
router.get   ("/", authorize("ADMIN", "OPERATOR"), getAll);
router.post  ("/", authorize("ADMIN"), create);
router.get   ("/:id", authorize("ADMIN", "OPERATOR"), getById);
router.put   ("/:id", authorize("ADMIN"), update);
router.delete("/:id", authorize("ADMIN"), remove);

module.exports = router;