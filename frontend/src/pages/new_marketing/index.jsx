import React, { useEffect, useState } from 'react';
import { useFirebase } from '../../firebase_context';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../app_router';
import { Container, Typography, TextField, Button, Box, Snackbar, Alert } from '@mui/material';
import { getProspects } from '../../api/api';

const NewMarketing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [positions, setPositions] = useState('');
  const [locations, setLocations] = useState('');
  const [offer, setOffer] = useState('');

  const navigate = useNavigate();

  const { db, user } = useFirebase();

  useEffect(() => {
    if (!user) {
      navigate(routes.login);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    let leads;
    try {
      const locationsArray = locations.split(',').map((x) => x.trim());
      const keywordsArray = keywords.split(',').map((x) => x.trim());
      const positionsArray = positions.split(',').map((x) => x.trim());

      const prospectsResp = await getProspects(locationsArray, keywordsArray, positionsArray);
      leads = prospectsResp.data;
    } catch (error) {
      setError('Failed to generate leads - try different parameters');
      console.error(error);
      setLoading(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'marketings'), {
        name,
        keywords,
        positions,
        locations,
        offer,
        leads,
        userID: user.uid,
      });
      setLoading(false);
      navigate(routes.marketingLeads.replace(':id', docRef.id));
    } catch (error) {
      setError('Failed to add marketing data');
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          New Marketing
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Marketing Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Keywords (comma separated)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Positions (comma separated)"
            value={positions}
            onChange={(e) => setPositions(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Locations (comma separated)"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Info about your offer"
            multiline
            rows={4}
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? 'Loading...' : 'Generate leads'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NewMarketing;
