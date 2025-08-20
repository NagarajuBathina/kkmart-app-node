const express = require("express");
const controller = require("../controllers/combo.controller");
const router = express.Router();

router.post("/create_combo", controller.addComboProduct);

module.exports = router;
