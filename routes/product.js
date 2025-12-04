import express from "express";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -----------------------
   CREATE PRODUCT (Admin)
--------------------------*/
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, image, description, category, price, countInStock } = req.body;

    const product = await Product.create({
      name,
      image,
      description,
      category,
      price,
      countInStock,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------
   GET ALL PRODUCTS
   (Public)
--------------------------*/
router.get("/", async (req, res) => {
  try {
    const { keyword } = req.query;

    let filter = {};

    if (keyword) {
      filter = {
        name: { $regex: keyword, $options: "i" }
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------
   GET SINGLE PRODUCT
--------------------------*/
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------
   UPDATE PRODUCT (Admin)
--------------------------*/
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, image, description, category, price, countInStock } = req.body;

    product.name = name || product.name;
    product.image = image || product.image;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price ?? product.price;
    product.countInStock = countInStock ?? product.countInStock;

    const updatedProduct = await product.save();

    res.json(updatedProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* -----------------------
   DELETE PRODUCT (Admin)
--------------------------*/
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
