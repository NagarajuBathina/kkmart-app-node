const connectToDatabase = require("../../misc/db");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

// Add products
const addProduct = async (req, res) => {
  let transaction;
  try {
    const { Product, Category, Supplier, Unit, Brand, sequelizeDatabase } = await connectToDatabase();

    transaction = await sequelizeDatabase.transaction();

    // Input validation - only validate barcode since it's required in DB
    if (!req.body.barcode) {
      return res.status(400).json({
        message: "Barcode is required",
      });
    }

    // Get or create category, supplier, and brand IDs if provided
    let category_id = null;
    let supplier_id = null;
    let brand_id = null;
    let brand = null;

    if (req.body.category) {
      const [category] = await Category.findOrCreate({
        where: { category: req.body.category },
        transaction,
      });
      category_id = category.category_id;
    }

    if (req.body.supplier) {
      const [supplier] = await Supplier.findOrCreate({
        where: { suppliers_name: req.body.supplier },
        defaults: { email: req.body.supplier + "@example.com" },
        transaction,
      });
      supplier_id = supplier.suppliers_id;
    }

    if (req.body.brand) {
      const [brandResult] = await Brand.findOrCreate({
        where: { brand: req.body.brand },
        defaults: { status: true, created_on: new Date() },
        transaction,
      });
      brand = brandResult;
      brand_id = brandResult.brand_id;
    }

    const [unit] = await Unit.findOrCreate({
      where: { unit: req.body.unit },
      defaults: { status: true, created_on: new Date() },
      transaction,
    });

    if (brand && (!brand.status || !brand.is_active)) {
      return res.status(400).json({
        message: "Brand is inactive or deleted",
      });
    }

    if (req.body.manufacturing_date && req.body.expiry_date) {
      if (new Date(req.body.manufacturing_date) >= new Date(req.body.expiry_date)) {
        return res.status(400).json({
          message: "Expiry date must be greater than manufacturing date",
        });
      }
    }

    // Prepare product data
    const productData = {
      ...req.body,
      stock_type: req.body.stock_type || "package",
      category_id: category_id,
      supplier_id: supplier_id,
      brand_id: brand_id,
      unit_id: unit.unit_id,
      status: req.body.status || "active",
      created_by: req.body.created_by,
      created_on: new Date(),
      gst: req.body.gst || null,
      schedule: req.body.schedule || null,
      is_active: true,
      discount_price: req.body.discount_price || req.body.products_price,
      base_unit_id: unit.base_unit_id || unit.unit_id,
    };

    // Remove unnecessary fields
    delete productData.category;
    delete productData.supplier_name;
    delete productData.brand;

    // check if the product already exists and is active false then update the product
    const existingProduct = await Product.findOne({
      where: { barcode: productData.barcode },
    });

    if (existingProduct && !existingProduct.is_active) {
      await existingProduct.update(productData, {
        is_active: true,
        transaction,
      });
      let product = existingProduct;
      await Unit.increment("no_of_products", {
        by: 1,
        where: { unit_id: unit.unit_id },
        transaction,
      });
      await transaction.commit();
      return res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } else if (existingProduct && existingProduct.is_active) {
      return res.status(400).json({
        message: "Product already exists",
      });
    } else {
      let product = await Product.create(productData, { transaction });

      // Update unit's no_of_products count
      await Unit.increment("no_of_products", {
        by: 1,
        where: { unit_id: unit.unit_id },
        transaction,
      });

      await transaction.commit();

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    }
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error in addProduct:", error);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// get all products
const getProducts = async (req, res) => {
  try {
    const { Product, Category, Supplier, Brand, Unit, User } = await connectToDatabase();
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          attributes: ["category"],
        },
        {
          model: Supplier,
          attributes: ["suppliers_name"],
        },
        {
          model: Brand,
          attributes: ["brand"],
        },
        {
          model: Unit,
          attributes: ["unit"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["username"],
        },
      ],
      raw: true,
      nest: false,
    });

    // Transform the response to flatten the structure
    const transformedProducts = products.map((product) => ({
      ...product,
      products_price: parseFloat(product.products_price),
      discount_price: parseFloat(product.discount_price),
      unit: product["unit.unit"],
      created_by: product["creator.username"],
      brand: product["brand.brand"],
      categories_name: product["category.category"],
      suppliers_name: product["supplier.suppliers_name"],
      gst: product.gst || null,
      shedule: product.shedule || null,
    }));

    res.status(200).json({ products: transformedProducts });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// Get product by barcode
const getProductByBarcode = async (req, res) => {
  try {
    const { Product, Category, Supplier, Brand, User, Unit } = await connectToDatabase();
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: "Barcode is required" });
    }

    const product = await Product.findOne({
      where: { barcode, is_active: true },
      include: [
        { model: Category, attributes: ["category"] },
        { model: Supplier, attributes: ["suppliers_name"] },
        { model: Brand, attributes: ["brand"] },
        { model: Unit, attributes: ["unit"] },
        {
          model: User,
          as: "creator",
          attributes: ["username"],
          required: false,
        },
      ],
      raw: true,
      nest: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Transform the response to flatten the structure
    const transformedProduct = {
      ...product,
      products_price: parseFloat(product.products_price),
      discount_price: parseFloat(product.discount_price),
      category: product.category?.category,
      brand: product.brand?.brand,
      unit: product.unit?.unit,
      suppliers_name: product.supplier?.suppliers_name,
      created_by: product.creator?.username,
    };

    // Remove nested objects
    delete transformedProduct.supplier;
    delete transformedProduct.creator;

    res.status(200).json({ product: transformedProduct });
  } catch (error) {
    console.error("Error in getProductByBarcode:", error);
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// update product by barcode
const updateProductByBarcode = async (req, res) => {
  let transaction;
  try {
    const { Product, Category, Supplier, Brand, Unit, sequelizeDatabase } = await connectToDatabase();

    transaction = await sequelizeDatabase.transaction();
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: "Barcode is required" });
    }

    const existingProduct = await Product.findOne({
      where: { barcode },
      include: [
        { model: Category, attributes: ["category"] },
        { model: Supplier, attributes: ["suppliers_name"] },
        { model: Brand, attributes: ["brand"] },
        { model: Unit, attributes: ["unit"] },
      ],
      transaction,
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update related entities if provided
    const updates = {};

    if (req.body.category) {
      const [category] = await Category.findOrCreate({
        where: { category: req.body.category },
        transaction,
      });
      updates.category_id = category.category_id;
    }

    if (req.body.supplier_name) {
      const [supplier] = await Supplier.findOrCreate({
        where: { suppliers_name: req.body.supplier_name },
        defaults: { email: req.body.supplier_name + "@example.com" },
        transaction,
      });
      updates.supplier_id = supplier.suppliers_id;
    }

    if (req.body.brand) {
      const [brand] = await Brand.findOrCreate({
        where: { brand: req.body.brand },
        defaults: { status: true, created_on: new Date() },
        transaction,
      });
      if (!brand.status || !brand.is_active) {
        return res.status(400).json({ message: "Brand is inactive or deleted" });
      }
      updates.brand_id = brand.brand_id;
    }

    if (req.body.unit) {
      const [unit] = await Unit.findOrCreate({
        where: { unit: req.body.unit },
        defaults: { status: true, created_on: new Date() },
        transaction,
      });
      if (!unit.status || !unit.is_active) {
        return res.status(400).json({ message: "Unit is inactive or deleted" });
      }
      updates.unit_id = unit.unit_id;
    }

    // Update product with new data
    const updatedProduct = await existingProduct.update(
      {
        ...req.body,
        stock_type: req.body.stock_type || existingProduct.stock_type,
        ...updates,
        updated_on: new Date(),
        gst: req.body.gst || existingProduct.gst,
        schedule: req.body.schedule || existingProduct.schedule,
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch updated product with associations
    const result = await Product.findOne({
      where: { barcode },
      include: [
        { model: Category, attributes: ["category"] },
        { model: Supplier, attributes: ["suppliers_name"] },
        { model: Brand, attributes: ["brand"] },
        { model: Unit, attributes: ["unit"] },
      ],
      raw: true,
      nest: true,
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: {
        ...result,
        category: result.category.category,
        supplier_name: result.supplier.suppliers_name,
        brand: result.brand.brand,
        unit: result.unit.unit,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in updateProductByBarcode:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// delete product
const deleteProduct = async (req, res) => {
  let transaction;
  try {
    const { Product, OrderItem, Unit, sequelizeDatabase } = await connectToDatabase();
    const { barcode } = req.params;

    transaction = await sequelizeDatabase.transaction();

    if (!barcode) {
      return res.status(400).json({
        message: "Barcode is required",
      });
    }

    // Find the product first
    const product = await Product.findOne({
      where: { barcode },
      transaction,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Decrease unit's no_of_products count
    await Unit.decrement("no_of_products", {
      by: 1,
      where: { unit_id: product.unit_id },
      transaction,
    });

    // Delete the product
    await product.update({ is_active: false }, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Product and related records deleted successfully",
      deletedProduct: {
        products_id: product.products_id,
        products_name: product.products_name,
        barcode: product.barcode,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// bulk upload products
const bulkUploadProducts = async (req, res) => {
  let transaction;
  try {
    const { Product, Category, Supplier, Brand, User, Unit, sequelizeDatabase } = await connectToDatabase();

    const created_by = req.body.createdBy;

    // Validate created_by user exists if provided
    if (created_by) {
      const userExists = await User.findOne({
        where: { user_id: created_by },
      });

      if (!userExists) {
        return res.status(400).json({
          message: "Invalid created_by user ID",
          error: "User does not exist",
        });
      }
    }

    // Start transaction
    transaction = await sequelizeDatabase.transaction();

    if (!Array.isArray(req.body.products)) {
      return res.status(400).json({
        message: "Request body must be an array of products",
      });
    }

    const createdProducts = [];
    const updatedProducts = [];
    const errors = [];
    const unitIncrements = new Map();

    // Process all products in parallel to avoid await inside loop
    await Promise.all(
      req.body.products.map(async (productData) => {
        try {
          // Input validation
          if (!productData.barcode) {
            throw new Error("Barcode is required");
          }

          // Validate dates if provided
          if (productData.manufacturing_date && productData.expiry_date) {
            if (new Date(productData.manufacturing_date) >= new Date(productData.expiry_date)) {
              throw new Error("Expiry date must be greater than manufacturing date");
            }
          }

          // Find or create category, supplier, and brand with transaction
          const [category] = await Category.findOrCreate({
            where: { category: productData.category },
            defaults: { status: true, created_on: new Date(), is_active: true },
            transaction,
          });

          const [supplier] = await Supplier.findOrCreate({
            where: { suppliers_name: productData.supplier_name },
            defaults: { email: productData.supplier_name + "@example.com" },
            transaction,
          });

          const [brand] = await Brand.findOrCreate({
            where: { brand: productData.brand },
            defaults: { status: true, created_on: new Date(), is_active: true },
            transaction,
          });

          const [unit] = await Unit.findOrCreate({
            where: { unit: productData.unit },
            defaults: { status: true, created_on: new Date(), is_active: true },
            transaction,
          });

          // Validate brand and category status
          if (!brand.status || !brand.is_active) {
            throw new Error(`Brand ${productData.brand} is inactive or deleted`);
          }

          if (!category.status || !category.is_active) {
            throw new Error(`Category ${productData.category} is inactive or deleted`);
          }

          if (!unit.status || !unit.is_active) {
            throw new Error(`Unit ${productData.unit} is inactive or deleted`);
          }

          // Prepare product data
          const processedData = {
            ...productData,
            stock_type: productData.stock_type || "package",
            created_by: created_by || null,
            category_id: category.category_id || null,
            supplier_id: supplier.suppliers_id || null,
            brand_id: brand.brand_id || null,
            unit_id: unit.unit_id || null,
            status: productData.status || "active",
            created_on: new Date(),
            gst: productData.gst || null,
            schedule: productData.schedule || null,
            base_quantity: sequelize.literal(`${req.body.quantity} * unit.conversion_factor`),
            base_unit_id: unit.base_unit_id || unit.unit_id,
          };

          // Remove unnecessary fields
          delete processedData.category;
          delete processedData.supplier_name;
          delete processedData.brand;

          // Check if product exists
          const existingProduct = await Product.findOne({
            where: { barcode: productData.barcode },
            transaction,
          });

          if (existingProduct) {
            const updatedProduct = await existingProduct.update(processedData, {
              transaction,
            });
            updatedProducts.push(updatedProduct);

            // Track unit increments for new products
            const currentCount = unitIncrements.get(unit.unit_id) || 0;
            unitIncrements.set(unit.unit_id, currentCount + 1);
          } else {
            const newProduct = await Product.create(processedData, {
              transaction,
            });
            createdProducts.push(newProduct);

            // Track unit increments for new products
            const currentCount = unitIncrements.get(unit.unit_id) || 0;
            unitIncrements.set(unit.unit_id, currentCount + 1);
          }
        } catch (error) {
          errors.push({
            barcode: productData.barcode,
            error: error.message,
          });
        }
      })
    );

    // If there were any errors, rollback the transaction
    if (errors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Some products failed to process",
        errors,
      });
    }

    // Update unit counts for all affected units
    for (const [unitId, increment] of unitIncrements) {
      await Unit.increment("no_of_products", {
        by: increment,
        where: { unit_id: unitId },
        transaction,
      });
    }

    // Commit transaction
    await transaction.commit();

    res.status(201).json({
      message: "Bulk upload completed successfully",
      success_count: createdProducts.length + updatedProducts.length,
      created_count: createdProducts.length,
      updated_count: updatedProducts.length,
      created_products: createdProducts,
      updated_products: updatedProducts,
    });
  } catch (error) {
    // Rollback transaction on error
    if (transaction) await transaction.rollback();

    console.error("Error in bulkUploadProducts:", error);
    res.status(500).json({
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
};

// search products
const searchProducts = async (req, res) => {
  try {
    const { Product, Category, Supplier, Brand } = await connectToDatabase();
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "Search parameter is required",
      });
    }

    const products = await Product.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { products_name: { [Op.like]: `%${search}%` } },
          { products_description: { [Op.like]: `%${search}%` } },
          { barcode: { [Op.like]: `%${search}%` } },
        ],
      },
      include: [
        {
          model: Category,
          attributes: ["category"],
        },
        {
          model: Supplier,
          attributes: ["suppliers_name"],
        },
        {
          model: Brand,
          attributes: ["brand"],
        },
      ],
      raw: true,
      nest: false,
    });

    // Transform the response
    const transformedProducts = products.map((product) => ({
      products_id: product.products_id,
      products_name: product.products_name,
      products_description: product.products_description,
      products_price: parseFloat(product.products_price),
      discount_price: parseFloat(product.discount_price),
      barcode: product.barcode,
      quantity: product.quantity,
      unit: product.unit,
      batch_number: product.batch_number,
      manufacturing_date: product.manufacturing_date,
      expiry_date: product.expiry_date,
      qty_alert: product.qty_alert,
      created_by: product.created_by,
      shelf_location: product.shelf_location,
      brand: product.brand,
      status: product.status,
      categories_name: product["category.category"],
      suppliers_name: product["supplier.suppliers_name"],
    }));

    res.status(200).json({
      count: transformedProducts.length,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    res.status(500).json({
      message: "Failed to search products",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductByBarcode,
  updateProductByBarcode,
  deleteProduct,
  bulkUploadProducts,
  searchProducts,
};
