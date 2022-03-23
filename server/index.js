const express = require("express");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
