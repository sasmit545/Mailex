import React from 'react';
import { AppBar, Toolbar, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../Screenshot 2025-03-23 014655.png';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar 
      position="static" 
      elevation={3}
      sx={{ backgroundColor: '#23343c' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', padding: '0.1rem 2rem' }}>
        {/* Logo */}
        <Link to="/Home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ height: 90, cursor: 'pointer' }} 
          />
        </Link>

        {/* Navigation Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: '1rem',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Button 
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#fff',
              fontSize: '1.0rem', // Increased font size
              '&:hover': {
               
                color: '#4cc9f0'
              }
            }} 
            component={Link} 
            to="/mailbox"
          >
            Mailbox Dashboard
          </Button>
          
          <Button 
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.0rem', // Increased font size
              color: '#fff',
              '&:hover': {
               
                color: '#4cc9f0'
              }
            }} 
            component={Link} 
            to="/prospecting"
          >
            Prospecting
          </Button>
          <Button 
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.0rem', // Increased font size
              color: '#fff',
              '&:hover': {
               
                color: '#4cc9f0'
              }
            }} 
            component={Link} 
            to="/add-linkedin"
          >
            Add Linkedin Account
          </Button>
          
          <Button 
            sx={{ 
              borderRadius: '4px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.0rem', // Increased font size
              color: '#fff',
              '&:hover': {
               
                color: '#4cc9f0'
              }
            }} 
            component={Link}
            to="/campaigns/new"
          >
            Create Campaign
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
