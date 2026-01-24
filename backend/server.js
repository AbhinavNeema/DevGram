const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { initSocket } = require("./socket");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.use("/auth", require("./routes/authRoutes"));
app.use("/projects", require("./routes/projectRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/blogs", require("./routes/blogRoutes"));
app.use("/messages", require("./routes/message"));
app.use("/search",require("./routes/searchRoutes"))
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);