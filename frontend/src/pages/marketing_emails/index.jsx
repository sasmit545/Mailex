import React, { useEffect, useState } from "react";
import {
  Container,
  Snackbar,
  Alert,
  Typography,
  Box,
  TextField,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, AccountCircle } from "@mui/icons-material";
import { useFirebase } from "../../firebase_context";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { routes } from "../../app_router";
import { sendEmail } from "../../api/api";

const MarketingEmails = () => {
  const [emails, setEmails] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [senderEmail, setSenderEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { db, user } = useFirebase();

  useEffect(() => {
    if (!user) {
      navigate(routes.login);
      return;
    }

    const fetchMarketingData = async () => {
      try {
        const docRef = doc(db, "marketings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmails(data.emails || []);
          setName(data.name || "");
        } else {
          setError("Marketing campaign not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch marketing data.");
      }
    };

    fetchMarketingData();
  }, [user, db, navigate, id]);

  const handleSendEmails = async () => {
    if (!senderEmail || !appPassword) {
      alert("Please fill out both email and password.");
      return;
    }

    setLoading(true);

    try {
      const docRef = doc(db, "marketings", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("No emails found.");
        setLoading(false);
        return;
      }

      const data = docSnap.data();
      const mailPrep = (data.emails || []).map((item) => ({
        to_email: item.lead.email,
        subject: `${item.lead.name}, A special message for you`,
        body: item.email,
        sender_mail: senderEmail,
        appPassword,
      }));

      const responses = await Promise.allSettled(mailPrep.map(sendEmail));

      const successful = responses.filter(
        (r) => r.status === "fulfilled" && r.value?.status === 200
      ).length;
      const failed = responses.length - successful;

      alert(`✅ Sent: ${successful} | ❌ Failed: ${failed}`);
    } catch (err) {
      console.error("Error sending emails:", err);
      alert("Something went wrong while sending emails.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <Container component="main">
      {/* Error Snackbar */}
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <Typography variant="h5" align="center" sx={{ my: 5 }}>
        AI-Generated Emails for <strong>{name}</strong> Campaign
      </Typography>

      {emails.map((email, idx) => (
        <Container
          key={idx}
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            mb: 2,
            p: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              backgroundColor: "darkgrey",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="h6">{email.lead.name}</Typography>
            <Button
              variant="contained"
              color="primary"
              href={email.lead.linkedin_url}
              target="_blank"
            >
              LinkedIn
            </Button>
          </Box>
          <Typography variant="body1" sx={{ p: 2, whiteSpace: "pre-wrap" }}>
            {email.email}
          </Typography>
        </Container>
      ))}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 5,
          gap: 3,
        }}
      >
        <Typography variant="h5" color="primary">
          Email Campaign Dashboard
        </Typography>

        {/* Sender Email + Password Inputs */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center",
            width: "100%",
            maxWidth: 800,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircle sx={{ fontSize: 48, color: "action.active" }} />
            <TextField
              id="senderEmail"
              label="Sender Email"
              variant="standard"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              fullWidth
            />
          </Box>

          <FormControl variant="outlined" sx={{ width: 300 }}>
            <InputLabel htmlFor="password">App Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? "text" : "password"}
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="App Password"
            />
          </FormControl>
        </Box>

        {/* Send Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendEmails}
          disabled={loading}
          sx={{ mt: 3, px: 5, py: 1.5, fontSize: 16 }}
        >
          {loading ? "Sending..." : "SEND"}
        </Button>
      </Box>
    </Container>
  );
};

export default MarketingEmails;
