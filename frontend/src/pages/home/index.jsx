"use client"
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  styled,
  keyframes,
  alpha,
} from "@mui/material"
import { motion } from "framer-motion"
import EmailIcon from "@mui/icons-material/Email"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import StarIcon from "@mui/icons-material/Star"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import { createTheme, ThemeProvider } from "@mui/material/styles"

// Create a custom theme with vibrant colors
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#a855f7", // Purple
      light: "#c084fc",
      dark: "#7e22ce",
    },
    secondary: {
      main: "#ec4899", // Pink
      light: "#f472b6",
      dark: "#be185d",
    },
    info: {
      main: "#06b6d4", // Cyan
      light: "#22d3ee",
      dark: "#0891b2",
    },
    success: {
      main: "#10b981", // Emerald
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b", // Amber
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444", // Red
      light: "#f87171",
      dark: "#b91c1c",
    },
    background: {
      default: "#1e1b4b", // Indigo 950
      paper: "#312e81", // Indigo 900
    },
    text: {
      primary: "#ffffff",
      secondary: "#e0e7ff", // Indigo 100
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontWeight: 700,
      color: "#fff"
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
        },
        containedPrimary: {
          background: "linear-gradient(to right, #ec4899, #a855f7)",
          "&:hover": {
            background: "linear-gradient(to right, #db2777, #9333ea)",
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})

// Keyframes for animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const blob = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
`

// Styled components
const GradientTypography = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(to right, #f9a8d4, #ffffff, #67e8f9)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textFillColor: "transparent",
}))

const HighlightTypography = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(to right, #fbbf24, #ec4899)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textFillColor: "transparent",
}))

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(to right, #ec4899, #a855f7)",
  "&:hover": {
    background: "linear-gradient(to right, #db2777, #9333ea)",
  },
}))

const FloatingBox = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
}))

const BlobBox = styled(Box)(({ theme, delay = 0 }) => ({
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(50px)",
  mixBlendMode: "multiply",
  opacity: 0.2,
  animation: `${blob} 7s infinite ${delay}s`,
}))

const GlowingCard = styled(Card)(({ theme, glowColor = "#a855f7" }) => ({
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    background: `linear-gradient(to right, ${glowColor}, ${theme.palette.primary.main})`,
    borderRadius: theme.shape.borderRadius + 1,
    opacity: 0,
    transition: "opacity 0.3s ease-in-out",
    zIndex: -1,
  },
  "&:hover::before": {
    opacity: 0.7,
  },
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}))

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}))

const HomePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Animation variants for Framer Motion
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: "linear-gradient(to bottom, #1e1b4b, #312e81, #4c1d95)",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          pt: 8,
          pb: 10,
        }}
      >
        {/* Background Blobs */}
        <BlobBox
          sx={{
            top: "10%",
            left: "5%",
            width: "300px",
            height: "300px",
            backgroundColor: theme.palette.secondary.main,
          }}
        />
        <BlobBox
          sx={{
            top: "20%",
            right: "5%",
            width: "400px",
            height: "400px",
            backgroundColor: theme.palette.warning.main,
          }}
          delay={2}
        />
        <BlobBox
          sx={{
            bottom: "10%",
            left: "30%",
            width: "350px",
            height: "350px",
            backgroundColor: theme.palette.info.main,
          }}
          delay={4}
        />
        <BlobBox
          sx={{
            bottom: "-10%",
            right: "25%",
            width: "250px",
            height: "250px",
            backgroundColor: theme.palette.primary.main,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Hero Section */}
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }}>
            <Box textAlign="center" mb={10}>
              <Box display="inline-block" mb={3}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 5,
                    background: "linear-gradient(to right, #ec4899, #a855f7)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AutoAwesomeIcon fontSize="small" />
                  <Typography variant="body2" fontWeight="medium">
                    Next-Gen AI Outreach Platform
                  </Typography>
                </Paper>
              </Box>

              <GradientTypography
                variant="h1"
                component="h1"
                gutterBottom
                sx={{ mb: 2, fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" } }}
              >
                Supercharge Outreach with
              </GradientTypography>
              <HighlightTypography
                variant="h1"
                component="div"
                gutterBottom
                sx={{ mb: 4, fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" } }}
              >
                Hyper-Personalized Campaigns
              </HighlightTypography>

              <Typography
                variant="h5"
                sx={{ color: "#fff", maxWidth: 800, mx: "auto", mb: 6, lineHeight: 1.6 }}
              >
                All-in-one platform that combines AI, API requests, data enrichment and automation to deliver deeply
                personalized email campaigns at scale
              </Typography>

              
            </Box>

            <FloatingBox sx={{ maxWidth: "900px", mx: "auto", mb: 12 }}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: "-5px",
                    background: "linear-gradient(to right, #ec4899, #a855f7)",
                    borderRadius: 4,
                    filter: "blur(15px)",
                    opacity: 0.75,
                  }}
                />
                <Paper
                  elevation={24}
                  sx={{
                    position: "relative",
                    p: 1,
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${alpha("#ffffff", 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: "200px", md: "300px" },
                      borderRadius: 3,
                      background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.secondary.dark, 0.8)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${alpha("#ffffff", 0.1)}`,
                    }}
                  >
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: "auto",
                          mb: 2,
                          background: alpha("#ffffff", 0.1),
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <EmailIcon fontSize="large" sx={{ color: theme.palette.secondary.light }} />
                      </Avatar>
                      <Typography variant="h6" color="white">
                        Your Campaign Dashboard
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </FloatingBox>

            <FloatingBox sx={{ maxWidth: "900px", mx: "auto", mb: 12 }}>
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    position: "absolute",
                    inset: "-5px",
                    background: "linear-gradient(to right, #ec4899, #a855f7)",
                    borderRadius: 4,
                    filter: "blur(15px)",
                    opacity: 0.75,
                  }}
                />
                <Paper
                  elevation={24}
                  sx={{
                    position: "relative",
                    p: 1,
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${alpha("#ffffff", 0.1)}`,
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: "200px", md: "300px" },
                      borderRadius: 3,
                      background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.dark, 0.8)}, ${alpha(theme.palette.secondary.dark, 0.8)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${alpha("#ffffff", 0.1)}`,
                    }}
                  >
                    <Box textAlign="center">
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: "auto",
                          mb: 2,
                          background: alpha("#ffffff", 0.1),
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <EmailIcon fontSize="large" sx={{ color: theme.palette.secondary.light }} />
                      </Avatar>
                      <Typography variant="h6" color="white">
                        Your Campaign Dashboard
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </FloatingBox>
          </motion.div>

        

        

          {/* Footer */}
          <Box sx={{ textAlign: "center", color: alpha(theme.palette.common.white, 0.7), mb: 4 }}>
            <Typography variant="body2">© {new Date().getFullYear()} Your Company. All rights reserved.</Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default HomePage

