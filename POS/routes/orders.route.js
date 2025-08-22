const express = require("express");
const router = express.Router();
const { checkout, getAllOrders, getSalesList, getSalesDetailsById } = require("../controllers/orders.controller");

router.post("/checkout", checkout);
router.post("/get_all_orders", getAllOrders);
router.get("/get_sales_list", getSalesList);
router.get("/get_sales_details/:id", getSalesDetailsById);

module.exports = router;
