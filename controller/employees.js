const { where } = require("sequelize");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const connectTodb = require("../misc/db");
const path = require("path");

//create employee by payment
const createEmployeeByPayment = async (req, res) => {
  const { sequelize } = await connectTodb();
  const transaction = await sequelize.transaction();

  try {
    const { Employee, EmployeePayment } = await connectTodb();
    let { joined_by, role, amount, payment_status, transaction_id } = req.body;

    req.body.date = new Date();

    let newEmployee,
      joinedbyDetails,
      fetchDetailsOfLevel1Refferel,
      fetchDetailsOfLevel2Refferel,
      level2UniverselJoinedBy;

    console.log(req.body);

    // Fetch details of the referrer
    joinedbyDetails = await fetchJoinedByDetails(joined_by, Employee);

    if (amount < 2950) {
      req.body.deductions = 2950 - amount;
    }

    if (
      role === "mma" ||
      role === "zmh" ||
      role === "dmh" ||
      (role === "smh" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma"))
    ) {
      const directMMACount = (joinedbyDetails.direct_mma_count || 0) + 1;
      const mmaCount = (joinedbyDetails.mma_count || 0) + 1;
      const totalMMACount = mmaCount + (joinedbyDetails.level2_mma_count || 0);

      req.body.position = directMMACount;

      console.log(directMMACount);
      console.log(mmaCount);

      console.log(totalMMACount);

      // Create new employee first
      newEmployee = await Employee.create(req.body, { transaction });

      // Update details for reffered by account
      if (directMMACount === 5) {
        console.log("!!! 1");
        await Employee.update(
          {
            role: "dmh",
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
            mma_count: (joinedbyDetails.level2_mma_count || 0) + mmaCount,
            level2_mma_count: 0,
            direct_mma_count: directMMACount,
          },
          { where: { refferel_code: joined_by }, transaction }
        );
      } else if (totalMMACount >= 105) {
        console.log("!!!! 3");
        await Employee.update(
          {
            role: "smh",
            mma_count: totalMMACount,
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
        fetchDetailsOfLevel1Refferel = await fetchJoinedByDetails(joinedbyDetails.joined_by, Employee);
        console.log(fetchDetailsOfLevel1Refferel);
        const level1DirectMMACount = fetchDetailsOfLevel1Refferel.direct_mma_count || 0;
        const level1MMAcount = (fetchDetailsOfLevel1Refferel.mma_count || 0) + 1;
        const level1TotalMMACount = level1MMAcount + (fetchDetailsOfLevel1Refferel.level2_mma_count || 0);

        level2UniverselJoinedBy = fetchDetailsOfLevel1Refferel.joined_by;

        console.log("level1 ", level1DirectMMACount);
        console.log("level1 ", level1MMAcount);
        console.log("level1", level1TotalMMACount);

        if (level1DirectMMACount < 5) {
          console.log("level1");
          await Employee.update(
            {
              level1_mma_count: (fetchDetailsOfLevel1Refferel.level1_mma_count || 0) + 1,
            },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else if (level1MMAcount === 30 && level1DirectMMACount >= 5) {
          console.log("level2");
          await Employee.update(
            {
              role: "zmh",
              mma_count: level1MMAcount + (fetchDetailsOfLevel1Refferel.level2_mma_count || 0),
              level2_mma_count: 0,
            },
            { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
          );
        } else if (level1TotalMMACount >= 105) {
          console.log("level3");
          await Employee.update(
            { mma_count: level1MMAcount, role: "smh", level2_mma_count: 0 },
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
      if (level2UniverselJoinedBy) {
        console.log("hello2");
        fetchDetailsOfLevel2Refferel = await fetchJoinedByDetails(level2UniverselJoinedBy, Employee);

        console.log(fetchDetailsOfLevel2Refferel);

        const level2DirectMMACount = fetchDetailsOfLevel2Refferel.direct_mma_count || 0;
        const level2MMAcount = (fetchDetailsOfLevel2Refferel.mma_count || 0) + 1;
        const level2TotalMMACount = level2MMAcount + (fetchDetailsOfLevel2Refferel.level2_mma_count || 0);

        console.log("level2 ", level2DirectMMACount);
        console.log("level2 ", level2MMAcount);
        console.log("level2", level2TotalMMACount);

        if (level2DirectMMACount < 5) {
          console.log("level7");
          await Employee.update(
            {
              level2_mma_count: (fetchDetailsOfLevel2Refferel.level2_mma_count || 0) + 1,
            },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2MMAcount === 31 && level2DirectMMACount >= 5) {
          console.log("level8");
          await Employee.update(
            {
              role: "zmh",
              mma_count: level2MMAcount + (fetchDetailsOfLevel2Refferel.level2_mma_count || 0),
              level2_mma_count: 0,
            },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2TotalMMACount >= 105) {
          console.log("level9");
          await Employee.update(
            { mma_count: level2MMAcount, role: "smh", level2_mma_count: 0 },
            { where: { refferel_code: level2UniverselJoinedBy }, transaction }
          );
        } else if (level2MMAcount < 31 && level2DirectMMACount >= 5) {
          console.log("level10");
          await Employee.update(
            {
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
      } else {
        console.log("level 2 user not exist.");
      }
    } else if (role === "jma" && joinedbyDetails.role === "sma") {
      req.body.position = 1 + (joinedbyDetails.jma_count || 0);
      newEmployee = await Employee.create(req.body, { transaction });
      await Employee.update(
        { jma_count: (joinedbyDetails.jma_count || 0) + 1 },
        { where: { refferel_code: joined_by }, transaction }
      );
      mmaDetails = await fetchJoinedByDetails(joinedbyDetails.joined_by, Employee);
      await Employee.update(
        { jma_count: (mmaDetails.jma_count || 0) + 1 },
        { where: { refferel_code: mmaDetails.refferel_code }, transaction }
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

const fetchJoinedByDetails = async (joined_by, employee) => {
  const checkJoindedBy = await employee.findOne({
    where: { refferel_code: joined_by },
  });

  if (!checkJoindedBy) {
    return res.status(400).json({ error: "Invalid referral code" });
  }

  const { ...joinedbyDetails } = checkJoindedBy.dataValues;
  return joinedbyDetails;
};

// check refferal code , phone , adhaar before creating user
const checkUserDetailsBeforeCreating = async (req, res) => {
  const { Employee } = await connectTodb();
  try {
    let { joined_by, role } = req.body;

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

//check phone number already exists
const checkPhoneAlreadyExists = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { phone } = req.body;
    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone already exists." });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

//check mma pincode already exists
const checkMMAalreadyExistsForPincode = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { pincode, role, phone } = req.body;

    if (role === "mma") {
      checkPincode = await Employee.findOne({ where: { pincode: pincode, role: "mma" } });
      if (checkPincode) {
        return res.status(400).json({
          error: "mma already exists for this pincode",
        });
      } else {
        return res.status(200).json({ success: true });
      }
    } else if (role === "sma" || role === "jma") {
      // Fetch the details of the referred user
      const fetchedDetails = await Employee.findOne({ where: { phone }, attributes: ["pincode"] });
      if (!fetchedDetails) {
        return res.status(400).json({ error: "Invalid referral code" });
      }

      // Check if the fetched pincode matches the provided pincode
      if (fetchedDetails.pincode === pincode) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(400).json({ error: "Incorrect pincode" });
      }
    } else {
      return res.status(400).json({ error: "Invalid role" });
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
      return res.status(401).json({ error: "Invalid phone or password" });
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
      return res.status(401).json({ error: "Invalid phone number" });
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

// generate offer letter function
const generateOfferLetter = async (req, res) => {
  try {
    const { Employee } = await connectTodb();

    const checkUser = await Employee.findOne({ where: req.params });

    if (!checkUser) {
      return req.status(400).json({ error: "no data found" });
    }

    const employeeDetails = checkUser.dataValues;
    const joiningDate = employeeDetails.addedon.split(" ")[0];
    const name = employeeDetails.name.charAt(0).toUpperCase() + employeeDetails.name.slice(1);
    const address = employeeDetails.address.charAt(0).toUpperCase() + employeeDetails.address.slice(1);
    const city = employeeDetails.city.charAt(0).toUpperCase() + employeeDetails.city.slice(1);
    const district = employeeDetails.district.charAt(0).toUpperCase() + employeeDetails.district.slice(1);
    const placeOfPosting = employeeDetails.place_of_posting.toUpperCase();
    const role = employeeDetails.role.split("").join(".").toUpperCase();

    const imagePath = path.join(__dirname, "../assets/sign & signature kk.png");
    const imageBase64 = await fs.readFile(imagePath, { encoding: "base64" });
    const imageSrc = `data:image/png;base64,${imageBase64}`;

    const imagePath2 = path.join(__dirname, "../assets/logo2.png");
    const imageBase642 = await fs.readFile(imagePath2, { encoding: "base64" });
    const imageSrc2 = `data:image/png;base64,${imageBase642}`;

    let designation;
    if (employeeDetails.role === "mma") {
      designation = "MANDAL MARKETING ASSOCIATE";
    } else if (employeeDetails.role === "sma") {
      designation = "SENIOR MARKETING ASSOCIATE";
    } else if (employeeDetails.role === "jma") {
      designation = "JUNIOR MARKETING ASSOCIATE";
    } else if (employeeDetails.role === "dmh") {
      designation = "DISTRICT MARKETING HEAD";
    } else if (employeeDetails.role === "zmh") {
      designation = "ZONAL MARKETING HEAD";
    } else if (employeeDetails.role === "smh") {
      designation = "STATE MARKETING HEAD";
    }

    // Create the HTML content using the employee details
    // <h5 style="color:rgb(128, 0, 0)">C/o. KISHAN AND KARMIK WELFARE MUTUALLY AIDED COOPERATIVE SOCIETY LIMITED.</h5>
    //  <p>Mutually Aided</p>
    //  <p>Cooperative Society Ltd.</p>
    const htmlContent = `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KK Mart Offer Letter</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #fff;
        border: solid grey 1px;
      }
      .container {
        width: 100%;
        max-width: 750px;
        margin: 40px auto;
        margin-top:0px;
        padding-top: 20px;
        position: relative;
        height:1000px;
        border-radius: 10px;
        
      }
      .header {
        text-align: center;
        color: black;
      }
      .header h1,
      .header h3,
      .header h4 {
        margin: 5px 0;
      }
      .info-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
      }
      .photo {
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction:column;
        align-items: start;
        justify-content: center;
        background: #f3f3f3;
      }

      .photo p{
      line-height: 1.2;
      }
      .details p {
        margin: 5px 0;
      }
      .offer-details {
        margin-top: 5px;
      }
      .signature {
        width:100%;
        margin-top: 0px;
      }
      .header h1,
      .header h4,
      .header h5 {
        margin: 0;
        padding: 0;
        line-height: 1.2;
        text-align: center;
      }
      .signature-div p {
        line-height: 0.4;
        display:flex;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
      <img src="${imageSrc2}" width="200" height="100" />
       
     
        <h5>GROUND FLOOR, BUILDING NO: 519/3, REVATHIPATHI STREET, TOLUSURUPALLE,</h5>
        <h5>TEKKALI, SRIKAKULAM DISTRICT, ANDHRA PRADESH - 532201</h5>
        <h5>REGD NO: 114 of 2024 | GSTN No: 37ABCFK8935H1ZZ</h5>
      </div>

    <div style="border: black solid 3px; border-style: dotted;display:flex;justify-content: center; align-items: center; height:20px;margin-top:10px">
    <p style='color:rgb(0, 0, 128);font-weight:bold'><u>OFFER LETTER</u></p>
    </div>

      <div class="info-section">
        <div class="details">
         <p>Date of Joining: ${joiningDate}</p>
          <p>Name: <strong>${name}</strong></p>
          <p>Address: ${address},<br>${district},${employeeDetails.state}</p>
          <p>PIN Code: ${employeeDetails.pincode}</p>
          <p>Contact No: +91 ${employeeDetails.phone}</p>
        </div>
        <div class="photo">
         <p>ID: ${employeeDetails.id}</p>
        <img src="${employeeDetails.profile}" width="100" height="100" />
        </div>
      </div>

      <p>Dear ${name},</p>
      <p style='text-align: justify'>
      &nbsp;&nbsp;&nbsp;&nbsp; We are pleased to inform you that based on our selection process, you are provisionally selected for the post of <strong>${role}.</strong> for a probationary period. After successful and satisfactory completion of the probationary period and fulfilment of your target, the Job will be renewed for permanent position in the Society with the new terms and conditions. This offer is active with effective from the date of joining and is subject to the following terms and conditions.
      </p>

      <div class="offer-details" >
        <p>
          <strong>JOB TITLE:</strong> Your job title will be <strong>${designation}</strong> (${role}.) and you will report daily at
          <strong>5 PM</strong> to the HEAD OFFICE.
        </p>
        <p style='text-align: justify'>
          <strong>INCENTIVES AND COMMISSION:</strong> Your estimated commission will be on a per-membership basis as set
          by the Society.
        </p>
        <p><strong>PLACE OF POSTING:</strong> ${placeOfPosting}</p>
        <p style='text-align: justify'>
          <strong>TERMINATION OF ASSOCIATE:</strong> If If you do not meet the Society’s expectations, there will be no payment claim, and your job will be terminated if no improvement is observed during the 15-day period. The processing fee of *Rs. 2950* is non-refundable.
        </p>
      </div>

      <p style='text-align: justify'>
      This offer letter is provided to you according to our own terms and conditions, which may change in the future if deemed necessary by the Society.
      </p>
      <p style='text-align: justify'>This offer is being issued to you in two counterparts. You may acknowledge your acceptance of the terms contained herein by signing one counterpart and returning it to us.</p>

      <div class="signature" style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style=" text-align: left">
          <p><strong>Signature of Associate</strong></p>
        </div>
        <div style=" text-align: right" class="signature-div">
         <p>KK Mart</p>
        
         <img src="${imageSrc}" width="180" height="70" />
         <p>Managing Director</p>
        </div>
      </div>
    </div>
  </body>
</html>

    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      // headless: true,
      executablePath: "/usr/bin/chromium-browser",
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
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Define the directory and file path
    const dirPath = path.join(__dirname, "../uploads/profiles");
    const filePath = path.join(dirPath, `${employeeDetails.name}_offer_letter.pdf`);

    // Create the directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    // Save the PDF file
    await fs.writeFile(filePath, pdfBuffer);

    // Convert the PDF file to Base64
    const fileData = await fs.readFile(filePath);
    const base64String = `data:application/pdf;base64,${fileData.toString("base64")}`;
    // Optionally, delete the file after conversion
    await fs.unlink(filePath).catch(console.error);

    if (base64String) {
      await Employee.update({ offer_letter: base64String }, { where: { phone: employeeDetails.phone } });
      return res.status(200).json({ message: "Offer letter generated successfully", data: base64String });
    } else {
      return res.status(400).json({ error: "Offer letter not generated" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// update employee details
const updateEmployeeDetails = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    //Update employee details
    const [updated] = await Employee.update(req.body, { where: { phone: phone } });

    if (updated === 0) {
      return res.status(404).json({ error: "No changes found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating employee details:", error);
    return res.status(500).json({ error: error.message });
  }
};

//update today earnings
const updateTodayEarnings = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { date, refferelCode } = req.body;
    console.log(req.body);
    const [updated] = await Employee.update(
      { date: date, daily_earnings: 0 },
      { where: { refferel_code: refferelCode } }
    );
    if (updated === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

//forget password
const forgotPassword = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { phone, password } = req.body;

    console.log(req.body);

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    //Update employee details
    const [updated] = await Employee.update({ password: password }, { where: { phone } });

    if (updated === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error("Error updating employee details:", error);
    return res.status(500).json({ error: error.message });
  }
};

//create employee by using pin
const createEmployeeByPIN = async (req, res) => {
  const { sequelize } = await connectTodb();
  const transaction = await sequelize.transaction();

  try {
    const { Employee, Pins } = await connectTodb();
    let { joined_by, role, pin } = req.body;

    req.body.date = new Date();
    req.body.deductions = 2950.0;

    let newEmployee,
      joinedbyDetails,
      fetchDetailsOfLevel1Refferel,
      fetchDetailsOfLevel2Refferel,
      level2UniverselJoinedBy;

    // console.log(req.body);

    const checkPin = await Pins.findOne({ where: { pin: pin } });

    // console.log(checkPin.dataValues);

    if (checkPin && checkPin.status === 1) {
      // Fetch details of the referrer
      joinedbyDetails = await fetchJoinedByDetails(joined_by, Employee);

      if (
        role === "mma" ||
        role === "zmh" ||
        role === "dmh" ||
        (role === "smh" && (joinedbyDetails.role !== "sma" || joinedbyDetails !== "jma"))
      ) {
        const directMMACount = (joinedbyDetails.direct_mma_count || 0) + 1;
        const mmaCount = (joinedbyDetails.mma_count || 0) + 1;
        const totalMMACount = mmaCount + (joinedbyDetails.level2_mma_count || 0);
        req.body.position = directMMACount;

        // Create new employee first
        newEmployee = await Employee.create(req.body, { transaction });

        // Update details for reffered by account
        if (directMMACount === 5) {
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
        } else if (totalMMACount >= 105) {
          await Employee.update(
            {
              role: "smh",
              // mma_count: mmaCount,
              mma_count: totalMMACount,
              level2_mma_count: 0,
              direct_mma_count: directMMACount,
            },
            { where: { refferel_code: joined_by }, transaction }
          );
        } else if (mmaCount < 30 && directMMACount >= 5) {
          await Employee.update(
            {
              mma_count: mmaCount,
              // level2_mma_count: (joinedbyDetails.level2_mma_count || 0) + 1,
              direct_mma_count: directMMACount,
            },
            { where: { refferel_code: joined_by }, transaction }
          );
        } else {
          await Employee.update(
            { mma_count: mmaCount, direct_mma_count: directMMACount },
            { where: { refferel_code: joined_by }, transaction }
          );
        }

        // level1 loop for Fetch updated referrer details
        if (joinedbyDetails.joined_by) {
          fetchDetailsOfLevel1Refferel = await fetchJoinedByDetails(joinedbyDetails.joined_by, Employee);
          const level1DirectMMACount = fetchDetailsOfLevel1Refferel.direct_mma_count || 0;
          const level1MMAcount = (fetchDetailsOfLevel1Refferel.mma_count || 0) + 1;
          level2UniverselJoinedBy = fetchDetailsOfLevel1Refferel.joined_by;
          const level1TotalMMACount = level1MMAcount + (fetchDetailsOfLevel1Refferel.level2_mma_count || 0);

          if (level1DirectMMACount < 5) {
            await Employee.update(
              {
                level1_mma_count: (fetchDetailsOfLevel1Refferel.level1_mma_count || 0) + 1,
              },
              { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
            );
          } else if (level1MMAcount === 30 && level1DirectMMACount >= 5) {
            await Employee.update(
              {
                role: "zmh",
                mma_count: level1MMAcount + (fetchDetailsOfLevel1Refferel.level2_mma_count || 0),
                level2_mma_count: 0,
              },
              { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
            );
          } else if (level1TotalMMACount >= 105) {
            await Employee.update(
              { mma_count: level1MMAcount, role: "smh", level2_mma_count: 0 },
              { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
            );
          } else {
            await Employee.update(
              { mma_count: level1MMAcount },
              { where: { refferel_code: joinedbyDetails.joined_by }, transaction }
            );
          }
        }

        // level2 loop for Fetch updated referrer details
        if (level2UniverselJoinedBy) {
          fetchDetailsOfLevel2Refferel = await fetchJoinedByDetails(level2UniverselJoinedBy, Employee);

          console.log(fetchDetailsOfLevel2Refferel);

          const level2DirectMMACount = fetchDetailsOfLevel2Refferel.direct_mma_count || 0;
          const level2MMAcount = (fetchDetailsOfLevel2Refferel.mma_count || 0) + 1;
          const level2TotalMMACount = level2MMAcount + (fetchDetailsOfLevel2Refferel.level2_mma_count || 0);

          if (level2DirectMMACount < 5) {
            await Employee.update(
              {
                level2_mma_count: (fetchDetailsOfLevel2Refferel.level2_mma_count || 0) + 1,
              },
              { where: { refferel_code: level2UniverselJoinedBy }, transaction }
            );
          } else if (level2MMAcount === 31 && level2DirectMMACount >= 5) {
            await Employee.update(
              {
                role: "zmh",
                mma_count: level2MMAcount + (fetchDetailsOfLevel2Refferel.level2_mma_count || 0),
                level2_mma_count: 0,
              },
              { where: { refferel_code: level2UniverselJoinedBy }, transaction }
            );
          } else if (level2TotalMMACount >= 105) {
            await Employee.update(
              { mma_count: level2MMAcount, role: "smh", level2_mma_count: 0 },
              { where: { refferel_code: level2UniverselJoinedBy }, transaction }
            );
          } else if (level2MMAcount < 31 && level2DirectMMACount >= 5) {
            await Employee.update(
              {
                level2_mma_count: (fetchDetailsOfLevel2Refferel.level2_mma_count || 0) + 1,
              },
              { where: { refferel_code: level2UniverselJoinedBy }, transaction }
            );
          } else {
            await Employee.update(
              { mma_count: level2MMAcount },
              { where: { refferel_code: level2UniverselJoinedBy }, transaction }
            );
          }
        } else {
          console.log("level 2 user not exist.");
        }
      } else if (role === "jma" && joinedbyDetails.role === "sma") {
        req.body.position = 1 + (joinedbyDetails.jma_count || 0);
        newEmployee = await Employee.create(req.body, { transaction });
        await Employee.update(
          { jma_count: (joinedbyDetails.jma_count || 0) + 1 },
          { where: { refferel_code: joined_by }, transaction }
        );
        mmaDetails = await fetchJoinedByDetails(joinedbyDetails.joined_by, Employee);
        await Employee.update(
          { jma_count: (mmaDetails.jma_count || 0) + 1 },
          { where: { refferel_code: mmaDetails.refferel_code }, transaction }
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

      console.log("phone:-", newEmployee.phone);

      if (newEmployee) {
        await Pins.update(
          {
            used_by_name: newEmployee.name,
            used_on: req.body.date,
            used_by_id: newEmployee.refferel_code,
            used_by_phone: newEmployee.phone,
            status: 0,
          },
          { where: { pin: pin }, transaction }
        );
      }

      await transaction.commit();
      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        employee: newEmployee,
      });
    } else if (checkPin && checkPin.status === 0) {
      return res.status(400).json({ message: "Pin already used" });
    } else {
      return res.status(404).json({ message: "Invalid pin" });
    }
  } catch (e) {
    await transaction.rollback();
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

const fetchMandalsByDistrict = async (req, res) => {
  const { Mandals } = await connectTodb();
  const { district } = req.body;
  try {
    const mandalsList = await Mandals.findAll({ where: { district: district }, attributes: ["mandal"] });
    return res.status(200).json({ data: mandalsList, success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createEmployeeByPayment,
  checkUserDetailsBeforeCreating,
  loginEmployee,
  getEmployeeDetails,
  changePassword,
  uploadProfile,
  generateOfferLetter,
  checkPhoneAlreadyExists,
  checkMMAalreadyExistsForPincode,
  updateEmployeeDetails,
  updateTodayEarnings,
  forgotPassword,
  createEmployeeByPIN,
  fetchMandalsByDistrict,
};
