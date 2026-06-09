const express = require("express");
const {
  getAll, getById, create, confirm, cancel, refund,
} = require("../controllers/reservation.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get  ("/",           getAll);
router.get  ("/:id",        getById);
router.post ("/",           create);
router.put  ("/:id/confirm",authorize("ADMIN", "OPERATOR"), confirm);
router.put  ("/:id/cancel", cancel);
router.put  ("/:id/refund", authorize("ADMIN", "OPERATOR"), refund);

module.exports = router;