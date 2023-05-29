const Payments = require("../models/Payments");
const Products = require("../models/Products");
const Users = require("../models/Users");
const { VerifyTokenAndAdmin } = require("./VerifyToken");
const router = require("express").Router();

const FilterUsers = (data, search) => {
  return data?.filter(
    (user) =>
      user?.fullname
        ?.toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) ||
      user?.email?.toLocaleLowerCase()?.includes(search.toLocaleLowerCase()) ||
      user?.mobileno
        ?.toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) ||
      user?._id?.toString() === search.toLocaleLowerCase()
  );
};

// ------------------------------ Add Products ------------------------------------------

router.post("/users", VerifyTokenAndAdmin, async (req, res) => {
  let dates = req.body.dates;
  let search = req.body.search;
  let country = req.body.country?.toLocaleLowerCase();
  let status = req.body.status;

  try {
    let allusers;

    if (search && dates?.dateFrom && country && status && status !== "all") {
      const getusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
        country: country,
        isActive: status,
      });
      allusers = FilterUsers(getusers, search);
    } else if (search && dates?.dateFrom && country) {
      const getusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
        country: country,
      });
      allusers = FilterUsers(getusers, search);
    } else if (search && dates?.dateFrom) {
      const getusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
      });
      allusers = FilterUsers(getusers, search);
    } else if (country && dates?.dateFrom) {
      allusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
        country: country,
      });
    } else if (search && country) {
      const getusers = await Users.find({
        country: country,
      });
      allusers = FilterUsers(getusers, search);
    } else if (dates?.dateFrom && status && status !== "all") {
      allusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
        isActive: status,
      });
    } else if (country && status && status !== "all") {
      allusers = await Users.find({
        country: country,
        isActive: status,
      });
    } else if (search && status && status !== "all") {
      const queryusers = await Users.find({
        isActive: status,
      });

      allusers = FilterUsers(queryusers, search);
    } else if (dates?.dateFrom) {
      allusers = await Users.find({
        createdAt: {
          $gte: dates.dateFrom,
          $lt: dates.dateTo,
        },
      });
    } else if (search) {
      const getusers = await Users.find();
      allusers = FilterUsers(getusers, search);
    } else if (country) {
      allusers = await Users.find({ country: country });
    } else if (status && status !== "all") {
      allusers = await Users.find({ isActive: status });
    } else {
      allusers = await Users.find();
    }
    res.status(200).json(allusers);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Payments Reports Here -----------------------------------------------------------

router.post("/payments", VerifyTokenAndAdmin, async (req, res) => {
  let dates = req.body.dates;
  let search = req.body.search?.toLocaleLowerCase();
  var today = new Date();
  var pastDate = new Date(today);
  pastDate.setFullYear(pastDate.getFullYear() - 100);

  try {
    let payments = await Payments.find({
      $and: [
        {
          createdAt: { $gte: dates?.dateFrom || pastDate, $lt: dates?.dateTo },
        },
      ],
      $or: [{ accountno: { $regex: search } }],
    });

    res.status(200).json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Products Reports Here -----------------------------------------------------------

router.post("/products", VerifyTokenAndAdmin, async (req, res) => {
  let dates = req.body.dates;
  let search = req.body.search?.toLocaleLowerCase();
  var today = new Date();
  var pastDate = new Date(today);
  pastDate.setFullYear(pastDate.getFullYear() - 100);

  try {
    let products = await Products.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(dates?.dateFrom) || pastDate,
                $lt: new Date(dates?.dateTo),
              },
            },
          ],
          $or: [{ title: { $regex: search, $options: "i" } }],
        },
      },
      {
        $lookup: {
          from: "bids",
          localField: "_id",
          foreignField: "productId",
          as: "productInfo",
        },
      },
      {
        $addFields: {
          TotalInvestments: { $size: "$productInfo" },
        },
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
