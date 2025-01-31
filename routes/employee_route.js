const express = require("express");
const controller = require("../controller/employees");
const router = express.Router();

router.post("/create-employee", controller.createEmployee);
router.post("/login", controller.loginEmployee);
router.post("/employee-details", controller.getEmployeeDetails);
router.post("/change-password", controller.changePassword);
module.exports = router;
