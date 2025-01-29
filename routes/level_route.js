const express = require("express");
const controller = require("../controller/level");
const router = express.Router();

router.post("/getMMA-list", controller.getMMAlist);

module.exports = router;
