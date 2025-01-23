const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  console.log(req.body);
  try {
    const { Employee } = await connectTodb();
    const { adhaar, phone } = req.body;

    const existingAdhaar = await Employee.findOne({ where: { adhaar } });
    if (existingAdhaar) {
      return res.status(400).json({ error: "adhaar already exists." });
    }

    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "phone already exists." });
    }

    const newEmployee = await Employee.create(req.body);
    return res.status(201).json(newEmployee);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
};

const loginEmployee = async (req, res) => {
  console.log(req.body);
  try {
    const { Employee } = await connectTodb();
    const { adhaar, password } = req.body;

    const employee = await Employee.findOne({ where: { adhaar, password } });
    if (!employee) {
      return res.status(401).json({ error: "invalid adhaar or password" });
    }

    const { password: _, ...empployeeDetails } = employee.dataValues;
    console.log(empployeeDetails);
    return res.status(200).json(empployeeDetails);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
};

module.exports = { createEmployee, loginEmployee };
