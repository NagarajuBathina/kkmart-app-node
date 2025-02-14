const { where } = require("sequelize");
const fs = require("fs").promises;
const connectTodb = require("../misc/db");

//create employee
const createEmployee = async (req, res) => {
  const { sequelize } = await connectTodb();
  const transaction = await sequelize.transaction();

  try {
    const { Employee, EmployeePayment } = await connectTodb();
    let { joined_by, role, amount, payment_status, transaction_id } = req.body;
    let newEmployee,
      joinedbyDetails,
      fetchDetailsOfLevel1Refferel,
      fetchDetailsOfLevel2Refferel,
      level2UniverselJoinedBy;

    // Fetch details of the referrer
    joinedbyDetails = await fetchJoinedByDetails(joined_by, Employee, transaction);

    if (amount < 3000) {
      req.body.deductions = 3000 - amount;
    }

    if (
      role === "mma" ||
      role === "zmh" ||
      role === "dmh" ||
      (role === "smh" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma"))
    ) {
      const directMMACount = (joinedbyDetails.direct_mma_count || 0) + 1;
      const mmaCount = (joinedbyDetails.mma_count || 0) + 1;
      req.body.position = directMMACount;

      console.log(directMMACount);
      console.log(mmaCount);

      // Create new employee first
      newEmployee = await Employee.create(req.body, { transaction });

      // Update details for reffered by account
      if (directMMACount === 5) {
        console.log("!!! 1");
        await Employee.update(
          {
            role: "dmh",
            //  mma_count: mmaCount,
            mma_count: (joinedbyDetails.level1_mma_count || 0) + mmaCount,
            level1_mma_count: 0,
            direct_mma_count: directMMACount,
          },
          { where: { refferel_code: joined_by }, transaction }
        );
      } else if (mmaCount === 30 && directMMACount >= 5) {
        console.log("!!!! 2");
        await Employee.update(
          {
            role: "zmh",
            //  mma_count: mmaCount,
            mma_count: (joinedbyDetails.level2_mma_count || 0) + mmaCount,
            level2_mma_count: 0,
            direct_mma_count: directMMACount,
          },
          { where: { refferel_code: joined_by }, transaction }
        );
      } else if (mmaCount >= 105) {
        console.log("!!!! 3");
        await Employee.update(
          {
            role: "smh",
            // mma_count: mmaCount,
            mma_count: (joinedbyDetails.level2_mma_count || 0) + mmaCount,
            level2_mma_count: 0,
            direct_mma_count: directMMACount,
          },
          { where: { refferel_code: joined_by }, transaction }
        );
      } else if (mmaCount < 30 && directMMACount >= 5) {
        console.log("!!!! 4");
        await Employee.update(
          {
            mma_count: mmaCount,
            // level2_mma_count: (joinedbyDetails.level2_mma_count || 0) + 1,
            direct_mma_count: directMMACount,
          },
          { where: { refferel_code: joined_by }, transaction }
        );
      } else {
        console.log("!!!! 5");
        await Employee.update(
          { mma_count: mmaCount, direct_mma_count: directMMACount },
          { where: { refferel_code: joined_by }, transaction }
        );
      }

      // level1 loop for Fetch updated referrer details
      if (joinedbyDetails.joined_by) {
        console.log("hello");
        fetchDetailsOfLevel1Refferel = await fetchJoinedByDetails(joinedbyDetails.joined_by, Employee, transaction);
        console.log(fetchDetailsOfLevel1Refferel);
        const level1DirectMMACount = (fetchDetailsOfLevel1Refferel.direct_mma_count || 0) + 1;
        const level1MMAcount = (fetchDetailsOfLevel1Refferel.mma_count || 0) + 1;
        level2UniverselJoinedBy = fetchDetailsOfLevel1Refferel.joined_by;

        console.log("level1 ", level1DirectMMACount);
        console.log("level1 ", level1MMAcount);

        if (fetchDetailsOfLevel1Refferel.direct_mma_count < 5) {
          console.log("level1");
          await Employee.update(
            {
              level1_mma_count: (fetchDetailsOfLevel1Refferel.level1_mma_count || 0) + 1,
              // mma_count: level1MMAcount
            },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else if (level1MMAcount === 30 && level1DirectMMACount >= 5) {
          console.log("level2");
          await Employee.update(
            {
              role: "zmh",
              // mma_count: level1MMAcount,
              mma_count: level1MMAcount + (fetchDetailsOfLevel1Refferel.level2_mma_count || 0),
              level2_mma_count: 0,
            },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else if (level1MMAcount >= 105) {
          console.log("level3");
          await Employee.update(
            { mma_count: level1MMAcount, role: "smh" },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else if (level1MMAcount < 30 && level1DirectMMACount >= 5) {
          console.log("level4");
          await Employee.update(
            {
              mma_count: level1MMAcount,
              level2_mma_count: (fetchDetailsOfLevel1Refferel.level2_mma_count || 0) + 1,
            },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else {
          console.log("level6");
          await Employee.update(
            { mma_count: level1MMAcount },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        }
      }

      // level2 loop for Fetch updated referrer details
      while (level2UniverselJoinedBy) {
        console.log("hello2");
        fetchDetailsOfLevel2Refferel = await fetchJoinedByDetails(level2UniverselJoinedBy, Employee, transaction);

        if (!fetchDetailsOfLevel2Refferel) {
          console.log("No more details found for level 2.");
          break;
        }
        console.log(fetchDetailsOfLevel2Refferel);

        const level2DirectMMACount = (fetchDetailsOfLevel2Refferel.direct_mma_count || 0) + 1;
        const level2MMAcount = (fetchDetailsOfLevel2Refferel.mma_count || 0) + 1;
        console.log("level2 ", level2DirectMMACount);
        console.log("level2 ", level2MMAcount);

        if (level2DirectMMACount < 5) {
          console.log("level7");
          await Employee.update(
            {
              level2_mma_count: (fetchDetailsOfLevel2Refferel.level2_mma_count || 0) + 1,
              //  mma_count: level2MMAcount
            },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2MMAcount === 30 && level2DirectMMACount >= 5) {
          console.log("level8");
          await Employee.update(
            {
              role: "zmh",
              // mma_count: level2MMAcount,
              mma_count: level2MMAcount + (fetchDetailsOfLevel2Refferel.level2_mma_count || 0),
              level2_mma_count: 0,
            },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2MMAcount >= 105) {
          console.log("level9");
          await Employee.update(
            { mma_count: level2MMAcount, role: "smh" },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2MMAcount < 30 && level2DirectMMACount >= 5) {
          console.log("level10");
          await Employee.update(
            {
              // mma_count: level2MMAcount,
              level2_mma_count: (fetchDetailsOfLevel2Refferel.level2_mma_count || 0) + 1,
            },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else {
          console.log("level11");
          await Employee.update(
            { mma_count: level2MMAcount },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        }
        level2UniverselJoinedBy = fetchDetailsOfLevel2Refferel.joined_by;

        if (!level2UniverselJoinedBy) {
          console.log("No more level 2 referrals.");
          break;
        }
      }
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
    } else {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid role hierarchy" });
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
    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: newEmployee,
    });
  } catch (e) {
    await transaction.rollback();
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const fetchJoinedByDetails = async (joined_by, employee, transaction) => {
  const checkJoindedBy = await employee.findOne({
    where: { refferel_code: joined_by },
    transaction,
  });

  if (!checkJoindedBy) {
    await transaction.rollback();
    return res.status(400).json({ error: "Invalid referral code" });
  }

  const { ...joinedbyDetails } = checkJoindedBy.dataValues;
  return joinedbyDetails;
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
    const { phone, password } = req.body;

    const employee = await Employee.findOne({ where: { phone, password } });
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
    const { phone } = req.body;

    const employee = await Employee.findOne({ where: { phone } });
    if (!employee) {
      return res.status(401).json({ error: "wrong phone phone" });
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

const generateOfferLetter = async (req, res) => {
  try {
    const { Employee } = await connectTodb();

    const employee = await Employee.findOne({
      where: { phone: req.body.params },
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const tableRows = months.map((month, index) => {
      // Calculate total for each row
      const pension = monthSlip ? parseFloat(monthSlip.actual_pension) || 0 : 0;
      const da = monthSlip ? parseFloat(monthSlip.da_amount) || 0 : 0;
      const addQuant = monthSlip ? parseFloat(monthSlip.add_quant_in_rs) || 0 : 0;
      const arrears = monthSlip ? parseFloat(monthSlip.arrears_in_rs) || 0 : 0;
      const total = pension + da + addQuant + arrears;

      return {
        row: `
            <tr>
              <td style="border: 1px solid #2d3748; padding: 8px">${index + 1}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">${displayYear}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">${month}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">₹${pension}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">₹${da}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">₹${addQuant}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">₹${arrears}</td>
              <td style="border: 1px solid #2d3748; padding: 8px">₹${total}</td>
            </tr>
          `,
        total: total,
      };
    });

    // Calculate total amount by summing the total from each row
    const totalAmount = tableRows.reduce((sum, row) => sum + row.total, 0);

    // Join all rows for HTML
    const tableRowsHtml = tableRows.map((row) => row.row).join("");

    const htmlContent = `
      <div style="width: auto; padding: 15px; background-color: white; margin: 3px">
        <div style="text-align: center; margin-bottom: 4px">
          <h2 style="font-size: 1.25rem; font-weight: bold">Visakhapatnam Port Authority</h2>
          <h3 style="font-size: 1.25rem">Accounts Department</h3>
          <div style="display: flex; flex-grow: 1; flex-wrap: wrap">
            <div style="width: 42%; text-align: left">
              <h4>${employee.employee_name}</h4>
            </div>
            <div style="width: 42%; text-align: left">
              <h4>${employee_number}</h4>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 24px; line-height: 1.5">
          <div>Visakhapatnam Port Authority</div>
          <div>Visakhapatnam</div>
          <div>
            <p>
              Sir,
              <br />
              <span style="margin-left: 24px">
                Sub: Issue of "YEARLY PENSION CERTIFICATE" for the year 01.04.${year}-31.03.${parseInt(year) + 1} Reg.
              </span>
            </p>
            <p>
              The remittance particulars of monthly pension made by VPA to your A/c.No. 
              ${monthlySlips[0]?.bank_account_number || ""} for the period 01.04.${year}-31.03.${parseInt(year) + 1} 
              are furnished below.
            </p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #2d3748">
          <thead>
            <tr style="background-color: #f7fafc">
              <th style="border: 1px solid #2d3748; padding: 8px">S.No</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Year</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Month</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Pension in Rs.</th>
              <th style="border: 1px solid #2d3748; padding: 8px">DA in Rs.</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Add.Quant in Rs.</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Arrears in Rs.</th>
              <th style="border: 1px solid #2d3748; padding: 8px">Total in Rs.</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
            <tr>
              <td colspan="4" style="border: 1px solid #2d3748; padding: 8px; text-align: center; font-weight: bold">
                Total Amount
              </td>
              <td colspan="4" style="border: 1px solid #2d3748; padding: 8px; font-weight: bold; text-align: center">
                ₹${totalAmount.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
        <p>This information is issued only for the purpose of submitting the same to IT authorities</p>
        <div style="display: flex; justify-content: flex-end; margin-right: 78px;">
          <div style="text-align: right">
            <p>F.A. & C.A.O.</p>
          </div>
        </div>
      </div>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf();
    await browser.close();

    // Calculate PDF size
    const pdfSize = parseInt(Buffer.byteLength(pdfBuffer)) / 1000;

    res.status(200).json({
      message: "Yearly certificate generated successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmployee,
  checkUserDetailsBeforeCreating,
  loginEmployee,
  getEmployeeDetails,
  changePassword,
  uploadProfile,
  generateOfferLetter,
};
