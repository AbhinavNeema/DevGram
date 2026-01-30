const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { initSocket } = require("./socket");
const path = require("path");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

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
app.use("/workspaces", require("./routes/workspace"));
app.use("/channels", require("./routes/Channel"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/feed", require("./routes/feed"));
const server = http.createServer(app);
const io = initSocket(server);

// 🔥 attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});
const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);