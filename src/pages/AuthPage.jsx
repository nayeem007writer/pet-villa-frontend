import React, { useState } from "react";
import { Container, Button, TextField, Paper, Grid, Box, Modal, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { setTokens } from "../utils/auth";
import { login, register } from "../services/api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "", email: "", password: "" });
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      const response = await register(formData);
      if (response.success) {
        setOpenModal(true);
        setTimeout(() => {
          setOpenModal(false);
          setIsLogin(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await login({ email: formData.email, password: formData.password });
      if (response.success && response.data) {
        setTokens(response.data);
        navigate("/home"); // Redirect after login success
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <Container>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <img src={process.env.PUBLIC_URL + "/v.png"} alt="Pet" />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  padding: "2rem", 
                  maxWidth: "400px", 
                  margin: "auto",
                  background: "linear-gradient(135deg, #35CEA0 0%, #2CA583 100%)",
                  color: "white",
                  textAlign: "center",
                  borderRadius: "12px"
                }}
              >
                <Typography variant="h5" align="center" gutterBottom>
                  {isLogin ? "Login" : "Register"}
                </Typography>
                
                {!isLogin && (
                  <>
                    <TextField fullWidth placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} margin="normal" sx={{ background: "white", borderRadius: "5px" }} />
                    
                    <TextField fullWidth placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} margin="normal" sx={{ background: "white", borderRadius: "5px" }} />
                    
                    <TextField fullWidth placeholder="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} margin="normal" sx={{ background: "white", borderRadius: "5px" }} />
                  </>
                )}

                <TextField fullWidth placeholder="Enter your email" name="email" value={formData.email} onChange={handleChange} margin="normal" sx={{ background: "white", borderRadius: "5px" }} />

                <TextField fullWidth placeholder="Enter your password" type="password" name="password" value={formData.password} onChange={handleChange} margin="normal" sx={{ background: "white", borderRadius: "5px" }} />
                
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={isLogin ? handleLogin : handleRegister} 
                  sx={{ 
                    mt: 2, 
                    backgroundColor: "#fff", 
                    color: "#35CEA0", 
                    boxShadow: 3, 
                    fontWeight: "bold",
                    '&:hover': { backgroundColor: "#E0F2F1" } 
                  }}
                >
                  {isLogin ? "Login" : "Register"}
                </Button>
                
                <Button 
                  fullWidth 
                  onClick={toggleForm} 
                  sx={{ 
                    mt: 1, 
                    color: "white", 
                    fontWeight: "bold" 
                  }}
                >
                  {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 3 
          }}
        >
          <Typography variant="h6" align="center">Registration Successful!</Typography>
        </Box>
      </Modal>
    </>
  );
};

export default AuthPage;
