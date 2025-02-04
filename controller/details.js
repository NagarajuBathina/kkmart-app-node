const { where } = require("sequelize");
const connectTodb = require("../misc/db");

const getDetails = async (refferalCode, role) => {
  const { Employee } = await connectTodb();
  const getDetails = await Employee.findAll({ where: { joined_by: refferalCode, role: role } });
  if (!getDetails || getDetails.length === 0) {
    console.log("no data available");
  }
  getDetails;
};

const getJMAdetails = async (req, res) => {
  try {
    const { Employee } = await connectTodb();
    const { refferalCode, role } = req.body;

    console.log(req.body);

    const fetchedData = await getDetails(refferalCode, role);

    console.log(fetchedData);

    if (!fetchedData || fetchedData.length === 0) {
      return res.status(400).json("no data available");
    }

    return res.status(200).json({ data: fetchedData });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { getJMAdetails, getDetails };
