require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const webRoutes = require("./routers/web");

const port = process.env.PORT || 3000;
const host = process.env.HOST_NAME || "localhost";

app.use(cors());

app.use(express.json());

app.use("/api", webRoutes);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, host, () => {
	console.log(`Server is running at http://${host}:${port}`);
});
