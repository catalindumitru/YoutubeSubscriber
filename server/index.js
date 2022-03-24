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

const youtube = google.youtube("v3");

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
    console.log(tokens);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    res.redirect(
      process.env.CLIENT +
        `?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  });
});

const getSubscriptions = async (tokens) => {
  const credentials = {
    access_token: tokens["accessToken"],
    refresh_token: tokens["destToken"],
  };
  oauth2Client.setCredentials(credentials);
  const subscriptions = [];

  const request = youtube.subscriptions.list({
    auth: oauth2Client,
    part: "snippet",
    mine: true,
  });
  let data = await youtube.subscriptions
    .list({
      auth: oauth2Client,
      part: "snippet",
      mine: true,
    })
    .then((res) => res.data);

  while (data) {
    subscriptions.push(...data.items);
    if (data.nextPageToken) {
      data = await youtube.subscriptions
        .list({
          auth: oauth2Client,
          part: "snippet",
          mine: true,
          pageToken: data.nextPageToken,
        })
        .then((res) => res.data);
    } else data = null;
  }
  return subscriptions.length;
};

const addSubscriptions = (token) => {};

app.post("/sync", async (req, res) => {
  const tokens = req.body;
  const sourceTokens = tokens["source"];
  const destTokens = tokens["dest"];
  console.log(sourceTokens);

  const count = await getSubscriptions(sourceTokens);
  addSubscriptions(destTokens);

  res.send({ count });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
