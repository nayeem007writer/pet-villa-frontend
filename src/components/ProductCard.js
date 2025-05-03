import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

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
      {/* Love Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 36,
          height: 36,
          backgroundColor: '#ff4081',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        <FavoriteIcon sx={{ color: 'white', fontSize: 20 }} />
      </Box>

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
    </Card>
  );
};

export default ProductCard;