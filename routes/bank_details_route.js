const express = require("express");
const controller = require("../controller/bank_details");
const router = express.Router();

router.post("/upload_bank_details", controller.uploadBankDetails);
router.get("/fetch_bank_details/:refferel_code", controller.fetchBankDetailsById);

module.exports = router;
