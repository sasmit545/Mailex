import React, { useEffect, useState } from "react";
import { useFirebase } from "../../firebase_context";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app_router";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const provider = new GoogleAuthProvider();

  const { user, auth } = useFirebase();
  const navigate = useNavigate();

  const login = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError("Google login failed");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      console.log(user)
      navigate(routes.home);
    }
  }, [user, navigate]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {error && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
      <Typography variant="h3" component="h1" gutterBottom>
        Mailex
      </Typography>
      <Typography variant="body1" gutterBottom>
        Create custom email automations with AI
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Loading..." : "Start"}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
