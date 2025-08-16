const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller");

router.post("/create_user", controller.createUser);
router.get("/get_all_users", controller.getAllUsers);
router.put("/update_user/:id", controller.updateUser);

module.exports = router;
