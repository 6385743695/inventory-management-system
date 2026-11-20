
// Import Express framework
const express = require("express");

// Import File System module
const fs = require("fs");
const path = require("path");

// Create Express application
const app = express();

// Set server port
const PORT = 3000;

// Middleware to accept JSON data
app.use(express.json());

// Path of products JSON file
const productsFile = path.join(__dirname, "data", "products.json");

// Read products from JSON file
function getProducts() {
    const data = fs.readFileSync(productsFile, "utf8");
    return JSON.parse(data);
}

// Save products into JSON file
function saveProducts(products) {
    fs.writeFileSync(
        productsFile,
        JSON.stringify(products, null, 2)
    );
}

// Home route
app.get("/", (req, res) => {
    res.send("Inventory Management System API is running!");
});

// GET METHOD - Display all products
app.get("/getProducts", (req, res) => {
    const products = getProducts();

    res.status(200).json(products);
});

// POST METHOD - Add a new product
app.post("/addProduct", (req, res) => {
    const { productId, productName, description, Stock } = req.body;

    // Validate product details
    if (
        productId === undefined ||
        !productName ||
        !description ||
        typeof Stock !== "boolean"
    ) {
        return res.status(400).json({
            message: "Please provide all product details."
        });
    }

    const products = getProducts();

    // Check duplicate product ID
    const existingProduct = products.find(
        p => p.productId === Number(productId)
    );

    if (existingProduct) {
        return res.status(400).json({
            message: "Product ID already exists."
        });
    }

    // Create new product
    const newProduct = {
        productId: Number(productId),
        productName,
        description,
        Stock
    };

    // Add product to array
    products.push(newProduct);

    // Save updated data
    saveProducts(products);

    res.status(201).json({
        message: "Product added successfully!",
        product: newProduct
    });
});

// DELETE METHOD - Delete product using ID
app.delete("/deleteProduct/:productId", (req, res) => {
    const productId = Number(req.params.productId);

    const products = getProducts();

    // Check whether product exists
    const exists = products.some(
        p => p.productId === productId
    );

    if (!exists) {
        return res.status(404).json({
            message: "Product not found."
        });
    }

    // Remove selected product
    const updatedProducts = products.filter(
        p => p.productId !== productId
    );

    // Save updated products
    saveProducts(updatedProducts);

    res.status(200).json({
        message: "Product deleted successfully!"
    });
});

// PUT METHOD - Update product description
app.put("/updateProduct/:productId", (req, res) => {
    const productId = Number(req.params.productId);
    const { description } = req.body;

    // Validate description
    if (!description) {
        return res.status(400).json({
            message: "Please provide a description."
        });
    }

    const products = getProducts();

    // Find product using ID
    const product = products.find(
        p => p.productId === productId
    );

    if (!product) {
        return res.status(404).json({
            message: "Product not found."
        });
    }

    // Update description
    product.description = description;

    // Save updated data
    saveProducts(products);

    res.status(200).json({
        message: "Product description updated successfully!",
        product: product
    });
});

// Start Express server
app.listen(PORT, () => {
    console.log(
        `Inventory Management System API is running on port ${PORT}`
    );
});
