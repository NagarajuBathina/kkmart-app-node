const express = require("express");
const controller = require("../controller/withdrawl");
const router = express.Router();

router.post("/withdrawal_earnings", controller.withdrawalEarnings);
router.get("/get_all_withdrawls_byphone/:phone", controller.getWithdrawls);
router.post("/update_withdrawl_status", controller.updateWithdrawlStatus);

module.exports = router;
