const connectToDatabase = require("../../misc/db");
const fs = require("fs").promises;
const path = require("path");
const { Op } = require("sequelize");

// get all brands
const getAllBrands = async (req, res) => {
  try {
    const { Brand } = await connectToDatabase();
    const brands = await Brand.findAll({
      where: { is_active: true },
    });
    return res.status(200).json(brands);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get brand by id
const getBrandById = async (req, res) => {
  try {
    const { Brand } = await connectToDatabase();
    const brand = await Brand.findOne({
      where: {
        brand_id: req.params.id,
        is_active: true,
      },
    });
    return res.status(200).json({
      brand,
      message: brand ? "Brand found" : "Brand not found",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// add brand with logo
const createBrand = async (req, res) => {
  try {
    const { Brand } = await connectToDatabase();
    let logoBase64 = null;

    // Check if brand already exists
    const brandExists = await Brand.findOne({
      where: {
        brand: req.body.brand,
      },
    });

    if (brandExists) {
      if (brandExists.is_active) {
        // Existing active brand
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({
          message: "Brand already exists",
          brand: brandExists,
        });
      }
      // Reactivate soft-deleted brand
      await brandExists.update({
        is_active: true,
        logo: logoBase64,
        status: req.body.status === "false" ? false : true,
        updated_on: new Date(),
      });
      return res.status(200).json({
        message: "Brand reactivated successfully",
        brand: brandExists,
      });
    }

    if (req.file) {
      // Read the file and convert to base64
      const fileData = await fs.readFile(req.file.path);
      logoBase64 = `data:${req.file.mimetype};base64,${fileData.toString("base64")}`;

      // Delete the uploaded file after conversion
      await fs.unlink(req.file.path).catch(console.error);
    }

    const created_on = new Date();

    const brand = await Brand.create({
      brand: req.body.brand,
      logo: logoBase64,
      status: req.body.status === "false" ? false : true,
      created_on,
    });

    return res.status(201).json({
      message: "Brand added successfully",
      brand,
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    return res.status(500).json({ error: error.message });
  }
};

// delete brand
const deleteBrand = async (req, res) => {
  const { Brand, Product, sequelizeDatabase } = await connectToDatabase();
  const transaction = await sequelizeDatabase.transaction();
  try {
    const brand = await Brand.findOne({
      where: { brand_id: req.params.id },
      transaction,
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Soft-delete brand
    await brand.update({ is_active: false }, { transaction });

    // Soft-delete associated products
    await Product.update(
      { is_active: false },
      {
        where: { brand_id: req.params.id },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Brand and associated products deactivated successfully" });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
  }
};

// Update existing brand controller to handle logo updates
const updateBrand = async (req, res) => {
  try {
    const { Brand } = await connectToDatabase();
    const brand = await Brand.findOne({
      where: {
        brand_id: req.params.id,
      },
    });

    if (!brand) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      return res.status(404).json({ message: "Brand not found" });
    }

    // Check if new brand name exists (active or inactive)
    if (req.body.brand) {
      const existingBrand = await Brand.findOne({
        where: {
          brand: req.body.brand,
          brand_id: { [Op.ne]: req.params.id }, // Exclude current brand
        },
      });

      if (existingBrand) {
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({
          message: existingBrand.is_active
            ? "Brand name already exists"
            : "Brand name exists in deleted records. Please reactivate the original brand instead.",
          existingBrand,
        });
      }
    }

    // Handle logo update if file is uploaded
    let logoBase64 = brand.logo; // Keep existing logo by default
    if (req.file) {
      // Read the file and convert to base64
      const fileData = await fs.readFile(req.file.path);
      logoBase64 = `data:${req.file.mimetype};base64,${fileData.toString("base64")}`;

      // Delete the uploaded file after conversion
      await fs.unlink(req.file.path).catch(console.error);
    }

    // Update fields
    if (req.body.brand) brand.brand = req.body.brand;
    brand.logo = logoBase64;
    if (req.body.status !== undefined) {
      brand.status = req.body.status === "false" ? false : true;
    }

    await brand.save();

    return res.status(200).json({
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    return res.status(500).json({ error: error.message });
  }
};

// get all brandnames
const getBrandNames = async (req, res) => {
  try {
    const { Brand } = await connectToDatabase();
    const brands = await Brand.findAll({
      attributes: ["brand_id", "brand"],
      where: { is_active: true, status: true },
    });
    return res.status(200).json(brands);
  } catch (error) {
    return res.status(500).json({ error: error.message, message: "Error getting brand names" });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  deleteBrand,
  updateBrand,
  getBrandNames,
};
