"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "../../firebase_context"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Typography,
  Alert,
  Box,
  Chip,
  Button,
  Avatar,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  IconButton,
  Badge,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Skeleton,
  Paper,
  Stack,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import BoltIcon from "@mui/icons-material/Bolt"
import VisibilityIcon from "@mui/icons-material/Visibility"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import AddIcon from "@mui/icons-material/Add"
import RefreshIcon from "@mui/icons-material/Refresh"
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread"
import DashboardIcon from "@mui/icons-material/Dashboard"
import MenuIcon from "@mui/icons-material/Menu"
import FilterListIcon from "@mui/icons-material/FilterList"
import SortIcon from "@mui/icons-material/Sort"
import SpeedIcon from "@mui/icons-material/Speed"
import { fetchMailboxes } from "../../api/api"

export default function Mailbox() {
  const { user } = useFirebase()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))
  const [mailboxes, setMailboxes] = useState([])
  const [filteredMailboxes, setFilteredMailboxes] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState("newest")
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const getMailboxes = async () => {
    try {
      setLoading(true)
      const data = await fetchMailboxes(user.uid)
      setMailboxes(data.mailboxes || [])
    } catch (err) {
      console.error(err)
      setError("Failed to fetch mailboxes.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await getMailboxes()
    setRefreshing(false)
    setSnackbar({
      open: true,
      message: "Mailboxes refreshed successfully",
      severity: "success",
    })
  }

  useEffect(() => {
    if (user?.uid) getMailboxes()
    else setLoading(false)
  }, [user])

  useEffect(() => {
    // Filter mailboxes based on tab selection
    let filtered = [...mailboxes]

    switch (tabValue) {
      case 0: // All
        // No filtering needed
        break
      case 1: // Active warmup
        filtered = filtered.filter((m) => m.warmup === true)
        break
      case 2: // Paused
        filtered = filtered.filter((m) => m.warmup === false)
        break
      default:
      // No filtering needed
    }

    // Apply sorting
    filtered = sortMailboxes(filtered, sortOrder)
    setFilteredMailboxes(filtered)
  }, [mailboxes, tabValue, sortOrder])

  const sortMailboxes = (mailboxes, order) => {
    return [...mailboxes].sort((a, b) => {
      switch (order) {
        case "newest":
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
        case "oldest":
          return (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0)
        case "emailAZ":
          return (a.email || "").localeCompare(b.email || "")
        case "emailZA":
          return (b.email || "").localeCompare(a.email || "")
        default:
          return 0
      }
    })
  }

  const handleViewClick = (id) => {
    navigate(`/mailbox/stats/${id}`)
  }

  const handleAddMailbox = () => {
    navigate("/add-mailbox")
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  const handleSortChange = (order) => {
    setSortOrder(order)
    setSnackbar({
      open: true,
      message: `Sorted by ${order.replace(/([A-Z])/g, " $1").toLowerCase()}`,
      severity: "info",
    })
  }

  async function handleWarmupAction({ campaignID, action }) {
    const endpointMap = {
      start: "/startWarmup",
      resume: "/resumeWarmup",
      pause: "/pauseWarmup",
    }

    const endpoint = "https://us-central1-mailex-cfa6e.cloudfunctions.net" + endpointMap[action]

    if (!endpoint) {
      setSnackbar({
        open: true,
        message: "Invalid action specified.",
        severity: "error",
      })
      return
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignID }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Something went wrong")
      }

      const data = await response.json()

      setSnackbar({
        open: true,
        message: data.message || `Warmup ${action} successful`,
        severity: "success",
      })

      // Refresh mailbox data after successful warmup action
      getMailboxes()
    } catch (error) {
      console.error(`Warmup ${action} error:`, error.message)
      setSnackbar({
        open: true,
        message: error.message || `Failed to ${action} warmup`,
        severity: "error",
      })
    }
  }

  // Helper function to get status color
  const getStatusColor = (mailbox) => {
    if (mailbox.warmup === false) return "warning"
    return "success"
  }

  // Helper function to get status text
  const getStatusText = (mailbox) => {
    if (mailbox.warmup === false) return "Warmup Paused"
    return "Warmup Active"
  }

  // Helper function to render skeleton loading state
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Grid item xs={12} md={isTablet ? 12 : 6} lg={4} key={`skeleton-${index}`}>
          <Fade in={true} timeout={300 + index * 100}>
            <Card elevation={3} sx={{ height: "100%", borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2 }}>
                    <Skeleton width="80%" height={28} />
                    <Skeleton width="60%" height={20} />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <Skeleton width={100} height={32} />
                  <Skeleton width={120} height={32} />
                  <Skeleton width={110} height={32} />
                </Box>
                <Skeleton width="100%" height={40} />
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      ))
  }

  // Count active and paused mailboxes
  const activeMailboxCount = mailboxes.filter((m) => m.warmup === true).length
  const pausedMailboxCount = mailboxes.filter((m) => m.warmup === false).length

  // Check if there was an error loading user data
  const userError = !user && !loading

  // Navigation drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: "white" }}>
        <Typography variant="h6">Email Warmup</Typography>
        <Typography variant="body2">Manage your mailboxes</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/dashboard")}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary="Mailboxes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/analytics")}>
            <ListItemIcon>
              <SpeedIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            Sort Mailboxes
          </Typography>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleSortChange("newest")} selected={sortOrder === "newest"}>
            <ListItemText primary="Newest First" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleSortChange("oldest")} selected={sortOrder === "oldest"}>
            <ListItemText primary="Oldest First" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleSortChange("emailAZ")} selected={sortOrder === "emailAZ"}>
            <ListItemText primary="Email A-Z" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleSortChange("emailZA")} selected={sortOrder === "emailZA"}>
            <ListItemText primary="Email Z-A" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <>
      <SwipeableDrawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)}>
        {drawerContent}
      </SwipeableDrawer>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center">
            {isMobile && (
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" fontWeight="bold" component="div">
              Your Mailboxes
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            {!isMobile && (
              <Tooltip title="Sort Mailboxes">
                <IconButton onClick={toggleDrawer(true)} color="inherit" sx={{ mr: 1 }}>
                  <SortIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh Mailboxes">
              <IconButton onClick={handleRefresh} disabled={refreshing || userError} color="inherit" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddMailbox}
              disabled={userError}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              {isMobile ? "Add" : "Add Mailbox"}
            </Button>
          </Box>
        </Paper>

        {refreshing && (
          <LinearProgress
            sx={{
              mb: 2,
              height: 6,
              borderRadius: 3,
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
              },
            }}
          />
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {userError ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 2,
              bgcolor: theme.palette.warning.light + "20",
              border: `1px solid ${theme.palette.warning.light}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                <MarkEmailUnreadIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Authentication Required
                </Typography>
                <Typography variant="body2">
                  Please sign in to view your mailboxes and manage your email warmup campaigns.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  "& .MuiTab-root": {
                    py: 2,
                  },
                }}
                TabIndicatorProps={{
                  style: {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FilterListIcon fontSize="small" />
                      <span>{`All (${mailboxes.length})`}</span>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Badge
                        badgeContent={activeMailboxCount}
                        color="success"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.7rem",
                            height: "18px",
                            minWidth: "18px",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PlayArrowIcon fontSize="small" />
                          <span>Active</span>
                        </Box>
                      </Badge>
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Badge
                        badgeContent={pausedMailboxCount}
                        color="warning"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.7rem",
                            height: "18px",
                            minWidth: "18px",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PauseIcon fontSize="small" />
                          <span>Paused</span>
                        </Box>
                      </Badge>
                    </Box>
                  }
                />
              </Tabs>
            </Paper>

            {loading ? (
              <Grid container spacing={3}>
                {renderSkeletons()}
              </Grid>
            ) : filteredMailboxes.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  px: 3,
                  borderRadius: 3,
                  bgcolor: theme.palette.background.paper,
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 3,
                    bgcolor: theme.palette.primary.light + "30",
                    color: theme.palette.primary.main,
                  }}
                >
                  <MarkEmailUnreadIcon sx={{ fontSize: 50 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  No mailboxes to display
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
                  {tabValue === 0
                    ? "You haven't added any mailboxes yet. Add your first mailbox to start warming up."
                    : tabValue === 1
                      ? "You don't have any active mailboxes. Start a warmup to see mailboxes here."
                      : "You don't have any paused mailboxes."}
                </Typography>
                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddMailbox}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: 3,
                      "&:hover": {
                        boxShadow: 5,
                      },
                    }}
                  >
                    Add Your First Mailbox
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {filteredMailboxes.map((mailbox, index) => {
                  // Get status color safely
                  const statusColor = getStatusColor(mailbox)

                  return (
                    <Grid item xs={12} md={isTablet ? 12 : 6} lg={4} key={mailbox.id || index}>
                      <Fade in={true} timeout={300 + index * 100}>
                        <Card
                          elevation={2}
                          sx={{
                            height: "100%",
                            borderRadius: 3,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-6px)",
                              boxShadow: 8,
                            },
                            position: "relative",
                            overflow: "visible",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "6px",
                              backgroundColor: theme.palette[statusColor]?.main || theme.palette.grey[400],
                              borderRadius: "3px 3px 0 0",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" mb={2.5}>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main + "15",
                                  color: theme.palette.primary.main,
                                  width: 56,
                                  height: 56,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                }}
                              >
                                <EmailIcon fontSize="large" />
                              </Avatar>
                              <Box ml={2} sx={{ overflow: "hidden" }}>
                                <Tooltip title={mailbox.email || ""} placement="top">
                                  <Typography
                                    variant="h6"
                                    noWrap
                                    sx={{
                                      maxWidth: "200px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {mailbox.email || "Email address unavailable"}
                                  </Typography>
                                </Tooltip>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {mailbox.first_name || ""} {mailbox.last_name || ""}
                                </Typography>
                              </Box>
                            </Box>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2.5,
                                p: 1.5,
                                backgroundColor: theme.palette[statusColor]?.light + "20" || theme.palette.grey[200],
                                borderRadius: 2,
                              }}
                            >
                              <BoltIcon
                                sx={{
                                  mr: 1,
                                  color: theme.palette[statusColor]?.main || theme.palette.grey[500],
                                }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                color={theme.palette[statusColor]?.main || theme.palette.grey[500]}
                              >
                                {getStatusText(mailbox)}
                              </Typography>
                            </Box>

                            <Box display="flex" gap={1} flexWrap="wrap" mb={2.5}>
                              {mailbox.type && (
                                <Tooltip title="Email Type">
                                  <Chip
                                    icon={<AlternateEmailIcon />}
                                    label={mailbox.type}
                                    variant="outlined"
                                    color="info"
                                    size="small"
                                    sx={{
                                      borderRadius: 1.5,
                                      "& .MuiChip-label": {
                                        px: 1,
                                      },
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {mailbox.email_per_day && (
                                <Tooltip title="Emails Per Day">
                                  <Chip
                                    label={`${mailbox.email_per_day} emails/day`}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    sx={{
                                      borderRadius: 1.5,
                                      "& .MuiChip-label": {
                                        px: 1,
                                      },
                                    }}
                                  />
                                </Tooltip>
                              )}
                              {mailbox.response_rate && (
                                <Tooltip title="Response Rate">
                                  <Chip
                                    label={`${mailbox.response_rate}% responses`}
                                    variant="outlined"
                                    color="success"
                                    size="small"
                                    sx={{
                                      borderRadius: 1.5,
                                      "& .MuiChip-label": {
                                        px: 1,
                                      },
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>

                            {mailbox.createdAt?.toDate && (
                              <Box
                                display="flex"
                                alignItems="center"
                                mb={2}
                                sx={{
                                  bgcolor: theme.palette.background.default,
                                  p: 1.5,
                                  borderRadius: 2,
                                }}
                              >
                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Created: {mailbox.createdAt.toDate().toLocaleDateString()}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>

                          <Divider sx={{ mx: 2 }} />

                          <CardActions sx={{ p: 2, justifyContent: "space-between" }}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewClick(mailbox.campaignID)}
                              size="small"
                              disabled={!mailbox.campaignID}
                              sx={{
                                borderRadius: 2,
                                boxShadow: 1,
                                "&:hover": {
                                  boxShadow: 2,
                                },
                              }}
                            >
                              View Stats
                            </Button>
                            <Box>
                              {!mailbox.warmup ? (
                                <Tooltip title="Start Warmup">
                                  <IconButton
                                    color="success"
                                    onClick={() =>
                                      handleWarmupAction({
                                        campaignID: mailbox.campaignID,
                                        action: "start",
                                      })
                                    }
                                    size="small"
                                    disabled={!mailbox.campaignID}
                                    sx={{
                                      bgcolor: theme.palette.success.light + "20",
                                      "&:hover": {
                                        bgcolor: theme.palette.success.light + "40",
                                      },
                                    }}
                                  >
                                    <PlayArrowIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : mailbox.warmup === false ? (
                                <Tooltip title="Resume Warmup">
                                  <IconButton
                                    color="info"
                                    onClick={() =>
                                      handleWarmupAction({
                                        campaignID: mailbox.campaignID,
                                        action: "resume",
                                      })
                                    }
                                    size="small"
                                    disabled={!mailbox.campaignID}
                                    sx={{
                                      bgcolor: theme.palette.info.light + "20",
                                      "&:hover": {
                                        bgcolor: theme.palette.info.light + "40",
                                      },
                                    }}
                                  >
                                    <RestartAltIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Pause Warmup">
                                  <IconButton
                                    color="warning"
                                    onClick={() =>
                                      handleWarmupAction({
                                        campaignID: mailbox.campaignID,
                                        action: "pause",
                                      })
                                    }
                                    size="small"
                                    disabled={!mailbox.campaignID}
                                    sx={{
                                      bgcolor: theme.palette.warning.light + "20",
                                      "&:hover": {
                                        bgcolor: theme.palette.warning.light + "40",
                                      },
                                    }}
                                  >
                                    <PauseIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </CardActions>
                        </Card>
                      </Fade>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              width: "100%",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

