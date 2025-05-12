import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated(); // Check if user is logged in

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true }); // Ensures full re-render after logout
    window.location.reload(); // Forces fresh state
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "white", padding: "0.5rem" }}>
      <Toolbar>
        {/* Clickable Logo */}
        <Typography
          variant="h6"
          onClick={() => navigate("/")}
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            color: "#35CEA0",
            cursor: "pointer", // Makes it clear it's clickable
            "&:hover": { opacity: 0.8 },
          }}
        >
          Pet Villa
        </Typography>

        {/* Show Home & Logout when logged in */}
        {loggedIn ? (
          <Box>
            <Button
              onClick={() => navigate("/home")}
              sx={{
                color: "#35CEA0",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                transition: "0.3s",
                "&:hover": {
                  background: "linear-gradient(90deg, #35CEA0 0%, #2CA583 100%)",
                  color: "white",
                  borderRadius: "8px",
                },
              }}
            >
              Home
            </Button>
            <Button
              onClick={handleLogout}
              sx={{
                color: "#35CEA0",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                ml: 2,
                transition: "0.3s",
                "&:hover": {
                  background: "linear-gradient(90deg, #35CEA0 0%, #2CA583 100%)",
                  color: "white",
                  borderRadius: "8px",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          // Show Login button when NOT logged in
          <Button
            onClick={() => navigate("/auth")}
            sx={{
              color: "#35CEA0",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
              transition: "0.3s",
              "&:hover": {
                background: "linear-gradient(90deg, #35CEA0 0%, #2CA583 100%)",
                color: "white",
                borderRadius: "8px",
              },
            }}
          >
            {/* Login */}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
