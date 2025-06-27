"use client"

import React, { useState } from "react"
import {
  Box,
  TextField,
  Chip,
  IconButton,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Grid2,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  Checkbox,
  Snackbar,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  Tooltip,
  Container,
  Stack,
  Badge,
  Collapse,
  Fade,
  LinearProgress,
} from "@mui/material"
import {
  Add,
  Close,
  Search,
  Download,
  FilterList,
  LinkedIn,
  FilterAlt,
  Email,
  Business,
  Person,
  LocationOn,
  Save,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Info,
} from "@mui/icons-material"
import axios from "axios"
import { useFirebase } from "../../firebase_context";




const theme = {
  primary: "#7C3AED",       // Royal Purple
  secondary: "#FBBF24",     // Gold
  success: "#10B981",       // Jade Green
  info: "#60A5FA",          // Refined Blue
  warning: "#F59E0B",       // Warm Gold
  error: "#DC2626",         // Deep Red
  background: {
    default: "#FAF5FF",     // Off-white Lilac
    paper: "#FFFFFF",
  },
  text: {
    primary: "#1E1B4B",     // Deep Navy
    secondary: "#6B7280",   // Soft Gray
  },
}

const InputArray = ({ label, value, onChange, icon }) => {
  const [input, setInput] = useState("")

  const addItem = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInput("")
    }
  }

  const removeItem = (item) => {
    onChange(value.filter((v) => v !== item))
  }

  return (
    <Box mb={2}>
      <Typography
        variant="subtitle2"
        gutterBottom
        fontWeight={600}
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
      >
        {icon && React.cloneElement(icon, { fontSize: "small", sx: { color: theme.text.secondary } })}
        {label}
      </Typography>
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder={`Add ${label.toLowerCase()}`}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            },
          }}
          InputProps={{
            startAdornment: icon && (
              <InputAdornment position="start">
                {React.cloneElement(icon, { fontSize: "small", sx: { color: theme.text.secondary } })}
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={addItem}
          sx={{
            minWidth: "40px",
            width: "40px",
            height: "40px",
            p: 0,
            bgcolor: theme.primary,
            borderRadius: "10px",
            boxShadow: "0 4px 14px 0 rgba(85, 105, 255, 0.2)",
            "&:hover": {
              bgcolor: "#4559e9",
              boxShadow: "0 6px 20px 0 rgba(85, 105, 255, 0.3)",
            },
          }}
        >
          <Add />
        </Button>
      </Box>
      <Box mt={1} display="flex" flexWrap="wrap" gap={0.8}>
        {value.map((item, idx) => (
          <Chip
            key={idx}
            label={item}
            onDelete={() => removeItem(item)}
            deleteIcon={<Close fontSize="small" />}
            sx={{
              bgcolor: "rgba(85, 105, 255, 0.08)",
              color: theme.primary,
              borderRadius: "8px",
              fontWeight: 500,
              "& .MuiChip-deleteIcon": {
                color: theme.primary,
                "&:hover": {
                  color: theme.error,
                },
              },
            }}
            size="small"
          />
        ))}
      </Box>
    </Box>
  )
}

const ProspectSearch = () => {
  const [formData, setFormData] = useState({
    positions: [],
    locations: [],
    keywords: [],
    person_seniorities: [],
    person_locations: [],
    include_similar_titles: true,
    q_organization_domains_list: [],
    organization_num_employees_ranges: [],
    page: 1,
    per_page: 20,
  })

  const [leads, setLeads] = useState([])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(100)
  const [numLeads, setNumLeads] = useState(10)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [leadName, setLeadName] = useState(null)
  const { user } = useFirebase();
  const [savingProgress, setSavingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await axios.post("https://us-central1-mailex-cfa6e.cloudfunctions.net/getProspects", formData)
      setLeads(res.data)
      setSearchPerformed(true)
      // If your API returns total pages info, you could set it here
      // setTotalPages(res.data.total_pages || 100);

      // Clear selected leads when performing a new search
      setSelectedLeads([])
    } catch (err) {
      console.error("API error:", err)
      setLeads([])
      setError("Failed to fetch prospects. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (event, value) => {
    updateField("page", value)
    // Using setTimeout to ensure state updates before API call
    setTimeout(() => handleSearch(), 100)
  }

  const handleLeadSelection = (leadId, checked) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId])
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId))
    }
  }

  const handleSelectAllLeads = (event) => {
    if (event.target.checked) {
      // Select all leads on the current page
      const allLeadIds = leads.map((lead) => lead.id || leads.indexOf(lead))
      setSelectedLeads(allLeadIds)
    } else {
      // Deselect all
      setSelectedLeads([])
    }
  }

  const handleExport = () => {
    try {
      // Get the leads that match selected IDs
      const exportData = selectedLeads
        .map((id) => {
          // Find by id or index depending on how we stored it
          return leads.find((lead, index) => (lead.id !== undefined ? lead.id === id : index === id))
        })
        .filter(Boolean) // Remove any undefined entries

      if (exportData.length === 0) {
        setError("No valid leads selected for export")
        return
      }

      // Get all field names from the first lead
      const fields = Object.keys(exportData[0])

      // Create CSV header row with field names
      const csvHeader = fields.map((field) => `"${field}"`).join(",")

      // Create CSV data rows
      const csvRows = exportData
        .map((lead) => {
          return fields
            .map((field) => {
              // Handle null/undefined values and escape quotes in strings
              const value = lead[field] === null || lead[field] === undefined ? "" : lead[field]
              const valueStr = String(value).replace(/"/g, '""')
              return `"${valueStr}"`
            })
            .join(",")
        })
        .join("\n")

      // Combine header and rows
      const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows}`

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link) // Required for Firefox
      link.click()
      document.body.removeChild(link) // Clean up

      setSuccessMessage(`Successfully exported ${exportData.length} leads`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Export error:", err)
      setError("Failed to export leads. Please try again.")
    }
  }
  
  const handleSaveToDatabase = async () => {
    const url = "https://us-central1-mailex-cfa6e.cloudfunctions.net/saveLeads";
    if (!leadName || numLeads === 0) {
      setError("Please select a lead name and select at least one lead to save");
      return;
    }

    const userid = user.uid;
    const lead_name = leadName;

    const {
      positions,
      locations,
      keywords,
      person_seniorities,
      person_locations,
      include_similar_titles,
      q_organization_domains_list,
      organization_num_employees_ranges,
    } = formData;

    const requestBody = {
      userid,
      numLeads,
      lead_name,
      ...(positions.length > 0 && { positions }),
      ...(locations.length > 0 && { locations }),
      ...(keywords.length > 0 && { keywords }),
      ...(person_seniorities.length > 0 && { person_seniorities }),
      ...(person_locations.length > 0 && { person_locations }),
      ...(typeof include_similar_titles !== "undefined" && { include_similar_titles }),
      ...(q_organization_domains_list.length > 0 && { q_organization_domains_list }),
      ...(organization_num_employees_ranges.length > 0 && { organization_num_employees_ranges }),
    };

    try {
      // Start the saving process
      setIsSaving(true);
      setSavingProgress(0);
      
      // Setup progress simulation
      const totalTime = numLeads * 2000; // 2 seconds per lead
      const updateInterval = 100; // Update progress every 100ms
      const progressIncrement = 100 / (totalTime / updateInterval);
      
      let currentProgress = 0;
      const progressTimer = setInterval(() => {
        currentProgress += progressIncrement;
        if (currentProgress > 95) {
          currentProgress = 95; // Cap at 95% until we get response
          clearInterval(progressTimer);
        }
        setSavingProgress(currentProgress);
      }, updateInterval);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Clear the interval and set to 100% when done
      clearInterval(progressTimer);
      setSavingProgress(100);
      
      // Show success or error message
      if (response.ok && data.success) {
        setSuccessMessage(`Leads saved successfully: ${data.totalFetched} leads saved`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log(data.error);
        setError(data.error);
        setTimeout(() => setError(null), 5000);
      }
      
      // After a short delay to show 100% completion, hide the progress bar
      setTimeout(() => {
        setIsSaving(false);
        setSavingProgress(0);
      }, 1000);
      
    } catch (error) {
      setError(`Error saving leads: ${error.message || "Unknown error"}`);
      setTimeout(() => setError(null), 5000);
      setIsSaving(false);
      setSavingProgress(0);
    }
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen)
  }

  const hasActiveFilters = () => {
    return Object.entries(formData).some(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        return true
      }
      if (key === "include_similar_titles" && value === false) {
        return true
      }
      return false
    })
  }

  const activeFilterCount = () => {
    let count = 0
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        count += value.length
      }
      if (key === "include_similar_titles" && value === false) {
        count += 1
      }
    })
    return count
  }

  return (
    <Box sx={{ bgcolor: theme.background.default, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h4"
            fontWeight="bold"
            color={theme.text.primary}
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: "0",
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                backgroundColor: theme.primary,
              },
            }}
          >
            Prospect Search
          </Typography>
          <Box>
            {selectedLeads.length > 0 && (
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExport}
                sx={{
                  bgcolor: theme.primary,
                  borderRadius: "10px",
                  boxShadow: "0 4px 14px 0 rgba(85, 105, 255, 0.2)",
                  mr: 2,
                  "&:hover": {
                    bgcolor: "#4559e9",
                    boxShadow: "0 6px 20px 0 rgba(85, 105, 255, 0.3)",
                  },
                }}
              >
                Export {selectedLeads.length} Selected
              </Button>
            )}
            <Button
              variant={filtersOpen ? "contained" : "outlined"}
              startIcon={<FilterAlt />}
              onClick={toggleFilters}
              sx={{
                borderRadius: "10px",
                ...(filtersOpen
                  ? {
                    bgcolor: "rgba(85, 105, 255, 0.1)",
                    color: theme.primary,
                    border: "none",
                    "&:hover": {
                      bgcolor: "rgba(85, 105, 255, 0.2)",
                      border: "none",
                    },
                  }
                  : {
                    borderColor: theme.primary,
                    color: theme.primary,
                    "&:hover": {
                      bgcolor: "rgba(85, 105, 255, 0.05)",
                    },
                  }),
              }}
              endIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
            >
              {filtersOpen ? "Hide Filters" : "Show Filters"}
              {hasActiveFilters() && (
                <Badge
                  badgeContent={activeFilterCount()}
                  color="primary"
                  sx={{
                    ml: 1,
                    "& .MuiBadge-badge": {
                      bgcolor: theme.primary,
                      color: "white",
                      fontWeight: "bold",
                    },
                  }}
                />
              )}
            </Button>
          </Box>
        </Box>

        {/* Progress Bar for Saving */}
        {isSaving && (
          <Box mb={3} sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" color={theme.text.secondary} sx={{ mr: 1, fontWeight: 500 }}>
                Saving leads to database...
              </Typography>
              <Typography variant="body2" color={theme.primary} sx={{ fontWeight: 600 }}>
                {Math.round(savingProgress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={savingProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: theme.success,
                  borderRadius: 4,
                }
              }} 
            />
          </Box>
        )}
       
        {successMessage && (
          <Snackbar
            open={!!successMessage}
            autoHideDuration={4000}
            onClose={() => setSuccessMessage(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            TransitionComponent={Fade}
          >
            <Alert
              onClose={() => setSuccessMessage(null)}
              severity="success"
              icon={<CheckCircle />}
              sx={{
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                bgcolor: theme.success, // solid success color
                color: "#fff",
                "& .MuiAlert-icon": {
                  color: "#fff",
                },
              }}
            >
              {successMessage}
            </Alert>
          </Snackbar>
        )}

        {/* Error Message */}
        {error && (
          <Snackbar
            open={!!error}
            autoHideDuration={4000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            TransitionComponent={Fade}
          >
            <Alert
              onClose={() => setError(null)}
              severity="error"
              sx={{
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                bgcolor: theme.error, // solid error color
                color: "#fff",
                "& .MuiAlert-icon": {
                  color: "#fff",
                },
              }}
            >
              {error}
            </Alert>
          </Snackbar>
        )}
        {/* Search Form */}
        <Collapse in={filtersOpen}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: "16px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              overflow: "visible",
              position: "relative",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                mb={3}
                color={theme.text.primary}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <FilterList sx={{ color: theme.primary }} />
                Search Filters
                {hasActiveFilters() && (
                  <Chip
                    label={`${activeFilterCount()} active`}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: "rgba(85, 105, 255, 0.08)",
                      color: theme.primary,
                      fontWeight: 500,
                    }}
                  />
                )}
              </Typography>

              <Grid2 container spacing={3}>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Positions"
                    value={formData.positions}
                    onChange={(val) => updateField("positions", val)}
                    icon={<Person />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Organization Locations"
                    value={formData.locations}
                    onChange={(val) => updateField("locations", val)}
                    icon={<LocationOn />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Keywords"
                    value={formData.keywords}
                    onChange={(val) => updateField("keywords", val)}
                    icon={<Search />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Seniorities"
                    value={formData.person_seniorities}
                    onChange={(val) => updateField("person_seniorities", val)}
                    icon={<Person />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Person Locations"
                    value={formData.person_locations}
                    onChange={(val) => updateField("person_locations", val)}
                    icon={<LocationOn />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Org Domains"
                    value={formData.q_organization_domains_list}
                    onChange={(val) => updateField("q_organization_domains_list", val)}
                    icon={<Business />}
                  />
                </Grid2>
                <Grid2 item xs={12} md={6}>
                  <InputArray
                    label="Employee Ranges"
                    value={formData.organization_num_employees_ranges}
                    onChange={(val) => updateField("organization_num_employees_ranges", val)}
                    icon={<Business />}
                  />
                </Grid2>
              </Grid2>

              <Divider sx={{ my: 3, opacity: 0.6 }} />

              <Box
                mt={1}
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
                justifyContent="space-between"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.include_similar_titles}
                      onChange={(e) => updateField("include_similar_titles", e.target.checked)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: theme.primary,
                          "&:hover": {
                            backgroundColor: "rgba(85, 105, 255, 0.08)",
                          },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: theme.primary,
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        Include Similar Titles
                      </Typography>
                      <Tooltip title="When enabled, the search will include similar job titles to the ones you specified">
                        <Info fontSize="small" sx={{ color: theme.text.secondary, fontSize: "16px" }} />
                      </Tooltip>
                    </Box>
                  }
                />
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{
                    bgcolor: theme.primary,
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px 0 rgba(85, 105, 255, 0.2)",
                    px: 4,
                    py: 1,
                    "&:hover": {
                      bgcolor: "#4559e9",
                      boxShadow: "0 6px 20px 0 rgba(85, 105, 255, 0.3)",
                    },
                  }}
                >
                  {loading ? "Searching..." : "Search Prospects"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Loading indicator for initial search */}
        {loading && leads.length === 0 && (
          <Box mt={8} mb={8} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <CircularProgress size={50} sx={{ color: theme.primary, mb: 2 }} />
            <Typography variant="body1" color={theme.text.secondary}>
              Searching for prospects...
            </Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && leads.length === 0 && searchPerformed && (
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              p: 4,
              textAlign: "center",
            }}
          >
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <Search sx={{ fontSize: 60, color: "rgba(85, 105, 255, 0.2)", mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" color={theme.text.primary} gutterBottom>
                No prospects found
              </Typography>
              <Typography variant="body1" color={theme.text.secondary} sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
                Try adjusting your search filters or adding more keywords to find relevant prospects.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setFiltersOpen(true)}
                sx={{
                  borderRadius: "10px",
                  borderColor: theme.primary,
                  color: theme.primary,
                  "&:hover": {
                    bgcolor: "rgba(85, 105, 255, 0.05)",
                  },
                }}
              >
                Modify Search
              </Button>
            </Box>
          </Card>
        )}

        {/* Results */}
        {leads.length > 0 && (
          <Box>
            {/* Results Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={theme.text.primary}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Person sx={{ color: theme.primary }} />
                  Prospects
                  <Chip
                    label={`${leads.length} found`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(85, 105, 255, 0.08)",
                      color: theme.primary,
                      fontWeight: 500,
                    }}
                  />
                </Typography>

                {selectedLeads.length > 0 && (
                  <Chip
                    label={`${selectedLeads.length} selected`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(51, 200, 99, 0.1)",
                      color: theme.success,
                      fontWeight: 500,
                    }}
                  />
                )}
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                width={{ xs: "100%", sm: "auto" }}
              >
                <TextField
                  type="number"
                  label="Number of Leads"
                  value={numLeads}
                  onChange={(e) => setNumLeads(Number(e.target.value))}
                  variant="outlined"
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: "120px" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />
                <TextField
                  type="text"
                  label="List Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: "120px" },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.primary,
                      },
                    },
                  }}
                />

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveToDatabase}
                  disabled={loading}
                  sx={{
                    bgcolor: theme.success,
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px 0 rgba(51, 200, 99, 0.2)",
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      bgcolor: "#2ba757",
                      boxShadow: "0 6px 20px 0 rgba(51, 200, 99, 0.3)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "rgba(51, 200, 99, 0.3)",
                      color: "white",
                    },
                  }}
                >
                  {"Save to Database"}
                </Button>
              </Stack>
            </Box>

            {/* Results Table */}
            <Card
              elevation={0}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              }}
            >
              <TableContainer>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(85, 105, 255, 0.04)" }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedLeads.length > 0 && selectedLeads.length < leads.length}
                          checked={leads.length > 0 && selectedLeads.length === leads.length}
                          onChange={handleSelectAllLeads}
                          sx={{
                            color: theme.primary,
                            "&.Mui-checked": {
                              color: theme.primary,
                            },
                            "&.MuiCheckbox-indeterminate": {
                              color: theme.primary,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Company</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: theme.text.primary }}>LinkedIn</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                          <CircularProgress size={30} sx={{ color: theme.primary }} />
                          <Typography variant="body2" sx={{ mt: 1, color: theme.text.secondary }}>
                            Loading prospects...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      leads.map((person, index) => {
                        // Use person.id if available, otherwise fall back to index
                        const id = person.id || index
                        return (
                          <TableRow
                            key={id}
                            sx={{
                              "&:hover": {
                                bgcolor: "rgba(85, 105, 255, 0.02)",
                              },
                              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                              ...(selectedLeads.includes(id) && {
                                bgcolor: "rgba(85, 105, 255, 0.04)",
                              }),
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedLeads.includes(id)}
                                onChange={(event) => handleLeadSelection(id, event.target.checked)}
                                sx={{
                                  color: theme.primary,
                                  "&.Mui-checked": {
                                    color: theme.primary,
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color={theme.text.primary}>
                                {person.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={theme.text.secondary}>
                                {person.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Email fontSize="small" sx={{ mr: 0.8, color: theme.primary, fontSize: "16px" }} />
                                <Typography variant="body2" color={theme.text.primary}>
                                  {person.email}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Business fontSize="small" sx={{ mr: 0.8, color: theme.primary, fontSize: "16px" }} />
                                <Typography variant="body2" color={theme.text.primary}>
                                  {person.organization_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <LocationOn fontSize="small" sx={{ mr: 0.8, color: theme.primary, fontSize: "16px" }} />
                                <Typography variant="body2" color={theme.text.primary}>
                                  {person.city}
                                  {person.city && person.country ? ", " : ""}
                                  {person.country}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View LinkedIn Profile">
                                <IconButton
                                  size="small"
                                  href={person.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    color: "#0072b1",
                                    "&:hover": {
                                      bgcolor: "rgba(0, 114, 177, 0.1)",
                                    },
                                  }}
                                >
                                  <LinkedIn />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="rgba(85, 105, 255, 0.02)"
                borderTop="1px solid rgba(0, 0, 0, 0.06)"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <Typography variant="body2" color={theme.text.secondary}>
                  Showing {leads.length} prospects on page {formData.page}
                </Typography>

                <Box display="flex" alignItems="center">
                  {loading && <CircularProgress size={20} sx={{ mr: 2, color: theme.primary }} />}
                  <Pagination
                    count={totalPages}
                    page={formData.page}
                    onChange={handlePageChange}
                    color="primary"
                    disabled={loading}
                    siblingCount={1}
                    size="medium"
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "8px",
                      },
                      "& .Mui-selected": {
                        bgcolor: theme.primary,
                        color: "white",
                        "&:hover": {
                          bgcolor: "#4559e9",
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default ProspectSearch

