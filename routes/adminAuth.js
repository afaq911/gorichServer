const router = require("express").Router();
const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Admins = require("../models/Admins");
const { VerifyTokenAndAdmin } = require("./VerifyToken");

// ------------------------------------- Register Admin ---------------------------------
router.post("/register", VerifyTokenAndAdmin, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  try {
    const data = req.body;

    const isAdminEmail = await Admins.findOne({ email: data?.email });
    if (isAdminEmail) {
      res.status(500).json("Email already registered");
      return;
    }

    const isAdminMobileNo = await Admins.findOne({ mobileno: data?.mobileno });
    if (isAdminMobileNo) {
      res.status(500).json("Phone Number already registered");
      return;
    }

    const newAdmin = new Admins(data);
    const savedAdmins = await newAdmin.save();

    res
      .status(200)
      .json({ data: savedAdmins, message: "Registered successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// --------------------------------  ADMINS Login --------------------------------

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    const isAdmin = await Admins.findOne({ email: data?.email });

    if (!isAdmin) {
      res.status(404).json("Wrong Email");
      return;
    }

    const DecreptedPassword = CryptoJs.AES.decrypt(
      isAdmin?.password,
      process.env.CRYPTO_SECRET
    ).toString(CryptoJs.enc.Utf8);

    if (DecreptedPassword !== data?.password) {
      res.status(404).json("Wrong Password");
      return;
    } else {
      const accesstoken = jwt.sign(
        {
          _id: isAdmin?._id.toString(),
          email: isAdmin?.email,
          mobileno: isAdmin?.mobileno,
          isAdmin: isAdmin?.isAdmin,
        },
        process.env.JWT_PRIVATE
      );
      const { password, ...others } = isAdmin?._doc;
      const userData = { ...others, accesstoken };
      res
        .status(200)
        .json({ data: userData, message: "Logged In Successfully" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------------------------------- Update Admin ------------------------

router.put("/:id", VerifyTokenAndAdmin, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.CRYPTO_SECRET
    ).toString();
  }

  try {
    const data = req.body;

    const isAdminEmail = await Admins.findOne({ email: data?.email });
    if (isAdminEmail) {
      res.status(500).json("Email already registered");
      return;
    }

    const isAdminMobileNo = await Admins.findOne({ mobileno: data?.mobileno });
    if (isAdminMobileNo) {
      res.status(500).json("Phone Number already registered");
      return;
    }

    const updatedUser = await Admins.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    const { password, ...others } = updatedUser?._doc;
    res.status(200).json({ data: others, message: "Updated Successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ---------------------------------------- update password ---------------------------------------

router.put("/update/password/:id", async (req, res) => {
  if (req.body.newpassword) {
    req.body.newpassword = CryptoJs.AES.encrypt(
      req.body.newpassword,
      process.env.CRYPTO_SECRET
    ).toString();
  }
  try {
    const data = req.body;
    const user = await Admins.findById(req.params.id);
    const DecreptedPassword = CryptoJs.AES.decrypt(
      user?.password,
      process.env.CRYPTO_SECRET
    ).toString(CryptoJs.enc.Utf8);

    if (DecreptedPassword !== data?.password) {
      res.status(404).json("Wrong Present Password");
      return;
    } else {
      await user.updateOne({ password: data?.newpassword });
      res.status(200).json("Password updated successfully");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
