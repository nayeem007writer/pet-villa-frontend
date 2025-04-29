import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const ProductCard = ({ product, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      sx={{ 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ 
        height: 200,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img
          src={product.productImages || '/placeholder-pet.jpg'}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none' // Prevent image from blocking clicks
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.species} • {product.breed}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Age: {product.age}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {product.status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProductCard;