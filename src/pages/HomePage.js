/* eslint-disable no-unused-vars */
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
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { Menu, Chip } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { FaUser, FaHamburger, FaSearch, } from "react-icons/fa";
import { FaWallet, FaShoppingBasket } from "react-icons/fa";
import { MdPets, MdInfo } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { logout, getAuthToken } from "../utils/auth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { MdNotifications } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
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
  const [browsePets, setBrowsePets] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [error, setError] = useState("");
  const [browseError, setBrowseError] = useState("");
  const [page, setPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState(null);
const [currentPetId, setCurrentPetId] = useState(null);
const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  // const [openCommentModal, setOpenCommentModal] = useState(false);
  const [browsePage, setBrowsePage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [openCommentModal, setOpenCommentModal] = useState(false);
const [commentData, setCommentData] = useState({
  address: "",
  description: ""
});
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    gender: "",
    status: "",
  });

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
    } else if (activeTab === "browsePet") {
      fetchBrowsePets();
    }
  }, [activeTab, page, browsePage, userId, filters]);

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

      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedProducts = response.data.data.map((pet) => ({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender,
          productImages: pet.productImages,
          description: pet.description,
          status: pet.status,
        }));
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
  const handleStatusClick = (event, petId) => {
    setAnchorEl(event.currentTarget);
    setCurrentPetId(petId);
  };
  
  const handleStatusClose = () => {
    setAnchorEl(null);
    setCurrentPetId(null);
  };
  
  const handleStatusUpdate = async (status) => {
    if (!currentPetId) return;
    
    setIsUpdatingStatus(true);
    try {
      // Replace with your actual API endpoint
      await axios.patch(`http://[::1]:3000/api/v1/pets/status/${currentPetId}/`, {
        status: status
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      
      toast.success(`Status updated to ${status}`);
      fetchProducts(); // Refresh the pet list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
      handleStatusClose();
    }
  };
  const handleCommentSubmit = async () => {
    if (!selectedProduct?.id) {
      toast.error("No pet selected for comment");
      return;
    }
  
    if (!commentData.description.trim()) {
      toast.error("Please enter a comment description");
      return;
    }
  
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `http://[::1]:3000/api/v1/comment/${selectedProduct.id}`,
        {
          address: commentData.address,
          description: commentData.description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      if (response.data.success) {
        toast.success("Comment submitted successfully!");
        setOpenCommentModal(false);
        setCommentData({
          address: "",
          description: ""
        });
        // Refresh comments if viewing them
        if (openCommentsModal) {
          fetchComments(selectedProduct);
        }
      } else {
        toast.error("Failed to submit comment");
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      toast.error("Error submitting comment. Please try again.");
    }
  };

const fetchBrowsePets = async () => {
  try {
    const token = getAuthToken();
    let params = {
      limit: "10",
      page: String(browsePage),
    };

    // Only apply one filter at a time
    if (searchTerm) {
      params.searchTerm = searchTerm;
    } else if (filters.species) {
      // Pass species value as searchTerm parameter
      params.searchTerm = filters.species;
    } else if (filters.age) {
      params.searchTerm = filters.age;
    }

    console.log("API Request Params:", params); // Debug log

    const response = await axios.get("http://[::1]:3000/api/v1/pets/customer", {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      params: params
    });

    console.log("API Response:", response.data); // Debug log

    if (response.data.success) {
      setBrowsePets(response.data.data || []);
      setBrowseError("");
    } else {
      setBrowseError(response.data.message || "Failed to load pets.");
    }
  } catch (error) {
    console.error("Fetch pets error:", error);
    if (error.response?.status === 401) {
      setBrowseError("Unauthorized Access. Please login again.");
      logout();
      navigate("/");
    } else {
      setBrowseError(error.response?.data?.message || "Error fetching pets. Please try again later.");
    }
  }
};
const fetchProfile = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get("http://[::1]:3000/api/v1/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
  console.log(response)
    if (response.data.success) {
      setProfile({
        ...response.data.data,
        avatar: response.data.data.avatar || 
               response.data.data.imageUrl || 
               null
      });
      setError("");
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


  // const fetchComments = async (product) => {
  //   try {
  //     const token = getAuthToken();
  //     let id = product?.id || product?.productId;
  //     if (!id) {  
  //       setCommentsError("Product ID not found.");
  //       return;
  //     }
  //     const response = await axios.get(
  //       `http://[::1]:3000/api/v1/comment/${id}/product-id?limit=10&page=${commentsPage}`,
  //       {
  //         headers: { 
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json"
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       const userEmail = profile.email;
  //       const userComments = response.data.data.filter(
  //         comment => comment.email === userEmail
  //       );
  //       setComments(userComments);
  //       setCommentsError("");
  //     } else {
  //       setCommentsError("Failed to load comments.");
  //     }
  //   } catch (error) {
  //     if (error.response?.status === 401) {
  //       setCommentsError("Unauthorized Access. Please login again.");
  //       logout();
  //       navigate("/");
  //     } else {
  //       setCommentsError("Error fetching comments. Please try again later.");
  //     }
  //   }
  // };
  const fetchComments = async (product) => {
  try {
    const token = getAuthToken();
    
    // First, ensure we have a product object
    if (!product) {
      setCommentsError("No product selected.");
      return;
    }

    // Get the ID - check both possible properties
    const productId = product.id || product._id;
    
    if (!productId) {
      setCommentsError("Product ID not found.");
      return;
    }

    const response = await axios.get(
      `http://[::1]:3000/api/v1/comment/${productId}/product-id`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        params: {
          limit: 10,
          page: commentsPage
        },
        searchTerm
      }
    );

    if (response.data.success) {
      // Don't filter by email here - show all comments
      setComments(response.data.data || []);
      setCommentsError("");
    } else {
      setCommentsError(response.data.message || "Failed to load comments.");
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    if (error.response?.status === 401) {
      setCommentsError("Unauthorized Access. Please login again.");
      logout();
      navigate("/");
    } else {
      setCommentsError(error.response?.data?.message || "Error fetching comments. Please try again later.");
    }
  }
};

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchComments(product);
    setOpenCommentsModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setBrowsePage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setBrowsePage(1);
    fetchBrowsePets();
  };

  // Original ProductCard component
// Updated ProductCard component with enhanced styling
const ProductCard = ({ product, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      sx={{ 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid #e0e0e0',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(48, 182, 143, 0.2)',
          borderColor: '#30B68F',
          '& .pet-image': {
            transform: 'scale(1.05)'
          },
          '& .pet-name': {
            color: '#30B68F'
          }
        }
      }}
    >
      {/* Status Badge with Dropdown */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Chip
          label={product.status}
          size="small"
          deleteIcon={<ArrowDropDown />}
          onDelete={(e) => handleStatusClick(e, product.id)}
          onClick={(e) => handleStatusClick(e, product.id)}
          color={
            product.status === ProductStatus.AVAILABLE ? 'success' :
            product.status === ProductStatus.ADOPTED ? 'error' : 'warning'
          }
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            cursor: 'pointer',
            '& .MuiChip-deleteIcon': {
              color: 'inherit'
            }
          }}
        />
      </Box>

      {/* Pet Image - Updated with fixed height container */}
      <Box
        sx={{
          width: '100%',
          height: '200px', // Fixed height
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box
          component="img"
          className="pet-image"
          src={product.productImages || '/placeholder-pet.jpg'}
          alt={product.name}
          sx={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
        />
      </Box>
      
      {/* Card Content with enhanced styling */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div"
          className="pet-name"
          sx={{
            fontWeight: 700,
            color: '#333',
            transition: 'color 0.3s ease',
            mb: 1.5,
            fontSize: '1.1rem',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#555',
              mb: 0.5,
              fontSize: '0.9rem'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                fontWeight: 600,
                color: '#30B68F',
                mr: 0.5
              }}
            >
              Species:
            </Box>
            {product.species}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#555',
              mb: 0.5,
              fontSize: '0.9rem'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                fontWeight: 600,
                color: '#30B68F',
                mr: 0.5
              }}
            >
              Breed:
            </Box>
            {product.breed}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          pt: 1,
          borderTop: '1px dashed #e0e0e0'
        }}>
          <Typography 
            variant="body2" 
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#555',
              fontSize: '0.9rem'
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                fontWeight: 600,
                color: '#30B68F',
                mr: 0.5
              }}
            >
              Age:
            </Box>
            {product.age}
          </Typography>
          
          <Chip
            label={product.gender}
            size="small"
            sx={{
              fontWeight: 600,
              backgroundColor: product.gender === 'male' ? 'rgba(66, 165, 245, 0.1)' : 'rgba(233, 30, 99, 0.1)',
              color: product.gender === 'male' ? '#42a5f5' : '#e91e63'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
  // New BrowsePetCard component with different styling
// Updated BrowsePetCard component
const BrowsePetCard = ({ product, onClick }) => {
  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          '& .pet-image': {
            transform: 'scale(1.05)'
          }
        }
      }}
    >
      {/* Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 
            product.status === 'Available' ? '#4CAF50' :
            product.status === 'Adopted' ? '#F44336' : '#FFC107',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 1
        }}
      >
        {product.status}
      </Box>

      {/* Pet Image */}
      <Box 
        onClick={onClick}
        sx={{ 
          height: 200,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <img
          src={product.productImages || '/placeholder-pet.jpg'}
          alt={product.name}
          className="pet-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            transition: 'transform 0.5s ease'
          }}
        />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {product.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {product.species} • {product.breed}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Age: {product.age}
          </Typography>
          <Typography 
            variant="body2" 
            color={product.gender === 'male' ? 'primary' : 'secondary'}
            sx={{ fontWeight: 500 }}
          >
            {product.gender}
          </Typography>
        </Box>
      </CardContent>

      {/* Add Comment Button */}
      <Box sx={{ p: 2, pt: 0 }}>

<Button
  variant="contained"
  fullWidth
  sx={{
    mt: 1,
    backgroundColor: '#30B68F',
    '&:hover': {
      backgroundColor: '#25876E'
    }
  }}
  onClick={(e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setCommentData({  // Reset comment form
      address: "",
      description: ""
    });
    setOpenCommentModal(true);
  }}
>
  Add Comment
</Button>
      </Box>
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
{["profile", "products",  "browsePet", "wallet", "purchases"].map((tab) => (
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
    {/* {tab === "food" && <FaHamburger style={{ marginRight: "10px" }} />} */}
    {tab === "browsePet" && <FaSearch style={{ marginRight: "10px" }} />}
    {tab === "wallet" && <FaWallet style={{ marginRight: "10px" }} />}
    {tab === "purchases" && <FaShoppingBasket style={{ marginRight: "10px" }} />}
    
    {tab === "products"
      ? "My Pet Listings"
      : tab === "browsePet"
      ? "Browse Pets"
      // : tab === "food"
      // ? "Food Listings"
      : tab === "wallet"
      ? "Wallet"
      : tab === "purchases"
      ? "Purchase Items"
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
  <Box sx={{ maxWidth: 800, margin: "0 auto", mt: 4 }}>
    <Grid container spacing={4}>
      {/* Personal Information Card */}
      <Grid item xs={12} md={8}>
        <Card sx={{ 
          boxShadow: 3,
          borderRadius: 2,
          p: 4,
          backgroundColor: 'background.paper'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            {/* Avatar Container */}
            <Box sx={{ 
              position: 'relative',
              mr: { sm: 4 },
              mb: { xs: 2, sm: 0 }
            }}>
              <Box sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid',
                borderColor: '#30B68F', // Using the specific color here
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profile.avatar ? (
                  <img 
                    src={
                      profile.avatar.startsWith('http') ? 
                      `${profile.avatar}?${Date.now()}` : 
                      `http://[::1]:3000/${profile.avatar}?${Date.now()}`
                    }
                    alt="Profile"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.jpg';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <FaUser size={48} color="#757575" />
                )}
              </Box>
              
              {/* Avatar Upload Button */}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const token = getAuthToken();
                      const formData = new FormData();
                      formData.append('productImages', file);
                      
                      const response = await axios.patch(
                        'http://[::1]:3000/api/v1/users/avatar',
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                          }
                        }
                      );

                      if (response.data.success) {
                        toast.success('Avatar updated successfully!');
                        await fetchProfile();
                      }
                    } catch (error) {
                      toast.error(error.response?.data?.message || 'Failed to update avatar');
                    }
                  }
                }}
              />
              <label htmlFor="avatar-upload">
                <IconButton 
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: '#30B68F', // Using the specific color here
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#25876E' // Darker shade for hover
                    }
                  }}
                >
                  <CameraAltIcon />
                </IconButton>
              </label>
            </Box>
            
            {/* User Info */}
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600,
                color: '#30B68F', // Using the specific color here
                mb: 0.5
              }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <FaUser size={14} />
                @{profile.username}
              </Typography>
            </Box>
          </Box>

          {/* Profile Details */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3
          }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Username
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 500,
                fontSize: '1.1rem'
              }}>
                {profile.username}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Email
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 500,
                fontSize: '1.1rem',
                wordBreak: 'break-word'
              }}>
                {profile.email}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                First Name
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {profile.firstName}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Last Name
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {profile.lastName}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Phone Number
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 500,
                fontSize: '1.1rem'
              }}>
                {profile.phoneNumber || 'Not provided'}
              </Typography>
            </Box>
          </Box>

          {/* Save Button */}
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#30B68F', // Using the specific color here
                color: 'white', // White text
                '&:hover': {
                  backgroundColor: '#25876E' // Darker shade for hover
                }
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Card>
      </Grid>

      {/* Account Information Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          boxShadow: 3,
          borderRadius: 2,
          p: 3,
          height: '100%',
          backgroundColor: 'background.paper'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            mb: 3,
            color: '#30B68F', // Using the specific color here
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <MdInfo size={20} />
            Account Information
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              color: 'text.secondary',
              mb: 0.5,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              User ID
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#30B68F', // Using the specific color here
              fontWeight: 500,
              fontSize: '0.9rem',
              wordBreak: 'break-all'
            }}>
              {userId}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: 'text.secondary',
              mb: 0.5,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Account Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#30B68F' // Using the specific color here
              }} />
              <Typography variant="body1" sx={{ 
                color: '#30B68F', // Using the specific color here
                fontWeight: 500,
                fontSize: '1.1rem'
              }}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ 
              color: 'text.secondary',
              mb: 1,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Member Since
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#30B68F', // Using the specific color here
              fontWeight: 500
            }}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
  </Box>
)}
            {/* Product Cards (My Pet Listings) - Original Style */}
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

            {/* Browse Pets Tab - New Interactive Section */}
{activeTab === "browsePet" && (
  <Box sx={{ mt: 3 }}>
    {/* Search and Filter Section */}
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 2, 
      mb: 3,
      alignItems: { xs: 'stretch', md: 'center' },
      backgroundColor: 'white',
      p: 3,
      borderRadius: 2,
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
    }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search pets by name..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          // Reset other filters when searching by name
          setFilters({
            species: '',
            age: ''
          });
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FaSearch color="#30B68F" />
            </InputAdornment>
          ),
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        '& .MuiFormControl-root': {
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          }
        }
      }}>
        <FormControl size="small">
          <InputLabel>Species</InputLabel>
          <Select
            name="species"
            value={filters.species}
            onChange={(e) => {
              setFilters({
                species: e.target.value,
                age: ''
              });
              setSearchTerm(''); // Clear name search when filtering by species
            }}
            label="Species"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Dog">Dog</MenuItem>
            <MenuItem value="Cat">Cat</MenuItem>
            <MenuItem value="Bird">Bird</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Age"
          name="age"
          type="number"
          value={filters.age}
          onChange={(e) => {
            // Ensure only positive numbers are entered
            const value = e.target.value;
            if (value === '' || (Number(value) > 0 && Number(value) < 100)) {
              setFilters({
                age: value,
                species: ''
              });
              setSearchTerm(''); // Clear name search when filtering by age
            }
          }}
          InputProps={{
            inputProps: { 
              min: 1,
              max: 99
            }
          }}
          sx={{ width: 120 }}
        />

        <Button 
          variant="contained"
          onClick={handleSearchSubmit}
          sx={{
            backgroundColor: '#30B68F',
            color: 'white',
            '&:hover': {
              backgroundColor: '#25876E'
            }
          }}
        >
          Apply Filters
        </Button>

        <Button 
          variant="outlined"
          onClick={() => {
            setSearchTerm('');
            setFilters({
              species: '',
              age: ''
            });
            fetchBrowsePets();
          }}
          sx={{
            color: '#30B68F',
            borderColor: '#30B68F',
            '&:hover': {
              backgroundColor: 'rgba(48, 182, 143, 0.08)'
            }
          }}
        >
          Clear All
        </Button>
      </Box>
    </Box>

    {/* Error Message */}
    {browseError && (
      <Typography color="error" align="center" sx={{ mb: 2 }}>
        {browseError}
      </Typography>
    )}

    {/* Pet Cards Grid */}
    {browsePets.length > 0 ? (
      <Grid container spacing={3}>
        {browsePets.map((pet) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pet.id}>
            <BrowsePetCard 
              product={pet}
              onClick={() => handleProductClick(pet)}
            />
          </Grid>
        ))}
      </Grid>
    ) : (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '300px',
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 2)'
      }}>
        <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
          No pets found matching your criteria
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => {
            setSearchTerm('');
            setFilters({
              species: '',
              age: ''
            });
            fetchBrowsePets();
          }}
          sx={{
            color: '#30B68F',
            borderColor: '#30B68F',
            '&:hover': {
              backgroundColor: 'rgba(48, 182, 143, 0.08)',
              borderColor: '#30B68F'
            }
          }}
        >
          Clear Filters
        </Button>
      </Box>
    )}

    {/* Pagination */}
    {browsePets.length > 0 && (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 4,
        mb: 2,
        '& .MuiButton-root': {
          mx: 1
        }
      }}>
        <Button
          variant="outlined"
          disabled={browsePage <= 1}
          onClick={() => setBrowsePage(browsePage - 1)}
          sx={{ 
            color: '#30B68F', 
            borderColor: '#30B68F',
            '&:hover': {
              backgroundColor: '#30B68F',
              color: 'white'
            },
            '&:disabled': {
              borderColor: 'rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          sx={{ 
            backgroundColor: '#30B68F',
            color: 'white',
            '&:hover': {
              backgroundColor: '#25876E'
            }
          }}
        >
          {browsePage}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setBrowsePage(browsePage + 1)}
          disabled={browsePets.length < 10}
          sx={{ 
            color: '#30B68F', 
            borderColor: '#30B68F',
            '&:hover': {
              backgroundColor: '#30B68F',
              color: 'white'
            },
            '&:disabled': {
              borderColor: 'rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          Next
        </Button>
      </Box>
    )}
  </Box>
)}
          </Container>
        </Box>
      </Box>

      {/* Modal for Adding New Pet */}
      
{/* Status Dropdown Menu */}
{/* Status Dropdown Menu */}
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleStatusClose}
  onClick={(e) => e.stopPropagation()}
  anchorOrigin={{
    vertical: 'center',
    horizontal: 'center',
  }}
  transformOrigin={{
    vertical: 'center',
    horizontal: 'center',
  }}
  PaperProps={{
    style: {
      width: '200px',
      borderRadius: '12px',
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
    }
  }}
>
  <MenuItem 
    onClick={() => handleStatusUpdate(ProductStatus.AVAILABLE)}
    disabled={isUpdatingStatus}
    sx={{
      color: '#4CAF50',
      fontWeight: 600,
      justifyContent: 'center',
      py: 1.5
    }}
  >
    {isUpdatingStatus && currentPetId ? (
      <CircularProgress size={20} color="inherit" />
    ) : (
      ProductStatus.AVAILABLE
    )}
  </MenuItem>
  <MenuItem 
    onClick={() => handleStatusUpdate(ProductStatus.PENDING)}
    disabled={isUpdatingStatus}
    sx={{
      color: '#FF9800',
      fontWeight: 600,
      justifyContent: 'center',
      py: 1.5
    }}
  >
    {isUpdatingStatus && currentPetId ? (
      <CircularProgress size={20} color="inherit" />
    ) : (
      ProductStatus.PENDING
    )}
  </MenuItem>
  <MenuItem 
    onClick={() => handleStatusUpdate(ProductStatus.ADOPTED)}
    disabled={isUpdatingStatus}
    sx={{
      color: '#F44336',
      fontWeight: 600,
      justifyContent: 'center',
      py: 1.5
    }}
  >
    {isUpdatingStatus && currentPetId ? (
      <CircularProgress size={20} color="inherit" />
    ) : (
      ProductStatus.ADOPTED
    )}
  </MenuItem>
</Menu>

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
      {/* Comment Modal */}
<Modal
  open={openCommentModal}
  onClose={() => setOpenCommentModal(false)}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{
    timeout: 500,
  }}
>
  <Dialog
    open={openCommentModal}
    onClose={() => setOpenCommentModal(false)}
    maxWidth="sm"
    fullWidth
    sx={{
      "& .MuiDialog-paper": {
        borderRadius: "16px",
        padding: "1.5rem",
      },
    }}
  >
    <DialogTitle sx={{ 
      fontWeight: "bold", 
      textAlign: "center",
      color: "#30B68F"
    }}>
      Add Comment for {selectedProduct?.name}
    </DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        label="Address"
        name="address"
        value={commentData.address}
        onChange={(e) => setCommentData({...commentData, address: e.target.value})}
        sx={{ mb: 3, mt: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        name="description"
        multiline
        rows={4}
        value={commentData.description}
        onChange={(e) => setCommentData({...commentData, description: e.target.value})}
        placeholder="Tell us about your experience with this pet..."
      />
    </DialogContent>
    <DialogActions sx={{ 
      justifyContent: "space-between", 
      padding: "1.5rem" 
    }}>
      <Button 
        onClick={() => setOpenCommentModal(false)}
        sx={{ 
          color: "#30B68F", 
          fontWeight: "bold",
          '&:hover': {
            backgroundColor: 'rgba(48, 182, 143, 0.08)'
          }
        }}
      >
        Cancel
      </Button>
      <Button 
        onClick={handleCommentSubmit}
        variant="contained"
        sx={{ 
          backgroundColor: "#30B68F",
          color: "white",
          fontWeight: "bold",
          "&:hover": { 
            backgroundColor: "#25876E" 
          },
          px: 3
        }}
      >
        Submit Comment
      </Button>
    </DialogActions>
  </Dialog>
</Modal>
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
                  fetchComments(selectedProduct);
                }}
                sx={{ color: "#30B68F" }}
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  setCommentsPage(prev => prev + 1);
                  fetchComments(selectedProduct);
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

      <ToastContainer 
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
/>
    </>
  );
};

export default HomePage;