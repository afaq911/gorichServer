const { default: mongoose } = require("mongoose");
const Payments = require("../models/Payments");
const Products = require("../models/Products");
const Users = require("../models/Users");
const { VerifyTokenAndAdmin } = require("./VerifyToken");

const router = require("express").Router();

// Total deposit , users , products stats -------------------------------

router.get("/total", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const totalPayment = await Payments.aggregate([
      { $match: { type: 1, status: 2 } },
      { $addFields: { amount: { $toDouble: "$amount" } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const Productstotal = await Products.count();
    const userstotal = await Users.count();

    res.status(200).json({
      users: userstotal,
      products: Productstotal,
      payments: totalPayment[0]?.total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Get stats of users of last 6 months -------------------------------

router.get("/users", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setUTCHours(0, 0, 0, 0);
    startOfMonth.setUTCMonth(startOfMonth.getUTCMonth() - 4);

    const userStats = await Users.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $project: {
          monthNo: { $month: "$createdAt" },
        },
      },
      {
        $addFields: {
          month: {
            $let: {
              vars: {
                monthsInString: [
                  ,
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "June",
                  "July",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
              },
              in: {
                $arrayElemAt: ["$$monthsInString", "$monthNo"],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(userStats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
