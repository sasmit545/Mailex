"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Link,
  Avatar,
  Fade,
  Backdrop,
  Modal,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
} from "@mui/material"
import {
  LinkedIn,
  Launch,
  ContentCopy,
  CheckCircle,
  LocationOn,
  Work,
  Badge,
  VerifiedUser,
  Person,
  ArrowForward,
} from "@mui/icons-material"
import { addLinkedinAccount } from "../../api/api"
import { useFirebase } from "../../firebase_context"
import { collection, getDocs, query, where } from "firebase/firestore"

const LinkedinAuthPage = () => {
  const theme = useTheme()
  const { db, user } = useFirebase()

  const [loading, setLoading] = useState(false)
  const [authLink, setAuthLink] = useState("")
  const [error, setError] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [fetchingAccounts, setFetchingAccounts] = useState(false)
  const [profileImageErrors, setProfileImageErrors] = useState({})

  // Function to process profile image URLs if needed
  const processImageUrl = (url) => {
    if (!url) return ""

    // Ensure the URL is properly formatted
    try {
      // Return the URL as is, since Cloudinary URLs are already optimized
      return url
    } catch (e) {
      console.error("Error processing image URL:", e)
      return ""
    }
  }

  useEffect(() => {
    const fetchUserAccounts = async () => {
      if (!user) return

      setFetchingAccounts(true)
      setFetchError("")

      try {
        const q = query(collection(db, "linkedin_acc"), where("created_by", "==", user.uid))
        const querySnapshot = await getDocs(q)

        const fetchedAccountsData = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.account_id,
            name: data.name || "LinkedIn Account",
            username: data.username || "",
            occupation: data.occupation || "",
            profilePicture: processImageUrl(data.profile_picture_url),
            location: data.location || "",
            premium: data.premium || false,
            openProfile: data.open_profile || false,
            createdAt: data.created_at?.toDate() || new Date(),
          }
        })

        setAccounts(fetchedAccountsData)
      } catch (error) {
        console.error("Error fetching LinkedIn accounts:", error)

        if (error.code === "permission-denied" || error.message.includes("Missing or insufficient permissions")) {
          setFetchError("Unable to access LinkedIn accounts. Please check your permissions or contact support.")
        } else {
          setFetchError("Failed to load your LinkedIn accounts. Please try again later.")
        }
      } finally {
        setFetchingAccounts(false)
      }
    }

    fetchUserAccounts()
  }, [user, db])

  const handleAddAccount = async () => {
    setLoading(true)
    setError("")
    setAuthLink("")

    try {
      if (!user) {
        throw new Error("You must be logged in to add a LinkedIn account")
      }

      const response = await addLinkedinAccount(user.uid)

      if (response && response.data && response.data.url) {
        setAuthLink(response.data.url)
        setModalOpen(true)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err) {
      console.error("LinkedIn auth error:", err)
      setError("Failed to generate LinkedIn authentication link. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(authLink)
      .then(() => {
        setShowCopySuccess(true)
        setTimeout(() => setShowCopySuccess(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy link:", err)
        setError("Failed to copy link to clipboard")
      })
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleImageError = (accountId) => {
    console.log(`Image failed to load for account: ${accountId}`)
    setProfileImageErrors((prev) => ({
      ...prev,
      [accountId]: true,
    }))
  }

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 85%, rgba(10, 102, 194, 0.08) 100%)`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0077B5 0%, #0A66C2 100%)",
              boxShadow: "0 10px 20px rgba(10, 102, 194, 0.2)",
              mb: 3,
            }}
          >
            <LinkedIn sx={{ fontSize: 50, color: "white" }} />
          </Box>

          <Typography
            variant="h4"
            gutterBottom
            fontWeight="600"
            sx={{
              mb: 1,
              background: "linear-gradient(90deg, #0A66C2 0%, #0077B5 100%)",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connect LinkedIn Account
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{
              mb: 4,
              maxWidth: 600,
              lineHeight: 1.6,
            }}
          >
            Link your LinkedIn profile to enable automated networking, content sharing, and profile syncing for a more
            powerful social media presence.
          </Typography>

          <Divider sx={{ width: "100%", mb: 4 }} />

          <Box sx={{ width: "100%", mb: 4, px: { xs: 0, md: 2 } }}>
            <Typography variant="h6" paragraph fontWeight="500" color="text.primary">
              Connection Process
            </Typography>

            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(10, 102, 194, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" color="#0A66C2" fontWeight="bold">
                      1
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                    Generate Link
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the button below to create a secure authentication link
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(10, 102, 194, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" color="#0A66C2" fontWeight="bold">
                      2
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                    Authorize Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow the link to authorize access to your LinkedIn account
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(10, 102, 194, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" color="#0A66C2" fontWeight="bold">
                      3
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                    Complete Setup
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Finish the authentication process and return to this page
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? null : <LinkedIn />}
            onClick={handleAddAccount}
            disabled={loading || !user}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              backgroundColor: "#0A66C2",
              "&:hover": {
                backgroundColor: "#084e96",
                boxShadow: "0 4px 12px rgba(10, 102, 194, 0.3)",
              },
              minWidth: 250,
              boxShadow: "0 4px 12px rgba(10, 102, 194, 0.2)",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Generating Link...
              </Box>
            ) : (
              "Generate Authentication Link"
            )}
          </Button>

          {error && (
            <Box mt={3} width="100%">
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Box>
          )}

          {!user && (
            <Box mt={3} width="100%">
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    alignItems: "center",
                  },
                }}
              >
                Please log in to connect your LinkedIn account
              </Alert>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Show connected accounts with more details */}
      <Box mt={6} mb={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{
              color: theme.palette.text.primary,
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                backgroundColor: "#0A66C2",
                borderRadius: 4,
              },
            }}
          >
            Connected Accounts
          </Typography>

          <Chip
            label={`${accounts.length} ${accounts.length === 1 ? "Account" : "Accounts"}`}
            sx={{
              bgcolor: "rgba(10, 102, 194, 0.1)",
              color: "#0A66C2",
              fontWeight: 500,
            }}
          />
        </Box>

        {fetchingAccounts ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            my={6}
            py={4}
            sx={{
              borderRadius: 3,
              bgcolor: "rgba(0, 0, 0, 0.02)",
            }}
          >
            <CircularProgress size={40} sx={{ color: "#0A66C2" }} />
            <Typography variant="body1" sx={{ ml: 2, color: "text.secondary" }}>
              Loading your accounts...
            </Typography>
          </Box>
        ) : fetchError ? (
          <Alert
            severity="error"
            sx={{
              mt: 1,
              borderRadius: 2,
              py: 2,
            }}
          >
            {fetchError}
          </Alert>
        ) : accounts.length > 0 ? (
          <Grid container spacing={3}>
            {accounts.map((account) => (
              <Grid item xs={12} key={account.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                      borderColor: "rgba(10, 102, 194, 0.2)",
                    },
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  {account.premium && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 20,
                        bgcolor: "#f3c75f",
                        color: "#7d5700",
                        px: 2,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        borderBottomRightRadius: 8,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        zIndex: 1,
                      }}
                    >
                      PREMIUM
                    </Box>
                  )}

                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        height: 60,
                        bgcolor: "rgba(10, 102, 194, 0.05)",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                      }}
                    />

                    <Box p={3}>
                      <Box display="flex" alignItems="flex-start" position="relative">
                        <Avatar
                          src={profileImageErrors[account.id] ? undefined : account.profilePicture}
                          alt={account.name}
                          sx={{
                            width: 80,
                            height: 80,
                            border: "3px solid white",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            bgcolor: profileImageErrors[account.id] ? "#0A66C2" : "grey.300",
                            fontSize: "1.75rem",
                            mt: -7,
                            position: "relative",
                          }}
                          imgProps={{
                            onError: () => handleImageError(account.id),
                            loading: "lazy",
                            crossOrigin: "anonymous",
                          }}
                        >
                          {profileImageErrors[account.id] || !account.profilePicture
                            ? getInitials(account.name) || <Person />
                            : null}
                        </Avatar>

                        {account.premium && (
                          <Box
                            position="absolute"
                            sx={{
                              bottom: -4,
                              left: 60,
                              bgcolor: "#fff",
                              borderRadius: "50%",
                              p: 0.5,
                              boxShadow: 1,
                              zIndex: 1,
                            }}
                          >
                            <VerifiedUser sx={{ fontSize: 16, color: "#f3c75f" }} />
                          </Box>
                        )}

                        <Box ml={3} flexGrow={1}>
                          <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "flex-start" }}
                          >
                            <Box>
                              <Typography variant="h6" fontWeight="600">
                                {account.name}
                              </Typography>

                              {account.username && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  @{account.username}
                                </Typography>
                              )}
                            </Box>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                bgcolor: "rgba(0, 0, 0, 0.03)",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 5,
                                display: "inline-flex",
                                alignItems: "center",
                                mt: { xs: 1, sm: 0 },
                              }}
                            >
                              Connected on {formatDate(account.createdAt)}
                            </Typography>
                          </Box>

                          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mt={1.5}>
                            {account.occupation && (
                              <Box display="flex" alignItems="center">
                                <Work sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                <Typography variant="body2">{account.occupation}</Typography>
                              </Box>
                            )}

                            {account.location && (
                              <Box display="flex" alignItems="center">
                                <LocationOn sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                                <Typography variant="body2">{account.location}</Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexWrap="wrap"
                        gap={1}
                        mt={3}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" gap={1}>
                          <Chip
                            size="small"
                            icon={<LinkedIn sx={{ fontSize: 14 }} />}
                            label={account.openProfile ? "Open Profile" : "Standard Profile"}
                            sx={{
                              bgcolor: account.openProfile ? "rgba(10, 102, 194, 0.1)" : "rgba(0, 0, 0, 0.05)",
                              color: account.openProfile ? "#0A66C2" : "text.secondary",
                              fontWeight: 500,
                            }}
                          />

                          {account.premium && (
                            <Chip
                              size="small"
                              icon={<Badge sx={{ fontSize: 14 }} />}
                              label="Premium"
                              sx={{
                                bgcolor: "rgba(243, 199, 95, 0.15)",
                                color: "#b7791f",
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Box>

                        
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            p={5}
            textAlign="center"
            bgcolor="rgba(0, 0, 0, 0.02)"
            borderRadius={3}
            border="1px dashed rgba(0, 0, 0, 0.1)"
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                bgcolor: "rgba(10, 102, 194, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LinkedIn sx={{ fontSize: 30, color: "#0A66C2" }} />
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No LinkedIn Accounts Connected
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
              Connect your LinkedIn account to enable automated networking, content sharing, and profile syncing.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleAddAccount}
              startIcon={<LinkedIn />}
              sx={{
                borderColor: "#0A66C2",
                color: "#0A66C2",
                "&:hover": {
                  borderColor: "#084e96",
                  bgcolor: "rgba(10, 102, 194, 0.05)",
                },
                textTransform: "none",
              }}
            >
              Connect LinkedIn Account
            </Button>
          </Box>
        )}
      </Box>

      {/* Modal for displaying the authentication link */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={modalOpen}>
          <Paper
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 500 },
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              p: 4,
              outline: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >
              <LinkedIn sx={{ fontSize: 28, color: "#0A66C2", mr: 1.5 }} />
              <Typography variant="h5" fontWeight="600">
                LinkedIn Authentication
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Alert
              severity="info"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  alignItems: "center",
                },
              }}
            >
              Your authentication link has been generated. Click the button below to proceed to LinkedIn.
            </Alert>

            <Box
              sx={{
                p: 2,
                bgcolor: "rgba(0, 0, 0, 0.03)",
                borderRadius: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flexGrow: 1,
                  mr: 1,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                {authLink}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={showCopySuccess ? <CheckCircle color="success" /> : <ContentCopy />}
                onClick={copyLinkToClipboard}
                color={showCopySuccess ? "success" : "primary"}
                sx={{
                  minWidth: 100,
                  borderRadius: 1.5,
                }}
              >
                {showCopySuccess ? "Copied" : "Copy"}
              </Button>
            </Box>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                component={Link}
                href={authLink}
                target="_blank"
                endIcon={<Launch />}
                sx={{
                  bgcolor: "#0A66C2",
                  "&:hover": {
                    bgcolor: "#084e96",
                    boxShadow: "0 4px 12px rgba(10, 102, 194, 0.3)",
                  },
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(10, 102, 194, 0.2)",
                  textTransform: "none",
                }}
              >
                Proceed to LinkedIn
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </Container>
  )
}

export default LinkedinAuthPage
