const express = require("express");
const controller = require("../controller/level");
const router = express.Router();

router.get("/getMMA-list/:refferalCode", controller.getMMAlist);

module.exports = router;
