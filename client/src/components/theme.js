// theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Input: {
      baseStyle: {
        bg: "#D0D0D0",
        borderRadius: "md",
        variant: "unstyled",
        ml: 2,
      },
      defaultProps: {
        size: "md",
      },
    },
    Button: {
      baseStyle: {
        w: "100%",
        colorScheme: "orange",
      },
    },
    Box: {
      baseStyle: {
        maxW: "400px",
        w: "full",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "#fff",
        color: "#000",
      },
    },
  },
});

export default theme;
