const connectToDatabase = require("../../misc/db");
const { Op, Sequelize, fn, col, where } = require("sequelize");

// get product details
const searchStoreProducts = async (req, res) => {
  try {
    const { Products, StoreProducts, Combo } = await connectToDatabase();
    const { search, store_id } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "Search parameter is required",
      });
    }

    const productsData = await StoreProducts.findAll({
      where: {
        // status: "Confirmed",
        store_id: store_id,
      },
      include: [
        {
          model: Products,
          where: {
            [Op.or]: [{ products_name: { [Op.like]: `%${search}%` } }, { barcode: { [Op.like]: `%${search}%` } }],
          },
        },
      ],
    });

    const combosData = await Combo.findAll({
      where: {
        store_id,
        combo_name: { [Op.like]: `%${search}%` },
      },
    });

    // Transform the response
    let transformedProducts;
    if (!productsData || productsData.length === 0) {
      transformedProducts = combosData.map((combo) => ({
        products_name: combo.combo_name,
        products_price: parseFloat(combo.combo_price),
        discount_price: parseFloat(combo.combo_price),
        barcode: combo.combo_id,
        is_combo: true,
      }));
    } else {
      transformedProducts = productsData.map((p) => ({
        store_product_id: p.id,
        store_id: p.store_id,
        quantity: p.quantity,
        status: p.status,
        products_id: p.pos_product.products_id,
        products_name: p.pos_product.products_name,
        products_price: parseFloat(p.pos_product.products_price),
        discount_price: parseFloat(p.pos_product.discount_price),
        barcode: p.pos_product.barcode,
        gst: p.pos_product.gst,
        //   unit: p.Products.unit,
        qty_alert: p.pos_product.qty_alert,
        is_combo: false,
      }));
    }

    return res.status(200).json({
      count: transformedProducts.length,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return res.status(500).json({
      message: "Failed to search products",
      error: error.message,
    });
  }
};

// billing products
const billing = async (req, res) => {
  let transaction;
  const { StoreProducts, ComboProduct, OrderItems, Orders, sequelize, Combo, Products } = await connectToDatabase();
  transaction = await sequelize.transaction();

  const {
    customer_id,
    customer_joined_by,
    user_id,
    total_amount,
    payment_method,
    store_id,
    is_existing_customer,
    customer_phone,
    products,
  } = req.body;

  try {
    const ordersData = {
      customer_id,
      user_id,
      total_amount,
      payment_method,
      store_id,
      customer_phone,
      is_existing_customer,
    };

    const order = await Orders.create(ordersData, { transaction });
    const orderId = order.orders_id;

    let updateComboProductQuantity = true;

    if (Array.isArray(products)) {
      for (const prod of products) {
        const orderItem = {
          order_id: orderId,
          is_combo: prod.is_combo,
          price: prod.price,
          quantity: prod.quantity,
        };

        // checking product quantity
        // const checkQuantity = await StoreProducts.findOne({
        //   where: { product_id: prod.product_id },
        //   include: [
        //     {
        //       model: Products,
        //       attributes: ["products_name"],
        //     },
        //   ],
        //   raw: true,
        // });
        // console.log(checkQuantity);
        // if (checkQuantity.quantity < prod.quantity) {
        //   return res.status(400).json({
        //     message: `No quantity available for ${checkQuantity["pos_products"]}`,
        //     availabel_quantity: checkQuantity.quantity,
        //   });
        // }

        if (prod.is_combo === true) {
          // recieving combo_id as product_id from the frontend if the item is from combo
          const comboProduct = await ComboProduct.findAll({ where: { combo_id: prod.combo_id }, raw: true });
          const productIds = comboProduct.map((p) => p.product_id);

          for (let productId of productIds) {
            const finalData = {
              ...orderItem,
              product_id: productId,
            };

            await OrderItems.create(finalData, { transaction });

            await StoreProducts.update(
              { quantity: Sequelize.literal(`quantity - ${parseInt(prod.quantity)}`) },
              {
                where: { product_id: productId, store_id: store_id },
                transaction,
              }
            );
          }

          if (updateComboProductQuantity) {
            await Combo.update(
              { combo_quantity: Sequelize.literal(`combo_quantity - ${parseInt(prod.quantity)}`) },
              { where: { combo_id: prod.combo_id, store_id: store_id, status: "active" }, transaction }
            );
          }
          updateComboProductQuantity = false;
        } else {
          // normal product
          const finalData = {
            ...orderItem,
            product_id: prod.product_id,
          };
          await OrderItems.create(finalData, { transaction });
          await StoreProducts.update(
            { quantity: Sequelize.literal(`quantity - ${parseInt(prod.quantity)}`) },
            { where: { product_id: prod.product_id, store_id: store_id }, transaction }
          );
        }
      }
    }

    if (is_existing_customer) {
      await disturbuteEarnings(transaction, customer_joined_by, customer_id, total_amount);
    }

    await transaction.commit();
    return res.status(200).json({ message: "purchased successfully", success: true, invoiceNumber: `INV-${orderId}` });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error billing:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// helper function to disturbute earnings
const disturbuteEarnings = async (transaction, customer_joined_by, customer_id, total_amount) => {
  const { Employee, Orders } = await connectToDatabase();

  const totalAmountData = await Orders.findOne({
    attributes: [[fn("SUM", col("total_amount")), "total_amount"]],
    where: {
      [Op.and]: [
        where(fn("MONTH", col("order_date")), new Date().getMonth() + 1),
        where(fn("YEAR", col("order_date")), new Date().getFullYear()),
      ],
      customer_id: customer_id,
    },
  });

  const currentMonthTotalOrdersAmount = totalAmountData.get("total_amount") || 0;
  console.log("Total amount for this month:", currentMonthTotalOrdersAmount);

  let joinedBy = customer_joined_by;

  const currentMonthAmountAndCurrenOrderAmount = currentMonthTotalOrdersAmount + total_amount;

  if (currentMonthTotalOrdersAmount < 2000 && currentMonthAmountAndCurrenOrderAmount >= 2000) {
    while (joinedBy) {
      const joinedBydata = await fetchJoinedByData(joinedBy);
      let monthlyEarnings;
      switch (joinedBydata.role) {
        case "jma":
          monthlyEarnings = 27.5;
          break;
        case "sma":
          monthlyEarnings = 1;
          break;
        case "mma":
          monthlyEarnings = 5.17;
          break;
        case "dmh":
          monthlyEarnings = 0.17;
          break;
        case "zmh":
          monthlyEarnings = 1;
          break;
        case "smh":
          monthlyEarnings = 1.51;
          break;
        default:
          monthlyEarnings = 0;
      }

      const [updated] = await Employee.update(
        {
          monthly_income: Sequelize.literal(`monthly_income + ${monthlyEarnings}`),
        },
        { where: { refferel_code: joinedBy }, transaction }
      );

      if (updated > 0) {
        console.log("updated employee earnings");
      }

      joinedBy = joinedBydata.joined_by;
    }
  }
};

// helper function to fetch the employee details
const fetchJoinedByData = async (joinedBy) => {
  const { Employee } = await connectToDatabase();
  const checkJoindedBy = await Employee.findOne({ where: { refferel_code: joinedBy } });
  if (!checkJoindedBy) {
    throw new Error("Joined by data not found");
  }
  const { ...joinedByDetails } = checkJoindedBy.dataValues;
  return joinedByDetails;
};

//  function to check combo purchased or not
const checkCustomerPurchasing = async (req, res) => {
  try {
    const { Orders, OrderItems, Customer } = await connectToDatabase();

    const customerData = await Customer.findOne({
      where: { phone: req.params.phone },
      attributes: ["slno", "name", "phone", "joined_by"],
    });

    if (!customerData) {
      console.log("Customer not existing");
    }

    const customerOrderData = await Orders.findAll({
      where: { customer_phone: req.params.phone },
      include: [
        {
          model: OrderItems,
          attributes: ["is_combo"],
        },
      ],
      raw: true,
    });

    // check if any is_combo = true
    const hasComboPurchase = customerOrderData.some((order) => order["pos_order_items.is_combo"] === true);

    if (hasComboPurchase) {
      return res.status(200).json({
        data: customerData,
        message: "Already purchased combo",
        is_purchased_combo: true,
      });
    } else {
      return res.status(200).json({
        data: customerData,
        message: "No combo purchased",
        is_purchased_combo: false,
      });
    }
  } catch (e) {
    console.error("Error in checkCustomerPurchasing:", e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { searchStoreProducts, billing, checkCustomerPurchasing };
