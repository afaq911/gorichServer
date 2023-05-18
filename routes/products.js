const Products = require("../models/Products");
const { VerifyTokenAndAdmin, VerifyToken } = require("./VerifyToken");
const router = require("express").Router();

// ------------------------------ Add Products ------------------------------------------

router.post("/", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const newProduct = new Products(req.body);
    const savedProduct = await newProduct.save();
    res
      .status(200)
      .json({ data: savedProduct, message: "Product saved successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------------- Get All Products -------------------------------

router.get("/", VerifyToken, async (req, res) => {
  const moversQuery = req.query.movers;

  try {
    let products;
    if (moversQuery) {
      products = await Products.find().sort({ _id: -1 }).limit(3);
    } else {
      products = await Products.find().sort({ _id: -1 });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------------- Update Product -------------------------------

router.put("/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(200).json({ data: updatedProduct, message: "Product Updated" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// ------------------------------- Delete Products -------------------------------

router.delete("/:id", VerifyTokenAndAdmin, async (req, res) => {
  try {
    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json("Product Deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// --------------------------------- Get Single Product -------------------------------
router.get("/single/:id", VerifyToken, async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get Paginated user data Data --------------------------------------------

router.get("/paginate", VerifyTokenAndAdmin, async (req, res) => {
  try {
    const allproducts = await Products.find();
    const page = req.query.page;
    const limit = req.query.limit;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let results = {};
    results.total = allproducts.length;
    results.pageCount = Math.ceil(allproducts.length / limit);

    if (endIndex < allproducts.length) {
      results.next = {
        page: page + 1,
      };
    }

    if (startIndex > 0) {
      results.prev = {
        page: page - 1,
      };
    }

    results.result = allproducts.slice(startIndex, endIndex);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
