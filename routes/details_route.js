const express = require("express");
const controller = require("../controller/details");
const router = express.Router();

router.post("/get-jma-details", controller.getJMAdetails);

module.exports = router;
