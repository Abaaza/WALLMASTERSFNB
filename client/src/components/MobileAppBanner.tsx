// MobileAppBanner.tsx

import React, { useEffect, useState } from "react";
import { Box, Button, Text, IconButton, Flex } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { isMobile } from "react-device-detect";

interface MobileAppBannerProps {
  onClose: () => void;
}

const MobileAppBanner: React.FC<MobileAppBannerProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const bannerClosed = localStorage.getItem("bannerClosed");
    if (isMobile && !bannerClosed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("bannerClosed", "true");
    onClose();
  };

  if (!isVisible) return null;

  const appStoreLink =
    "https://apps.apple.com/us/app/wall-masters/id1234567890";
  const playStoreLink =
    "https://play.google.com/store/apps/details?id=com.wallmasters";

  return (
    <Box
      bg="gray.800"
      color="white"
      py={3}
      px={4}
      position="fixed"
      bottom="0"
      width="100%"
      zIndex="1000"
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Text fontSize="md" flex="1">
          For a better experience, download the Wall Masters app!
        </Text>

        <Button
          as="a"
          href={
            /iPhone|iPad|iPod/.test(navigator.userAgent)
              ? appStoreLink
              : playStoreLink
          }
          target="_blank"
          bg="#ff6347" // Set background color to #ff6347
          color="white" // Set text color to white
          size="sm"
          ml={4}
          _hover={{ bg: "#ff7b61" }} // Set hover color to a slightly lighter shade
        >
          Download Now
        </Button>

        <IconButton
          aria-label="Close banner"
          icon={<CloseIcon />}
          size="sm"
          onClick={handleClose}
          variant="ghost"
          color="white"
          ml={4}
        />
      </Flex>
    </Box>
  );
};

export default MobileAppBanner;
