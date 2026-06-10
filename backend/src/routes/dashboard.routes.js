const express = require("express");
const { getStats, getFinancial, getOccupancy } = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticate);
router.use(authorize("ADMIN", "OPERATOR"));

router.get("/stats",     getStats);
router.get("/financial", getFinancial);
router.get("/occupancy", getOccupancy);

module.exports = router;