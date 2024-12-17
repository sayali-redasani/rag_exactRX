import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
// import { msalConfig } from "../src/pages/Login/authConfig";

// const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId="1009282809407-sh8h2kgmot2q295a503sl5530pldnaj9.apps.googleusercontent.com">
    {/* <MsalProvider instance={msalInstance}> */}
      <React.StrictMode>
        <App />
      </React.StrictMode>
    {/* </MsalProvider> */}
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
