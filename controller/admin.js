const connectTodb = require("../misc/db");
const { where } = require("sequelize");

const allEmployeesData = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const allData = await Employee.findAll({
      order: [["addedon", "DESC"]],
    });

    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allCustomersData = async (req, res) => {
  try {
    const { Customer } = await connectTodb();
    const allData = await Customer.findAll({ oders: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allMonthlyRenewalsData = async (req, res) => {
  try {
    const { Renewal } = await connectTodb();
    const allData = await Renewal.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allWithdrawlsData = async (req, res) => {
  try {
    const { Withdrawal } = await connectTodb();
    const allData = await Withdrawal.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const allEmployeesPayments = async (req, res) => {
  try {
    const { EmployeePayment } = await connectTodb();
    const allData = await EmployeePayment.findAll({ order: [["addedon", "DESC"]] });
    if (!allData || allData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({
      success: true,
      count: allData.length,
      data: allData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
module.exports = {
  allEmployeesData,
  allMonthlyRenewalsData,
  allCustomersData,
  allWithdrawlsData,
  allEmployeesPayments,
};
