import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import { I18nextProvider } from "react-i18next";
import App from "./App.tsx";
import theme from "./components/theme";
import "./index.css";
import i18n from "./assets/i18n";
import { Provider } from "react-redux";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
);
