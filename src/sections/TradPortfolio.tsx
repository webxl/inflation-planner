// aka Leaky Bucket

// import React from "react";

import { Input, Select, FormLabel } from '@chakra-ui/react';

const TradPortfolio = () => {
  return (
    <div>
      <h1>Traditional Portfolio</h1>
      <Select placeholder="Select portfolio">
        <option value="60/40">60/40</option>
        <option value="70/30">70/30</option>
        <option value="custom">Custom</option>
      </Select>
      <FormLabel>Start Date</FormLabel>
      <Input type="date" />
      <FormLabel>Principle</FormLabel>
      <Input type="number" placeholder="Principle" />
    </div>
  );
};

export default TradPortfolio;
