require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

PORT = process.env.PORT || 3000;
DB_URI = process.env.DB_URI || "";

const connectDB = require("./db/connect");
const { runCluster } = require("./controllers/clusters");

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const customers_routes = require("./routes/customers");
const drivers_routes = require("./routes/drivers");
const marketplaces_routes = require("./routes/marketplaces");
const products_routes = require("./routes/products");
const orders_routes = require("./routes/orders");
const payments_routes = require("./routes/payments");
const advertisements_routes = require("./routes/advertisements");
const mails_routes = require("./routes/mails");
const addresses_routes = require("./routes/addresses");
const documents_routes = require("./routes/documents");
const paymentmethods_routes = require("./routes/paymentmethods");
const uploadmethods_routes = require("./routes/uploader");
const otpmethods_routes = require("./routes/otps");
const subscriptions_routes = require("./routes/subscriptions");
const favourites_routes = require("./routes/favourites");
const carts_routes = require("./routes/carts");
const ratingdrivers_routes = require("./routes/ratingdrivers");
const ratingmarketplaces_routes = require("./routes/ratingmarketplaces");
const ratingproducts_routes = require("./routes/ratingproducts");
const notifications_routes = require("./routes/notifications");

const stripe_routes = require("./routes/stripepayment");
const square_routes = require("./routes/squarepayment");
const sendgrid_routes = require("./routes/sendgrid");
const fcm_routes = require("./routes/fcm");
const googlemap_routes = require("./routes/googlemap");

app.use("/api/customers", customers_routes);
app.use("/api/drivers", drivers_routes);
app.use("/api/marketplaces", marketplaces_routes);
app.use("/api/products", products_routes);
app.use("/api/orders", orders_routes);
app.use("/api/payments", payments_routes);
app.use("/api/advertisements", advertisements_routes);
app.use("/api/mails", mails_routes);
app.use("/api/addresses", addresses_routes);
app.use("/api/documents", documents_routes);
app.use("/api/paymentmethods", paymentmethods_routes);

app.use("/api/image", uploadmethods_routes);
app.use("/api/otps", otpmethods_routes);
app.use("/api/subscriptions", subscriptions_routes);
app.use("/api/favourites", favourites_routes);
app.use("/api/carts", carts_routes);
app.use("/api/rating/drivers", ratingdrivers_routes);
app.use("/api/rating/marketplaces", ratingmarketplaces_routes);
app.use("/api/rating/products", ratingproducts_routes);
app.use("/api/notifications", notifications_routes);

app.use("/api/payment", stripe_routes);
app.use("/api/payment/v1", square_routes);
app.use("/api/send", sendgrid_routes);
app.use("/api/notify", fcm_routes);
app.use("/api/map", googlemap_routes);

app.get("/", (req, res) => {
  res.send("Server Running...");
});

const start = async () => {
  try {
    await connectDB(DB_URI);
    app.listen(PORT, () => {
      console.log(`server running on ${PORT}...`);
    });
  } catch (e) {
    console.log(`server running error: ${e}`);
  }
};

start();
// runCluster(start);
