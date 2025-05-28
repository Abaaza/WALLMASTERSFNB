import React, { useState, useEffect } from "react";
import { Box, Image, useBreakpointValue } from "@chakra-ui/react";

interface AutoSlideShowProps {
  images: string[];
}

const AutoSlideShow: React.FC<AutoSlideShowProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Change image every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 800);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Box width="100%" overflow="hidden">
      <Image
        src={images[currentIndex]}
        alt={`Slide ${currentIndex}`}
        width="100%"
        height="auto"
      />
    </Box>
  );
};

export default AutoSlideShow;
