import youtube_logo from "./images/youtube_logo.png";
import sync_logo from "./images/sync_logo.png";
import checked_logo from "./images/checked_logo.png";

import "./App.css";

const App = () => {
  const sourceLoggedIn = false;
  const destLoggedIn = false;

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
              <div className="login-button">Source Channel Login</div>
            </td>
            <td>
              <div className="login-button">Destination Channel Login</div>
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

      <div className="sync-button">Sync!</div>
    </div>
  );
};

export default App;
