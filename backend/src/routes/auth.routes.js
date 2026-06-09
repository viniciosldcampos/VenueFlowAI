const express                                    = require("express");
const { register, login, me, changePassword }    = require("../controllers/auth.controller");
const { authenticate }                           = require("../middlewares/auth.middleware");

const router = express.Router();

// rotas públicas
router.post("/register", register);
router.post("/login",    login);

// rotas protegidas
router.get ("/me",              authenticate, me);
router.put ("/change-password", authenticate, changePassword);

module.exports = router;