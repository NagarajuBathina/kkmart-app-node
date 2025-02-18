const express = require("express");
const controller = require("../controller/withdrawl");
const router = express.Router();

router.post("/withdrawal_earnings", controller.withdrawalEarnings);
router.get("/get_all_withdrawls_byphone/:phone", controller.getWithdrawls);

module.exports = router;
