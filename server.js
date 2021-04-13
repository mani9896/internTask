const express = require("express");
const connectDB = require("./config/db.js");
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/module", require("./routes/api/module"));
app.use("/api/courses", require("./routes/api/courses"));

app.listen(PORT, () => {
  console.log("Server is up on " + PORT);
});
