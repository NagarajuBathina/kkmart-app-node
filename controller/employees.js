const { where } = require("sequelize");
const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  console.log(req.body);
  try {
    const { Employee } = await connectTodb();
    const { adhaar, phone } = req.body;

    const existingAdhaar = await Employee.findOne({ where: { adhaar } });
    if (existingAdhaar) {
      return res.status(400).json({ error: "Aadhaar already exists." });
    }
    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone already exists." });
    }

    const newEmployee = await Employee.create(req.body);
    return res.status(201).json({ success: true, employee: newEmployee });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

//login employee
const loginEmployee = async (req, res) => {
  console.log(req.body);
  try {
    const { Employee } = await connectTodb();
    const { adhaar, password } = req.body;

    const employee = await Employee.findOne({ where: { adhaar, password } });
    if (!employee) {
      return res.status(401).json({ error: "invalid adhaar or password" });
    }

    const { password: _, ...employeeDetails } = employee.dataValues;
    console.log(employeeDetails);
    return res.status(200).json(employeeDetails);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
};

// get employee details
const getEmployeeDetails = async (req, res) => {
  console.log(req.body);
  try {
    const { Employee } = await connectTodb();
    const { adhaar } = req.body;

    const employee = await Employee.findOne({ where: { adhaar } });
    if (!employee) {
      return res.status(401).json({ error: "wrong adhaar" });
    }

    const { password: _, ...employeeDetails } = employee.dataValues;
    console.log(employeeDetails);
    return res.status(200).json(employeeDetails);
  } catch (e) {}
};

module.exports = { createEmployee, loginEmployee, getEmployeeDetails };
