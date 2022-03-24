const express = require("express");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.SERVER + "/handle-google-redirect" // server redirect url handler
);

app.post("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube"],
    prompt: "consent",
  });
  res.send({ url });
});

app.get("/handle-google-redirect", (req, res) => {
  const code = req.query.code;
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      console.log(err.message);
      throw new Error("Issue with Login", err.message);
    }
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    res.redirect(
      process.env.CLIENT +
        `?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
