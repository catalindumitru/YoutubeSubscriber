import React, { useState, useEffect } from "react";

import Alert from "@mui/material/Alert";

import youtube_logo from "./images/youtube_logo.png";
import sync_logo from "./images/sync_logo.png";
import checked_logo from "./images/checked_logo.png";

import "./App.css";

const App = () => {
  if (!sessionStorage.getItem("target"))
    sessionStorage.setItem("target", JSON.stringify(null));
  if (!sessionStorage.getItem("tokens"))
    sessionStorage.setItem("tokens", JSON.stringify({}));

  const [sourceLoggedIn, setSourceLoggedIn] = useState(
    JSON.parse(sessionStorage.getItem("sourceLoggedIn")) || false
  );
  const [destLoggedIn, setDestLoggedIn] = useState(
    JSON.parse(sessionStorage.getItem("destLoggedIn")) || false
  );
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [oneMissing, setOneMissing] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [showCount, setShowCount] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("sourceLoggedIn", JSON.stringify(sourceLoggedIn));
  }, [sourceLoggedIn]);

  useEffect(() => {
    sessionStorage.setItem("destLoggedIn", JSON.stringify(destLoggedIn));
  }, [destLoggedIn]);

  useEffect(() => {
    if (alreadyLoggedIn) {
      setTimeout(() => {
        setAlreadyLoggedIn(false);
      }, 3000);
    }
  }, [alreadyLoggedIn]);

  useEffect(() => {
    if (oneMissing) {
      setTimeout(() => {
        setOneMissing(false);
      }, 3000);
    }
  }, [oneMissing]);

  useEffect(() => {
    const setLoggedIn = (target) => {
      if (target === "source") return setSourceLoggedIn;
      if (target === "dest") return setDestLoggedIn;
    };

    const handleTokenFromQueryParams = () => {
      const query = new URLSearchParams(window.location.search);
      const accessToken = query.get("accessToken");
      const refreshToken = query.get("refreshToken");
      if (!accessToken || !refreshToken) return;

      const target = JSON.parse(sessionStorage.getItem("target"));
      if (!target) return;

      const tokens = JSON.parse(sessionStorage.getItem("tokens"));

      tokens[target] = {
        // eslint-disable-next-line no-useless-computed-key
        ["accessToken"]: accessToken,
        // eslint-disable-next-line no-useless-computed-key
        ["refreshToken"]: refreshToken,
      };

      sessionStorage.setItem("target", JSON.stringify(null));
      sessionStorage.setItem("tokens", JSON.stringify(tokens));
      setLoggedIn(target)(true);

      window.history.replaceState(null, null, window.location.pathname);
    };

    handleTokenFromQueryParams();
  }, []);

  const handleLogin = (target) => async (e) => {
    const isLoggedIn = (t) => {
      if (t === "source") return sourceLoggedIn;
      if (t === "dest") return destLoggedIn;
    };

    if (isLoggedIn(target)) {
      setAlreadyLoggedIn(true);
      return;
    }

    e.preventDefault();
    try {
      const url = await fetch("/login", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => data.url);

      sessionStorage.setItem("target", JSON.stringify(target));
      window.location.href = url;
    } catch (error) {
      console.log(error.message);
      throw new Error("Issue with Login", error.message);
    }
  };

  const handleSync = async () => {
    if (!sourceLoggedIn || !destLoggedIn) {
      setOneMissing(true);
      return;
    }
    const tokens = JSON.parse(sessionStorage.getItem("tokens"));
    const count = await fetch("/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // eslint-disable-next-line no-useless-computed-key
      body: JSON.stringify(tokens),
    })
      .then((res) => res.json())
      .then((data) => data.count);
    setSubscriptionCount(count);
    setShowCount(true);
  };

  return (
    <div className="App">
      <div className="title">
        <span className="title-text" style={{ color: "#E22B26" }}>
          YouTube
        </span>
        <span className="title-text" style={{ color: "black" }}>
          {" "}
          Subscriptions
        </span>
        <span className="title-text" style={{ color: "#41b9b3" }}>
          {" "}
          Sync
        </span>
        <br />
        <img src={youtube_logo} alt="YouTube Logo" className="youtube-logo" />
        <img src={sync_logo} alt="Sync Logo" className="sync-logo" />
      </div>

      <table className="user-input-table">
        <tbody>
          <tr>
            <td>
              <div className="login-button" onClick={handleLogin("source")}>
                Source Channel Login
              </div>
            </td>
            <td>
              <div className="login-button" onClick={handleLogin("dest")}>
                Destination Channel Login
              </div>
            </td>
          </tr>
          <tr>
            <td>
              {sourceLoggedIn ? (
                <img
                  src={checked_logo}
                  alt="Checked Logo"
                  className="checked"
                />
              ) : null}
            </td>
            <td>
              {destLoggedIn ? (
                <img
                  src={checked_logo}
                  alt="Checked Logo"
                  className="checked"
                />
              ) : null}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="sync-button" onClick={handleSync}>
        Sync!
      </div>

      {alreadyLoggedIn ? (
        <Alert severity="error" className="alert">
          You've already logged in!
        </Alert>
      ) : null}

      {oneMissing ? (
        <Alert severity="error" className="alert">
          You need to log into both accounts!
        </Alert>
      ) : null}

      {showCount ? (
        <Alert severity="success" className="alert">
          You've synced {JSON.stringify(subscriptionCount)} subscriptions!
        </Alert>
      ) : null}
    </div>
  );
};

export default App;
