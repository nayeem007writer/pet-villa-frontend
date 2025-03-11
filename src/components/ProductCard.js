import React from "react";
import { Card, CardMedia, CardContent, Typography, Box, Chip, IconButton, Button, Menu, MenuItem } from "@mui/material";
import { MdEdit, MdDelete, MdMoreVert } from "react-icons/md";

const ProductCard = ({ product }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [status, setStatus] = React.useState(product.status);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    handleClose();
  };

  const handleEdit = () => {
    alert("Test Edit clicked");
  };

  const handleDelete = () => {
    alert("Test Delete clicked");
  };

  return (
    <Card
      sx={{
        width: 320,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease-in-out",
        "&:hover": { transform: "scale(1.03)" }
      }}
    >
      {/* Product Image */}
      <CardMedia
        component="img"
        height="200"
        image={product.productImages}
        sx={{ objectFit: "cover", borderRadius: "12px 12px 0 0" }}
      />

      <CardContent sx={{ position: "relative", padding: "16px" }}>
        {/* Product Status Badge */}
        <Chip
          label={status}
          sx={{
            position: "absolute",
            top: -190,
            right: 19,
            fontWeight: "bold",
            color: "#fff",
            width: 90,
            height: 30,
            boxShadow: status === "Adopted" ? "0px 4px 12px rgba(255,0,0,0.6)" : "0px 4px 8px rgba(0,0,0,0.1)",
            backgroundColor:
              status === "Available" ? "#22C55E" :
              status === "Pending" ? "#F1C40F" :
              status === "Adopted" ? "#E74C3C" : "#3498DB",
          }}
        />

        {/* Product Name */}
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {product.name}
        </Typography>

        {/* Product Species and Breed */}
        <Typography variant="body1" sx={{ color: "#555" }}>
          {product.species} - {product.breed}
        </Typography>

        {/* Product Age and Gender */}
        <Typography variant="body1" sx={{ color: "#555" }}>
          Age: {product.age} | Gender: {product.gender}
        </Typography>

        {/* Action buttons for Edit & Delete */}
        <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <IconButton sx={{ color: "#B0B0B0" }} onClick={handleEdit}>
            <MdEdit size={24} />
          </IconButton>
          <IconButton sx={{ color: "#B0B0B0" }} onClick={handleDelete}>
            <MdDelete size={24} />
          </IconButton>

          {/* Dropdown Button for Status */}
          <Button
            sx={{ color: "#B0B0B0", borderColor: "#B0B0B0", border: "1px solid", borderRadius: "8px" }}
            endIcon={<MdMoreVert />}
            onClick={handleClick}
          >
            Change Status
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleStatusChange("Available")}>Available</MenuItem>
            <MenuItem onClick={() => handleStatusChange("Pending")}>Pending</MenuItem>
            <MenuItem onClick={() => handleStatusChange("Adopted")}>Adopted</MenuItem>
          </Menu>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;