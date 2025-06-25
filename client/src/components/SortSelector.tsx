import React from "react";
import {
  MenuItem,
  Menu,
  MenuButton,
  Button,
  MenuList,
  Wrap,
  WrapItem,
  Checkbox,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import { useTranslation } from "react-i18next";

interface SortSelectorProps {
  themes: string[];
  colors: string[];
  threePOptions: { value: string; label: string }[];
  onThemeSelect: (theme: string) => void;
  onColorSelect: (colors: string[]) => void;
  onThreePSelect: (option: string) => void;
  onResetFilters: () => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  themes,
  colors,
  threePOptions,
  onThemeSelect,
  onColorSelect,
  onThreePSelect,
  onResetFilters,
}) => {
  const { t } = useTranslation();
  const [selectedTheme, setSelectedTheme] = React.useState<string>("");
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
  const [selectedThreeP, setSelectedThreeP] = React.useState<string>("");

  const btnBg = useColorModeValue("#ff6347", "#ff7b61");
  const menuBg = useColorModeValue("white", "gray.700");
  const menuTextColor = useColorModeValue("gray.700", "gray.200");

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    onThemeSelect(theme);
  };

  const handleColorSelect = (color: string) => {
    const updatedColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(updatedColors);
    onColorSelect(updatedColors);
  };

  const handleThreePSelect = (option: string) => {
    setSelectedThreeP(option);
    onThreePSelect(option);
  };

  const handleResetFilters = () => {
    setSelectedTheme("");
    setSelectedColors([]);
    setSelectedThreeP("");
    onResetFilters();
  };

  const getSelectedColorsLabel = () => {
    if (selectedColors.length === 0) return t("colors");
    if (selectedColors.length === 1) return t(selectedColors[0]);
    return t("selectedColors", { count: selectedColors.length });
  };

  return (
    <Wrap spacing={2} mb={4} direction={{ base: "column", sm: "row" }}>
      {/* Theme Menu */}
      <WrapItem display={{ base: "none", sm: "block" }}>
        <Menu>
          <MenuButton as={Button} rightIcon={<BsChevronDown />}>
            {selectedTheme ? t(selectedTheme) : t("theme")}
          </MenuButton>
          <MenuList bg={menuBg} color={menuTextColor}>
            {themes.filter(theme => theme && theme.trim()).map((theme, index) => (
              <MenuItem key={`theme-${theme}-${index}`} onClick={() => handleThemeSelect(theme)}>
                {t(theme)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </WrapItem>

      {/* Colors Menu */}
      <WrapItem display={{ base: "none", sm: "block" }}>
        <Menu closeOnSelect={false}>
          <MenuButton as={Button} rightIcon={<BsChevronDown />}>
            {getSelectedColorsLabel()}
          </MenuButton>
          <MenuList bg={menuBg} color={menuTextColor}>
            <VStack align="start" spacing={1} p={2}>
              {colors.filter(color => color && color.trim()).map((color, index) => (
                <Checkbox
                  key={`color-${color}-${index}`}
                  isChecked={selectedColors.includes(color)}
                  onChange={() => handleColorSelect(color)}
                >
                  {t(color)}
                </Checkbox>
              ))}
            </VStack>
          </MenuList>
        </Menu>
      </WrapItem>

      {/* Three-Pieces Menu */}
      <WrapItem display={{ base: "none", sm: "block" }}>
        <Menu>
          <MenuButton as={Button} rightIcon={<BsChevronDown />}>
            {selectedThreeP
              ? t(
                  threePOptions.find((o) => o.value === selectedThreeP)
                    ?.label || "noOfPieces"
                )
              : t("noOfPieces")}
          </MenuButton>
          <MenuList bg={menuBg} color={menuTextColor}>
            {threePOptions.map(({ value, label }, index) => (
              <MenuItem key={`threeP-${value}-${index}`} onClick={() => handleThreePSelect(value)}>
                {t(label)}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </WrapItem>

      {/* Reset Filters Button */}
      <WrapItem display={{ base: "none", sm: "block" }}>
        <Button
          bg={btnBg}
          color="white"
          w="full"
          _hover={{ opacity: 0.85 }}
          onClick={handleResetFilters}
        >
          {t("resetFilters")}
        </Button>
      </WrapItem>

      {/* Mobile Layout */}
      <SimpleGrid
        columns={{ base: 2, md: 2 }}
        spacing={2}
        display={{ base: "grid", sm: "none" }}
        mb={3}
        w="100%"
      >
        {/* Theme Menu - Mobile */}
        <WrapItem>
          <Menu>
            <MenuButton as={Button} rightIcon={<BsChevronDown />}>
              {selectedTheme ? t(selectedTheme) : t("theme")}
            </MenuButton>
            <MenuList bg={menuBg} color={menuTextColor}>
              {themes.filter(theme => theme && theme.trim()).map((theme, index) => (
                <MenuItem key={`mobile-theme-${theme}-${index}`} onClick={() => handleThemeSelect(theme)}>
                  {t(theme)}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </WrapItem>

        {/* Colors Menu - Mobile */}
        <WrapItem>
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} rightIcon={<BsChevronDown />}>
              {getSelectedColorsLabel()}
            </MenuButton>
            <MenuList bg={menuBg} color={menuTextColor}>
              <VStack align="start" spacing={1} p={2}>
                {colors.filter(color => color && color.trim()).map((color, index) => (
                  <Checkbox
                    key={`mobile-color-${color}-${index}`}
                    isChecked={selectedColors.includes(color)}
                    onChange={() => handleColorSelect(color)}
                  >
                    {t(color)}
                  </Checkbox>
                ))}
              </VStack>
            </MenuList>
          </Menu>
        </WrapItem>

        {/* Three-Pieces Menu - Mobile */}
        <WrapItem>
          <Menu>
            <MenuButton as={Button} rightIcon={<BsChevronDown />}>
              {selectedThreeP
                ? t(
                    threePOptions.find((o) => o.value === selectedThreeP)
                      ?.label || "noOfPieces"
                  )
                : t("noOfPieces")}
            </MenuButton>
            <MenuList bg={menuBg} color={menuTextColor}>
              {threePOptions.map(({ value, label }, index) => (
                <MenuItem key={`mobile-threeP-${value}-${index}`} onClick={() => handleThreePSelect(value)}>
                  {t(label)}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </WrapItem>

        {/* Reset Filters Button - Mobile */}
        <WrapItem>
          <Button
            bg={btnBg}
            color="white"
            _hover={{ opacity: 0.85 }}
            onClick={handleResetFilters}
            w="full"
          >
            {t("resetFilters")}
          </Button>
        </WrapItem>
      </SimpleGrid>
    </Wrap>
  );
};

export default SortSelector;
