const { where } = require("sequelize");
const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    let { adhaar, phone } = req.body;

    const existingAdhaar = await Employee.findOne({ where: { adhaar } });
    if (existingAdhaar) {
      console.log("Aadhaar already exists:", adhaar);
      return res.status(400).json({ error: "Aadhaar already exists." });
    }
    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      console.log("Phone already exists:", phone);
      return res.status(400).json({ error: "Phone already exists." });
    }

    // const checkJoindedBy = await Employee.findOne({ where: { refferel_code: joined_by } });
    // if (!checkJoindedBy) {
    //   return res.status(400).json({ error: "Invalid refferel id" });
    // }

    // const { ...joinedbyDetails } = checkJoindedBy.dataValues;
    // let newEmployee;

    // if (role === "mma" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma")) {
    //   req.body.position = 1 + (joinedbyDetails.mma_count || 0);
    //   console.log("hello");
    //   newEmployee = await Employee.create(req.body);
    //   await Employee.update(
    //     { mma_count: (joinedbyDetails.mma_count || 0) + 1 },
    //     { where: { refferel_code: req.body.joined_by } }
    //   );
    //   await updateRole(joined_by, Employee);
    // } else if (role === "jma" && joinedbyDetails.role === "sma") {
    //   console.log("hello1");
    //   req.body.position = 1 + (joinedbyDetails.jma_count || 0);
    //   newEmployee = await Employee.create(req.body);
    //   await Employee.update(
    //     { jma_count: (joinedbyDetails.jma_count || 0) + 1 },
    //     { where: { refferel_code: req.body.joined_by } }
    //   );
    // } else if (role === "sma" && joinedbyDetails.role !== "jma") {
    //   console.log("hello2");
    //   req.body.position = 1 + (joinedbyDetails.sma_count || 0);
    //   newEmployee = await Employee.create(req.body);
    //   await Employee.update(
    //     { sma_count: (joinedbyDetails.sma_count || 0) + 1 },
    //     { where: { refferel_code: req.body.joined_by } }
    //   );
    // } else {
    //   return res.status(400).json({ error: "User can't be joined under this referral id" });
    // }

    let newEmployee = await Employee.create(req.body);
    return res.status(201).json({ success: true, employee: newEmployee });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

const updateRole = async (joinedBy, employee) => {
  const checkJoindedBy = await employee.findOne({ where: { refferel_code: joinedBy } });
  const { ...joinedbyDetails } = checkJoindedBy.dataValues;
  if (joinedbyDetails.mma_count === 5) {
    await employee.update({ role: "dmh" }, { where: { refferel_code: joinedBy } });
  } else if (joinedbyDetails.mma_count === 30) {
    await employee.update({ role: "zmh" }, { where: { refferel_code: joinedBy } });
  } else if (joinedbyDetails.mma_count === 105) {
    await employee.update({ role: "smh" }, { where: { refferel_code: joinedBy } });
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
