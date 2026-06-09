const express = require("express");
const {
  doCheckin, getByCode, getByEvent, getByUser,
} = require("../controllers/checkin.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "OPERATOR"), doCheckin);
router.get ("/code/:code", authorize("ADMIN", "OPERATOR"), getByCode);
router.get ("/event/:eventId", authorize("ADMIN", "OPERATOR"), getByEvent);
router.get ("/my-history", getByUser);
router.get ("/user/:userId", authorize("ADMIN"), getByUser);

module.exports = router;