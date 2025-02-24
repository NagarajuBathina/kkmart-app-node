const express = require("express");
const controller = require("../controller/practice");
const router = express.Router();

router.post("/search", controller.searchFunction);

module.exports = router;
