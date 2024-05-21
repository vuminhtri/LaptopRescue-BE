const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

require("dotenv").config();

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connection established..."))
    .catch((error) =>
        console.error("MongoDB connection failed: ", error.message)
    );

const orderSchema = new mongoose.Schema(
    {
        nameCustomer: String,
        emailCustomer: String,
        phoneCustomer: String,
        descriptionError: String,
        pic: String,
        statusOrder: { type: String, default: "Pending" },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

app.post("/orders/create-order", async (req, res) => {
    try {
        const orderData = req.body;
        const newOrder = new Order({
            nameCustomer: orderData.name,
            emailCustomer: orderData.email,
            phoneCustomer: orderData.phoneNum,
            descriptionError: orderData.description
        });
        await newOrder.save();
        res.status(201).send(
            "Đã gửi yêu cầu sửa chữa thành công! Vui lòng chờ bên mình liên hệ lại qua email/số điện thoại/zalo sau 15 phút"
        );
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "Đã xảy ra lỗi trong quá trình gửi form yêu cầu sửa chữa. Vui lòng thử lại sau! 😢😥😰"
        );
    }
});

app.get("/orders/get-orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).send(JSON.stringify(orders));
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "Internal Server Error. Failed to retrieve order list!"
        );
    }
});

app.put("/orders/:orderId/update-status", async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { statusOrder } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send("Cannot find this order!");
        }
        order.statusOrder = statusOrder;
        await order.save();
        res.status(200).send("Order status updated successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "Internal Server Error. Unable to update order status!"
        );
    }
});
app.put("/orders/:orderId/update-pic", async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { picOrder } = req.body;
        console.log(picOrder)
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).send("Cannot find this order!");
        }
        order.pic = picOrder;
        order.statusOrder = "Assigned"
        await order.save();
        res.status(200).send(`Person in Charge ${picOrder} had assigned work!`);
    } catch (error) {
        console.error(error);
        res.status(500).send(
            "Internal Server Error. Unable to update order status!"
        );
    }
});

app.post("/check-login-admin", async (req, res) => {
    try {
        const { userName, password } = req.body;
        if (userName !== "admin" || password !== "admin")
            return res
                .status(400)
                .send(
                    "Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại!"
                );
        res.status(200).send("Đăng nhập thành công!");
    } catch (error) {
        res.status(500).send("Lỗi máy chủ nội bộ. Vui lòng truy cập lại sau!");
    }
});

app.get("/", (req, res) => {
    res.send("Server is running...");
});

app.listen(5000, () => console.log("Server is running at port: 5000"));
