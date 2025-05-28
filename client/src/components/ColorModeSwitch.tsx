import { HStack, Switch, Text, useColorMode } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const ColorModeSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { t } = useTranslation(); // Use the translation hook

  return (
    <HStack>
      <Switch
        colorScheme="green"
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode}
      />
      <Text fontSize="14px" padding="10px">
        {t("darkMode")} {/* Use the translation key */}
      </Text>
    </HStack>
  );
};

export default ColorModeSwitch;
