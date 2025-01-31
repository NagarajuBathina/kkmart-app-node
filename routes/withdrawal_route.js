const express = require("express");
const controller = require("../controller/withdrawl");
const router = express.Router();

router.post("/withdrawal-earnings", controller.withdrawalEarnings);
router.get("/get-all-withdrawls-byphone/:phone", controller.getWithdrawls);

module.exports = router;
