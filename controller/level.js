const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const getMMAlist = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { refferal_code, role } = req.body;

    console.log(`############################`, refferal_code);

    const fetchedData = await Employee.findAll({
      where: {
        joined_by: refferal_code,
        role: role,
      },
    });
    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getMMAlist };
