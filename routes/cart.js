import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* --------------------------
   GET USER CART
---------------------------*/
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------
   ADD TO CART
---------------------------*/
router.post("/add", protect, async (req, res) => {
  try {
    const { productId, qty } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: req.user._id });

    // IF NO CART EXISTS CREATE ONE
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, qty }]
      });
      return res.json(cart);
    }

    // If item already exists → update qty
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }

    await cart.save();

    res.json(cart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------
   UPDATE CART ITEM QTY
---------------------------*/
router.put("/update", protect, async (req, res) => {
  try {
    const { productId, qty } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty = qty;
    await cart.save();

    res.json(cart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------
   REMOVE ITEM FROM CART
---------------------------*/
router.delete("/remove/:id", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart empty" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.id
    );

    await cart.save();

    res.json(cart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
