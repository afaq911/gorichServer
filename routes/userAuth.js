const Users = require("../models/Users");
const router = require("express").Router();
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

// ------------------------------------- Register User ---------------------------------
router.post("/register", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  try {
    const data = req.body;

    const isUserEmail = await Users.findOne({ email: data?.email });
    if (isUserEmail) {
      res.status(500).json("Email already registered");
      return;
    }

    const isUserMobileNo = await Users.findOne({ mobileno: data?.mobileno });
    if (isUserMobileNo) {
      res.status(500).json("Phone Number already registered");
      return;
    }

    const newUser = new Users(data);
    const savedUsers = await newUser.save();

    res
      .status(200)
      .json({ data: savedUsers, message: "Registered successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// --------------------------------  Users Login --------------------------------

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    const isUser = await Users.findOne({ email: data?.email });

    if (!isUser) {
      res.status(404).json("Wrong Email");
      return;
    }

    const DecreptedPassword = CryptoJs.AES.decrypt(
      isUser?.password,
      process.env.CRYPTO_SECRET
    ).toString(CryptoJs.enc.Utf8);

    if (DecreptedPassword !== data?.password) {
      res.status(404).json("Wrong Password");
      return;
    } else {
      const accesstoken = jwt.sign(
        {
          _id: isUser?._id.toString(),
          email: isUser?.email,
          mobileno: isUser?.mobileno,
        },
        process.env.JWT_PRIVATE
      );
      const { password, ...others } = isUser?._doc;
      const userData = { ...others, accesstoken };
      res
        .status(200)
        .json({ data: userData, message: "Logged In Successfully" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
