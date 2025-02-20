const express = require("express");
const controller = require("../controller/level");
const router = express.Router();

router.get("/getMMA_list/:refferalCode", controller.getMMAlist);
router.post("/get_mma_level_list", controller.getMMAlevelsList);

module.exports = router;
