// src/StyledComponents.ts

import styled from 'styled-components';
import { SimpleGrid, Box } from "@chakra-ui/react";

export const Container = styled.div`
  max-width: 100vw; /* Ensure container does not exceed viewport width */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  padding: 0 10px; /* Optional: Add padding for mobile view */
  box-sizing: border-box; /* Include padding and border in the element’s total width and height */

  @media (max-width: 360px) {
    width: 100%; /* Ensure the container fits within the viewport width */
  }
`;

export const StyledSimpleGrid = styled(SimpleGrid)`
  /* Add any additional styles if needed */
`;
