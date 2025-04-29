/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Backdrop,
  Button,
  Box,
  AppBar,
  Toolbar,
  TextField,
  IconButton,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { FaUser, FaHamburger, FaSearch } from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { logout, getAuthToken } from "../utils/auth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { MdNotifications } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";

// Enums
const ProductStatus = {
  AVAILABLE: "Available",
  ADOPTED: "Adopted",
  PENDING: "Pending",
};

const PetSpecies = {
  DOG: "Dog",
  CAT: "Cat",
  BIRD: "Bird",
  OTHER: "Other",
};

const PetGender = {
  MALE: "male",
  FEMALE: "female",
};

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    productImages: null,
    description: "",
    status: ProductStatus.PENDING,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    avatar: null,
    username: ""
  });
  const [openCommentsModal, setOpenCommentsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsError, setCommentsError] = useState("");

  // Fetch userId from token or local storage on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

  // Fetch data when activeTab or page changes
  useEffect(() => {
    if (activeTab === "products" && userId) {
      fetchProducts();
    } else if (activeTab === "profile") {
      fetchProfile();
    }
  }, [activeTab, page, userId]);

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("http://[::1]:3000/api/v1/pets", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        params: {
          limit: "10",
          page: String(page),
        },
      });
      // console.log("Products response:", response.data.data.);

      if (response.data.success && Array.isArray(response.data.data.id)) {
        const formattedProducts = response.data.data.map((pet) => (
          {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          productImages: pet.productImages,
          description: pet.description,
          status: pet.status,
        }
      ));
        // console.log("Formatted products:", formattedProducts.id);
        setProducts(formattedProducts);
        setError("");
      } else {
        setError("Failed to load products.");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setError("Invalid request. Make sure 'limit' and 'page' are strings.");
      } else if (error.response?.status === 401) {
        setError("Unauthorized Access. Please login again.");
        logout();
        navigate("/");
      } else {
        setError("Error fetching products. Please try again later.");
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("http://[::1]:3000/api/v1/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // console.log(response.data.data);
        setProfile(response.data.data);
        setError("");
      } else {
        setError("Failed to load profile.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Unauthorized Access. Please login again.");
        logout();
        navigate("/");
      } else {
        setError("Error fetching profile. Please try again later.");
      }
    }
  };

  const fetchComments = async (product) => {
    try {
      const token = getAuthToken();
      let id = product?.id || product?.productId ;
      if (!id) {  
        setCommentsError("Product ID not found.");
        return;
      }
      console.log("Fetching comments for productId:", id);
      const response = await axios.get(
        `http://[::1]:3000/api/v1/comment/${id}/product-id?limit=10&page=${commentsPage}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Comments response:", response.data);

      if (response.data.success) {
        const userEmail = profile.email;
        const userComments = response.data.data.filter(
          comment => comment.email === userEmail
        );
        setComments(userComments);
        setCommentsError("");
      } else {
        setCommentsError("Failed to load comments.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setCommentsError("Unauthorized Access. Please login again.");
        logout();
        navigate("/");
      } else {
        setCommentsError("Error fetching comments. Please try again later.");
      }
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchComments(product);
    console.log("Selected product:", product);
    setOpenCommentsModal(true);
  };

  const ProductCard = ({ product, onClick }) => {
    return (
      <Card 
        onClick={onClick}
        sx={{ 
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <Box
          component="img"
          height="200"
          src={product.productImages || '/placeholder-pet.jpg'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.species} • {product.breed}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Age: {product.age}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {product.status}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewProduct({
      name: "",
      species: "",
      breed: "",
      age: "",
      gender: "",
      productImages: null,
      description: "",
      status: ProductStatus.PENDING,
    });
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, productImages: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const token = getAuthToken();
      const formData = new FormData();

      formData.append("name", newProduct.name);
      formData.append("species", newProduct.species);
      formData.append("breed", newProduct.breed);
      formData.append("age", newProduct.age);
      formData.append("gender", newProduct.gender);
      if (newProduct.productImages) {
        formData.append("productImages", newProduct.productImages);
      }
      formData.append("description", newProduct.description);
      formData.append("status", newProduct.status);

      const response = await axios.post("http://[::1]:3000/api/v1/pets", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setOpenModal(false);
        fetchProducts();
        toast.success("Pet added successfully!");
      } else {
        setError("Failed to add pet.");
      }
    } catch (error) {
      setError("Error adding pet. Please try again later.");
    }
  };

  const getHeaderText = () => {
    switch (activeTab) {
      case "products":
        return "My Pet Listings";
      case "profile":
        return "My Profile";
      case "food":
        return "Food Listings";
      case "browsePet":
        return "Browse Pets";
      default:
        return "Welcome to Pet Villa!";
    }
  };

  const getParagraphText = () => {
    switch (activeTab) {
      case "products":
        return "Manage your pet adoption listings.";
      case "profile":
        return "View and update your personal information.";
      case "food":
        return "Browse and manage food listings.";
      case "browsePet":
        return "Find your perfect pet companion.";
      default:
        return "Welcome to Pet Villa! Choose a section to manage.";
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F8F8F8" }}>
        {/* Sidebar */}
        <Box sx={{ width: "20%", backgroundColor: "#30B68F", padding: "1rem", borderRadius: "10px", minHeight: "100vh" }}>
          <Typography variant="h5" sx={{ color: "white", fontWeight: "bold", textAlign: "center", mb: 3 }}>
            Dashboard
          </Typography>
          {["profile", "products", "food", "browsePet"].map((tab) => (
            <Button
              key={tab}
              fullWidth
              variant={activeTab === tab ? "contained" : "outlined"}
              sx={{
                mb: 2,
                backgroundColor: activeTab === tab ? "white" : "transparent",
                color: activeTab === tab ? "#30B68F" : "white",
                borderColor: "white",
                fontWeight: "bold",
                borderRadius: "8px",
                padding: "0.8rem",
                transition: "all 0.3s ease-in-out",
                boxShadow: activeTab === tab ? "0px 4px 8px rgba(0, 0, 0, 0.2)" : "none",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)",
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
            >
              {tab === "profile" && <FaUser style={{ marginRight: "10px" }} />}
              {tab === "products" && <MdPets style={{ marginRight: "10px" }} />}
              {tab === "food" && <FaHamburger style={{ marginRight: "10px" }} />}
              {tab === "browsePet" && <FaSearch style={{ marginRight: "10px" }} />}
              {tab === "products"
                ? "My Pet Listings"
                : tab === "browsePet"
                ? "Browse Pets"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </Box>

        {/* Main Content */}
        <Box sx={{ width: "80%", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Navbar */}
          <AppBar position="static" sx={{ backgroundColor: "#30B68F" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                sx={{
                  backgroundColor: "white",
                  borderRadius: "20px",
                  width: "250px",
                }}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton sx={{ color: "white" }}>
                  <MdNotifications size={24} />
                </IconButton>
                <IconButton sx={{ color: "white" }} onClick={handleLogout}>
                  <FiLogOut size={24} />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Content Section */}
          <Container>
            {/* Heading and Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
              <Typography variant="h4">{getHeaderText()}</Typography>
              {activeTab === "products" && (
                <Button variant="contained" sx={{ backgroundColor: "#30B68F", "&:hover": { backgroundColor: "#25876E" } }} onClick={handleOpenModal}>
                  Add New Pet
                </Button>
              )}
            </Box>

            {/* Paragraph Text */}
            <Typography sx={{ mt: 1, fontSize: "1.2rem", color: "#555" }}>
              {getParagraphText()}
            </Typography>

            {/* Profile Section */}
            {activeTab === "profile" && (
              <Box sx={{ maxWidth: 800, margin: "0 auto", mt: 2 }}>
                <Grid container spacing={4}>
                  {/* Personal Information Card */}
                  <Grid item xs={12} sm={8}>
                    <Card
                      sx={{
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        padding: "2rem",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                        Personal Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>Username:</strong> {profile.username}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>Email:</strong> {profile.email}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>Full Name:</strong> {profile.firstName} {profile.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>Phone Number:</strong> {profile.phoneNumber}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#30B68F",
                          "&:hover": { backgroundColor: "#25876E" },
                          mt: 2,
                        }}
                      >
                        Save Changes
                      </Button>
                    </Card>
                  </Grid>

                  {/* Account Information Card */}
                  <Grid item xs={12} sm={4}>
                    <Card
                      sx={{
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        padding: "2rem",
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
                        Account Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>User ID:</strong> {userId}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ color: "#555" }}>
                          <strong>Account Status:</strong> ● Active
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Product Cards */}
            {activeTab === "products" && (
              <>
                {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}

                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product.id}>
                      <ProductCard 
                        product={product} 
                        onClick={() => handleProductClick(product)} 
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination Controls */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Button
                    variant="contained"
                    disabled={page <= 1}
                    sx={{ mr: 2, backgroundColor: "#30B68F", "&:hover": { backgroundColor: "#25876E" } }}
                    onClick={() => setPage(page - 1)}
                  >
                    Back
                  </Button>
                  <Typography variant="body1" sx={{ alignSelf: "center" }}>Page {page}</Typography>
                  <Button
                    variant="contained"
                    sx={{ ml: 2, backgroundColor: "#30B68F", "&:hover": { backgroundColor: "#25876E" } }}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </>
            )}

            {/* Browse Pets Tab */}
            {activeTab === "browsePet" && (
              <Box
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  padding: "2rem",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <Typography variant="h5">Browse Pets Content</Typography>
                <Typography variant="body1">
                  This section is under development. Stay tuned!
                </Typography>
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* Modal for Adding New Pet */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          sx={{
            borderRadius: "16px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
            "& .MuiDialog-paper": {
              width: "500px",
              maxWidth: "90%",
              borderRadius: "16px",
              padding: "1.5rem",
            },
          }}
        >
          <DialogTitle sx={{ backgroundColor: "#30B68F", color: "white", textAlign: "center", fontWeight: "bold", borderRadius: "16px 16px 0 0", padding: "1rem" }}>
            Add New Pet
          </DialogTitle>
          <DialogContent sx={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Species</InputLabel>
              <Select
                label="Species"
                name="species"
                value={newProduct.species}
                onChange={handleInputChange}
              >
                {Object.values(PetSpecies).map((species) => (
                  <MenuItem key={species} value={species}>
                    {species}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Breed"
              name="breed"
              value={newProduct.breed}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              value={newProduct.age}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                name="gender"
                value={newProduct.gender}
                onChange={handleInputChange}
              >
                {Object.values(PetGender).map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    {gender}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>Pet Image</Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "8px" }}
              />
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", borderRadius: "8px" }} />
                </Box>
              )}
            </Box>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                name="status"
                value={newProduct.status}
                onChange={handleInputChange}
              >
                {Object.values(ProductStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ padding: "1.5rem", justifyContent: "space-between" }}>
            <Button onClick={handleCloseModal} sx={{ color: "#30B68F", fontWeight: "bold" }}>Cancel</Button>
            <Button onClick={handleSubmit} sx={{ backgroundColor: "#30B68F", color: "white", fontWeight: "bold", "&:hover": { backgroundColor: "#25876E" } }}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Modal>

      {/* Modal for Showing Comments */}
      <Modal
        open={openCommentsModal}
        onClose={() => setOpenCommentsModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Dialog
          open={openCommentsModal}
          onClose={() => setOpenCommentsModal(false)}
          maxWidth="md"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "16px",
              padding: "1.5rem",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
            Comments for {selectedProduct?.name}
          </DialogTitle>
          <DialogContent>
            {commentsError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {commentsError}
              </Typography>
            )}
            
            {comments.length === 0 ? (
              <Typography align="center">No comments found</Typography>
            ) : (
              <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {comments.map((comment) => (
                  <Card key={comment.id} sx={{ p: 2, mb: 2, borderRadius: "8px" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {comment.username || "Anonymous"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {comment.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Address:</strong> {comment.address}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {comment.phoneNumber}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {comment.description}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.secondary" }}>
                      Posted on: {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", padding: "1.5rem" }}>
            <Box>
              <Button 
                disabled={commentsPage <= 1}
                onClick={() => {
                  setCommentsPage(prev => prev - 1);
                  fetchComments(selectedProduct.id);
                }}
                sx={{ color: "#30B68F" }}
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  setCommentsPage(prev => prev + 1);
                  fetchComments(selectedProduct.id);
                }}
                sx={{ ml: 2, color: "#30B68F" }}
              >
                Next
              </Button>
            </Box>
            <Button 
              onClick={() => setOpenCommentsModal(false)}
              sx={{ color: "#30B68F", fontWeight: "bold" }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Modal>

      <ToastContainer />
    </>
  );
};

export default HomePage;