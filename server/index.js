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
    refresh_token: tokens["refreshToken"],
  };
  oauth2Client.setCredentials(credentials);
  const subscriptions = [];

  let data;
  try {
    data = await youtube.subscriptions
      .list({
        auth: oauth2Client,
        part: "snippet",
        mine: true,
      })
      .then((res) => res.data);
  } catch (err) {
    console.log(err);
  }

  while (data) {
    data.items.forEach((subscription) =>
      subscriptions.push(subscription.snippet.resourceId.channelId)
    );
    if (data.nextPageToken) {
      try {
        data = await youtube.subscriptions
          .list({
            auth: oauth2Client,
            part: "snippet",
            mine: true,
            pageToken: data.nextPageToken,
          })
          .then((res) => res.data);
      } catch (err) {
        console.log(err);
      }
    } else data = null;
  }

  return subscriptions;
};

const addSubscriptions = async (tokens, subscriptions) => {
  const credentials = {
    access_token: tokens["accessToken"],
    refresh_token: tokens["refreshToken"],
  };
  oauth2Client.setCredentials(credentials);

  const resourceBody = {
    snippet: {
      resourceId: {
        kind: "youtube#channel",
        channelId: "",
      },
    },
  };

  let count = 0;

  for (const subscriptionId of subscriptions) {
    resourceBody.snippet.resourceId.channelId = subscriptionId;
    try {
      await youtube.subscriptions.insert({
        auth: oauth2Client,
        part: "snippet",
        resource: resourceBody,
      });
      count += 1;
    } catch (err) {
      console.log(err);
    }
  }

  return count;
};

app.post("/sync", async (req, res) => {
  const tokens = req.body;
  const sourceTokens = tokens["source"];
  const destTokens = tokens["dest"];

  const subscriptions = await getSubscriptions(sourceTokens);
  const count = await addSubscriptions(destTokens, subscriptions);

  res.send({ count });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
