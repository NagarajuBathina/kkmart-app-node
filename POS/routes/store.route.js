const express = require("express");
const router = express.Router();
// const { authenticateToken, authorizeRole } = require("../../middleware/auth_middleware.js");
const { createStore, getallStores, getStoreById, updateStoreById } = require("../controllers/store.controller.js");

router.post("/create_stores", createStore);
router.get("/get_all_stores", getallStores);
router.get("/get_store_by_id/:store_id", getStoreById);
router.put("/update_store_by_id/:store_id", updateStoreById);

module.exports = router;
