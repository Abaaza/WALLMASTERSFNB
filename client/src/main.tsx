import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store";
import theme from "./components/theme";
import "./index.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./assets/i18n";

// Create emotion cache
const emotionCache = createCache({
  key: "chakra-ui",
  prepend: true,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config?.initialColorMode} />
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <ChakraProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </ChakraProvider>
      </Provider>
    </CacheProvider>
  </React.StrictMode>
);
