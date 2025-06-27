import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Grid2,
  Paper,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import { useFirebase } from "../../firebase_context";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DnsIcon from '@mui/icons-material/Dns';
import PortIcon from '@mui/icons-material/DeviceHub';

const MailboxForm = () => {
  const { user } = useFirebase();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState({
    appPassword: false,
    imapPassword: false,
    smtpPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("gmail");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    email: "",
    userID:user.uid ,
    type: "gmail",
    info: {
      password: "",
      first_name: "",
      last_name: "",
      imap_email: "",
      imap_host: "",
      imap_password: "",
      imap_port: "",
      imap_username: "",
      smtp_host: "",
      smtp_password: "",
      smtp_port: "",
      smtp_username: ""
    }
  });

  const steps = ['Basic Details', type === 'smtp' ? 'IMAP Settings' : 'Personal Info', 'Review & Submit'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("info.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        info: { ...prev.info, [key]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setFormData((prev) => ({ ...prev, type: e.target.value }));
  };

  const handleClickShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://us-central1-mailex-cfa6e.cloudfunctions.net/addmailbox",
        formData
      );
      setSnackbar({ open: true, message: response.data.message, severity: "success" });
      // Reset form on success
      if (response.data.success) {
        setFormData({
          email: "",
          userID: user ? user.uid : "",
          type: "gmail",
          info: {
            password: "",
            first_name: "",
            last_name: "",
            imap_email: "",
            imap_host: "",
            imap_password: "",
            imap_port: "",
            imap_username: "",
            smtp_host: "",
            smtp_password: "",
            smtp_port: "",
            smtp_username: ""
          }
        });
        setActiveStep(0);
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Unknown error";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid2 container spacing={3}>
            <Grid2 item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <TextField
                fullWidth
                select
                name="type"
                label="Mailbox Type"
                value={type}
                onChange={handleTypeChange}
                variant="outlined"
                helperText="Select your email service provider type"
              >
                <MenuItem value="gmail">Gmail</MenuItem>
                <MenuItem value="smtp">Custom SMTP</MenuItem>
              </TextField>
            </Grid2>
          </Grid2>
        );
      case 1:
        if (type === 'smtp') {
          return (
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.imap_email"
                  label="IMAP Email"
                  value={formData.info.imap_email}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.imap_username"
                  label="IMAP Username"
                  value={formData.info.imap_username}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.imap_host"
                  label="IMAP Host"
                  value={formData.info.imap_host}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DnsIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.imap_port"
                  label="IMAP Port"
                  value={formData.info.imap_port}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PortIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12}>
                <TextField
                  fullWidth
                  name="info.imap_password"
                  label="IMAP Password"
                  type={showPassword.imapPassword ? "text" : "password"}
                  value={formData.info.imap_password}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('imapPassword')}
                          edge="end"
                        >
                          {showPassword.imapPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="textSecondary">SMTP Settings</Typography>
                </Divider>
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.smtp_host"
                  label="SMTP Host"
                  value={formData.info.smtp_host}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DnsIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.smtp_port"
                  label="SMTP Port"
                  value={formData.info.smtp_port}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PortIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.smtp_username"
                  label="SMTP Username"
                  value={formData.info.smtp_username}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.smtp_password"
                  label="SMTP Password"
                  type={showPassword.smtpPassword ? "text" : "password"}
                  value={formData.info.smtp_password}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('smtpPassword')}
                          edge="end"
                        >
                          {showPassword.smtpPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
            </Grid2>
          );
        } else {
          return (
            <Grid2 container spacing={3}>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.first_name"
                  label="First Name"
                  value={formData.info.first_name}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="info.last_name"
                  label="Last Name"
                  value={formData.info.last_name}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
              <Grid2 item xs={12}>
                <TextField
                  fullWidth
                  name="info.password"
                  label="App Password"
                  type={showPassword.appPassword ? "text" : "password"}
                  value={formData.info.password}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="For Gmail, use an App Password generated from your Google Account"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('appPassword')}
                          edge="end"
                        >
                          {showPassword.appPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
            </Grid2>
          );
        }
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Mailbox Information
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Type:</strong> {formData.type === 'gmail' ? 'Gmail' : 'Custom SMTP'}
                </Typography>
                
                {type === 'gmail' && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Name:</strong> {formData.info.first_name} {formData.info.last_name}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>App Password:</strong> {formData.info.password ? '••••••••' : 'Not set'}
                    </Typography>
                  </>
                )}
                
                {type === 'smtp' && (
                  <>
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        IMAP Settings
                      </Typography>
                      <Typography variant="body2">Email: {formData.info.imap_email || 'Not set'}</Typography>
                      <Typography variant="body2">Host: {formData.info.imap_host || 'Not set'}</Typography>
                      <Typography variant="body2">Port: {formData.info.imap_port || 'Not set'}</Typography>
                      <Typography variant="body2">Username: {formData.info.imap_username || 'Not set'}</Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        SMTP Settings
                      </Typography>
                      <Typography variant="body2">Host: {formData.info.smtp_host || 'Not set'}</Typography>
                      <Typography variant="body2">Port: {formData.info.smtp_port || 'Not set'}</Typography>
                      <Typography variant="body2">Username: {formData.info.smtp_username || 'Not set'}</Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please verify that all information is correct before submitting. Your mailbox 
              will be set up with these settings.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.email ;
      case 1:
        if (type === 'smtp') {
          return formData.info.imap_host && formData.info.imap_port && formData.info.smtp_host && formData.info.smtp_port;
        }
        if (type === 'gmail') {
            return formData.info.first_name&&formData.info.password
        }
        return true; // For Gmail, we don't require personal info
      case 2:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 4, mt: 5 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'medium' }}>
          Add New Mailbox
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Connect your email account to access and manage emails directly from our platform.
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Box sx={{ mb: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Add Mailbox'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!isStepValid(activeStep) || loading}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MailboxForm;