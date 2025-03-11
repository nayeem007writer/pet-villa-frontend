import React from "react";
import { Card, CardMedia, CardContent, Typography, Box, Chip } from "@mui/material";

const ProductCard = ({ product }) => {
  return (
    <Card 
      sx={{ 
        width: 320, 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
        transition: "transform 0.3s ease-in-out",
        position: "relative",
        "&:hover": { transform: "scale(1.03)" },
        margin: "10px"  // Adds space between cards
      }}
    >
      {/* Product Status Badge - Positioned Top Right */}
      <Chip
        label={product.status}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          fontWeight: "bold",
          color: "#fff",
          backgroundColor: 
            product.status === "Available" ? "#2ECC71" : 
            product.status === "Pending" ? "#F1C40F" : "#3498DB",
        }}
      />

      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={product.image || "https://via.placeholder.com/300"}
        alt={product.name}
        sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
      />

      <CardContent sx={{ padding: "16px" }}>
        {/* Product Name */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {product.name}
        </Typography>

        {/* Product Price */}
        <Typography variant="body1" sx={{ color: "#555", fontWeight: "bold" }}>
          Price: ${product.price}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
