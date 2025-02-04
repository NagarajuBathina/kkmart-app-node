const { where } = require("sequelize");
const fs = require("fs").promises;
const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    let { adhaar, phone, joined_by, role } = req.body;
    console.log(role);

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

    const checkJoindedBy = await Employee.findOne({ where: { refferel_code: joined_by } });
    if (!checkJoindedBy) {
      return res.status(400).json({ error: "Invalid refferel id" });
    }

    const { ...joinedbyDetails } = checkJoindedBy.dataValues;
    console.log(joinedbyDetails);
    let newEmployee;

    if (role === "mma" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma")) {
      req.body.position = 1 + (joinedbyDetails.mma_count || 0);
      newEmployee = await Employee.create(req.body);
      await Employee.update(
        { mma_count: (joinedbyDetails.mma_count || 0) + 1 },
        { where: { refferel_code: joined_by } }
      );
      await updateRole(joined_by, Employee);
    } else if (role === "jma" && joinedbyDetails.role === "sma") {
      req.body.position = 1 + (joinedbyDetails.jma_count || 0);
      newEmployee = await Employee.create(req.body);
      await Employee.update(
        { jma_count: (joinedbyDetails.jma_count || 0) + 1 },
        { where: { refferel_code: joined_by } }
      );
    } else if (role === "sma" && joinedbyDetails.role !== "jma") {
      req.body.position = 1 + (joinedbyDetails.sma_count || 0);
      newEmployee = await Employee.create(req.body);
      await Employee.update(
        { sma_count: (joinedbyDetails.sma_count || 0) + 1 },
        { where: { refferel_code: joined_by } }
      );
    } else {
      return res.status(400).json({ error: "User can't be joined under this referral id" });
    }

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
  try {
    const { Employee } = await connectTodb();
    const { adhaar, password } = req.body;

    const employee = await Employee.findOne({ where: { adhaar, password } });
    if (!employee) {
      return res.status(401).json({ error: "Invalid adhaar or password" });
    }

    const { ...employeeDetails } = employee.dataValues;
    return res.status(200).json(employeeDetails);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
};

// get employee details
const getEmployeeDetails = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { adhaar } = req.body;

    const employee = await Employee.findOne({ where: { adhaar } });
    if (!employee) {
      return res.status(401).json({ error: "wrong adhaar" });
    }

    const { ...employeeDetails } = employee.dataValues;
    return res.status(200).json(employeeDetails);
  } catch (e) {}
};

// change password
const changePassword = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { currentPassword, newPassword, phone } = req.body;

    const employee = await Employee.findOne({ where: { phone: phone } });
    const { ...fetchUserDetails } = employee.dataValues;
    if (!fetchUserDetails) {
      return res.status(400).json({ error: "user not found" });
    }

    if (fetchUserDetails.password != currentPassword) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    await Employee.update({ password: newPassword }, { where: { phone: phone } });
    return res.status(200).json({ message: "Password Changed successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// upload profile
const uploadProfile = async (req, res) => {
  const { Employee } = await connectTodb();
  const { phone } = req.body;

  console.log(req.body);

  try {
    const checkUser = await Employee.findOne({ where: { phone: phone } });

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!checkUser) {
      return res.status(400).json({ error: "user not found" });
    }

    let profileBase64 = null;
    if (req.file) {
      const fileData = await fs.readFile(req.file.path);
      profileBase64 = `data:${req.file.mimetype};base64,${fileData.toString("base64")}`;

      await fs.unlink(req.file.path).catch(console.error);
    }

    if (profileBase64) {
      await Employee.update({ profile: profileBase64 }, { where: { phone: phone } });
      return res.status(200).json({ message: "Profile Updated", data: profileBase64 });
    } else {
      return res.status(400).json({ error: "No file uploaded" });
    }
  } catch (e) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { createEmployee, loginEmployee, getEmployeeDetails, changePassword, uploadProfile };
