const { where } = require("sequelize");
const fs = require("fs").promises;
const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  const { sequelize } = await connectTodb();
  const transaction = await sequelize.transaction();
  try {
    const { Employee, EmployeePayment } = await connectTodb();
    let {
      joined_by,
      role,
      //payment details
      amount,
      payment_status,
      transaction_id,
    } = req.body;

    const checkJoindedBy = await Employee.findOne({ where: { refferel_code: joined_by } });

    const { ...joinedbyDetails } = checkJoindedBy.dataValues;
    let newEmployee;

    if (role === "mma" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma")) {
      req.body.position = 1 + (joinedbyDetails.mma_count || 0);
      newEmployee = await Employee.create(req.body, { transaction });
      await Employee.update(
        { mma_count: (joinedbyDetails.mma_count || 0) + 1 },
        { where: { refferel_code: joined_by }, transaction }
      );
      await updateRole(joined_by, Employee, transaction);
    } else if (role === "jma" && joinedbyDetails.role === "sma") {
      req.body.position = 1 + (joinedbyDetails.jma_count || 0);
      newEmployee = await Employee.create(req.body, { transaction });
      await Employee.update(
        { jma_count: (joinedbyDetails.jma_count || 0) + 1 },
        { where: { refferel_code: joined_by }, transaction }
      );
    } else if (role === "sma" && joinedbyDetails.role !== "jma") {
      req.body.position = 1 + (joinedbyDetails.sma_count || 0);
      newEmployee = await Employee.create(req.body, { transaction });
      await Employee.update(
        { sma_count: (joinedbyDetails.sma_count || 0) + 1 },
        { where: { refferel_code: joined_by }, transaction }
      );
    }

    if (newEmployee) {
      await EmployeePayment.create(
        {
          name: newEmployee.name,
          addedon: newEmployee.addedon,
          joined_by: newEmployee.joined_by,
          phone: newEmployee.phone,
          payment_status,
          transaction_id,
          amount,
        },
        { transaction }
      );
    }
    await transaction.commit();
    return res.status(201).json({ success: true, employee: newEmployee });
  } catch (e) {
    await transaction.rollback();
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

const updateRole = async (joinedBy, employee, transaction) => {
  const checkJoindedBy = await employee.findOne({ where: { refferel_code: joinedBy } });
  const { ...joinedbyDetails } = checkJoindedBy.dataValues;
  if (joinedbyDetails.mma_count === 5) {
    await employee.update({ role: "dmh" }, { where: { refferel_code: joinedBy } }, { transaction });
  } else if (joinedbyDetails.mma_count === 30) {
    await employee.update({ role: "zmh" }, { where: { refferel_code: joinedBy } }, { transaction });
  } else if (joinedbyDetails.mma_count === 105) {
    await employee.update({ role: "smh" }, { where: { refferel_code: joinedBy } }, { transaction });
  }
};

// check refferal code , phone , adhaar before creating user
const checkUserDetailsBeforeCreating = async (req, res) => {
  const { Employee } = await connectTodb();
  try {
    let { adhaar, phone, joined_by, role } = req.body;
    const existingAdhaar = await Employee.findOne({ where: { adhaar } });
    if (existingAdhaar) {
      console.log("Aadhaar already exists:", adhaar);
      return res.status(400).json({ error: "Aadhaar already exists." });
    }
    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone already exists." });
    }

    const checkJoindedBy = await Employee.findOne({ where: { refferel_code: joined_by } });
    if (!checkJoindedBy) {
      return res.status(400).json({ error: "Invalid refferel id" });
    }
    const { ...joinedbyDetails } = checkJoindedBy.dataValues;

    if (role === "mma" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma")) {
      return res.status(200).json({
        success: true,
        message: "All validations passed",
      });
    } else if (role === "jma" && joinedbyDetails.role === "sma") {
      return res.status(200).json({
        success: true,
        message: "All validations passed",
      });
    } else if (role === "sma" && joinedbyDetails.role !== "jma") {
      return res.status(200).json({
        success: true,
        message: "All validations passed",
      });
    } else {
      return res.status(400).json({ error: "User can't be joined under this referral id" });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
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

module.exports = {
  createEmployee,
  checkUserDetailsBeforeCreating,
  loginEmployee,
  getEmployeeDetails,
  changePassword,
  uploadProfile,
};
