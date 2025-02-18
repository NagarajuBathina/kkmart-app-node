const { where } = require("sequelize");
const connectTodb = require("../misc/db");

//upload bank details
const uploadBankDetails = async (req, res) => {
  try {
    const { EmployeeBankDetails } = await connectTodb();

    console.log(req.body);

    await EmployeeBankDetails.create(req.body);
    return res.status(200).json({ message: "Updated successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const fetchBankDetailsById = async (req, res) => {
  try {
    const { EmployeeBankDetails } = await connectTodb();
    console.log(req.params);
    const bankDetails = await EmployeeBankDetails.findOne({ where: { refferel_code: req.params.refferel_code } });
    if (!bankDetails) {
      return res.status(400).json({ error: "no data found" });
    }
    return res.status(200).json({ data: bankDetails });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  uploadBankDetails,
  fetchBankDetailsById,
};
