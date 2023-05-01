const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage,
});

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    throw Error("No File Found");
  } else {
    let filename = req.file?.filename;
    var fullUrl =
      req.protocol + "://" + req.get("host") + "/uploads" + "/" + filename;
    res
      .status(200)
      .json({ url: fullUrl, message: "File Uploaded Successfully" });
  }
});

module.exports = router;
