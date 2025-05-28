import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./assets/i18n";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
