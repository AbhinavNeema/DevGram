const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { initSocket } = require("./socket");
const auth = require("./middleware/auth");
const workspaceController = require("./controllers/workspaceController");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

const server = http.createServer(app);
initSocket(server);

app.use("/auth", require("./routes/authRoutes"));
app.use("/projects", require("./routes/projectRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/blogs", require("./routes/blogRoutes"));
app.use("/messages", require("./routes/message"));
app.use("/search", require("./routes/searchRoutes"));
app.use("/workspaces", require("./routes/workspace"));
app.use("/channels", require("./routes/Channel"));
app.use("/feed", require("./routes/feed"));
app.post("/accept-token", auth, workspaceController.acceptInviteByToken);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);