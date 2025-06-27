import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  LinearProgress,
  Chip,
  useTheme,
  Skeleton,
  CircularProgress,
  Fade,
  Alert,
  IconButton,
  Divider,
  Badge,
  Stack,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useFirebase } from "../../firebase_context";
import { useNavigate, useParams } from "react-router-dom";
import { warmpupStats } from '../../api/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InsightsIcon from '@mui/icons-material/Insights';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReplyIcon from '@mui/icons-material/Reply';
import GradeIcon from '@mui/icons-material/Grade';

const EmailWarmupDashboard = () => {
  const { id } = useParams();
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const stats = await warmpupStats({
        campaignID: id
      });
      setRawData(stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  // Process data for charts
  const processedData = rawData?.metrics ? Object.entries(rawData.metrics)
    .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Sort by date
    .filter(([date]) => {
      if (timeRange === 'all') return true;
      
      const dayDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
      if (timeRange === 'week') return dayDiff < 7;
      if (timeRange === 'month') return dayDiff < 30;
      return true;
    })
    .map(([date, data]) => {
      const warmupTotal = data["Warm Up"].Total || 0;
      const warmupInbox = data["Warm Up"]["landed In"]?.inbox || 0;
      const warmupSpam = data["Warm Up"]["landed In"]?.spam || 0;
      const warmupTrash = data["Warm Up"]["landed In"]?.trash || 0;
      const warmupNotFound = data["Warm Up"]["landed In"]?.not_found_or_deleted || 0;
      const warmupOther = warmupTotal - (warmupInbox + warmupSpam + warmupTrash + warmupNotFound);
      
      const repliesTotal = data.Replies.Total || 0;
      const repliesInbox = data.Replies["landed In"]?.inbox || 0;
      const repliesSpam = data.Replies["landed In"]?.spam || 0;
      const repliesTrash = data.Replies["landed In"]?.trash || 0;
      const repliesNotFound = data.Replies["landed In"]?.not_found_or_deleted || 0;
      const repliesOther = repliesTotal - (repliesInbox + repliesSpam + repliesTrash + repliesNotFound);
      
      const inboxRate = warmupTotal > 0 ? (warmupInbox / warmupTotal) * 100 : 0;
      
      return {
        date: date.substring(5), // Remove year for cleaner display
        fullDate: date,
        warmupTotal,
        warmupInbox,
        warmupSpam,
        warmupTrash,
        warmupNotFound,
        warmupOther,
        repliesTotal,
        repliesInbox,
        repliesSpam,
        repliesTrash,
        repliesNotFound,
        repliesOther,
        inboxRate: inboxRate.toFixed(1)
      };
    }) : [];
  
  // Calculate totals and averages
  const totalStats = processedData.reduce((acc, day) => {
    acc.totalWarmupEmails += day.warmupTotal;
    acc.totalWarmupInbox += day.warmupInbox;
    acc.totalReplies += day.repliesTotal;
    acc.totalRepliesInbox += day.repliesInbox;
    return acc;
  }, { 
    totalWarmupEmails: 0, 
    totalWarmupInbox: 0, 
    totalReplies: 0, 
    totalRepliesInbox: 0 
  });
  
  const avgInboxRate = totalStats.totalWarmupEmails > 0 
    ? ((totalStats.totalWarmupInbox / totalStats.totalWarmupEmails) * 100).toFixed(1)
    : 0;
    
  const replyRate = totalStats.totalWarmupEmails > 0 
    ? ((totalStats.totalReplies / totalStats.totalWarmupEmails) * 100).toFixed(1)
    : 0;
  
  const healthScore = rawData?.health_score || rawData?.healthScore || [];
  const domainAgeYears = healthScore.domain_age ? Math.floor(healthScore.domain_age / 365) : 0;

  // Get the color based on inbox rate
  const getInboxRateColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 90) return theme.palette.success.main;
    if (numRate >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Status indicator component
  const StatusIndicator = ({ status }) => {
    const getColor = () => {
      if (status === 'valid') return theme.palette.success.main;
      if (status === 'invalid') return theme.palette.error.main;
      return theme.palette.warning.main;
    };
    
    const getIcon = () => {
      if (status === 'valid') return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      if (status === 'invalid') return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
    };
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {getIcon()}
        <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
          {status}
        </Typography>
      </Box>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} />
        <Typography variant="h5" gutterBottom align="center">
          Loading Dashboard Data
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Please wait while we fetch your email warmup statistics
        </Typography>
        <Box sx={{ width: '100%', mt: 6 }}>
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2, borderRadius: 1 }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ mt: 4, borderRadius: 1 }} />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <IconButton color="inherit" size="small" onClick={fetchData}>
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ fontSize: 60, color: theme.palette.error.main, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Unable to Load Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            There was a problem loading your email warmup data. Please try refreshing the page or try again later.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: '#f5f5f5' }}>
      {/* Header with Refresh Button */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Email Warmup Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Campaign Performance Metrics
          </Typography>
        </Box>
        <IconButton 
          color="primary" 
          onClick={fetchData} 
          disabled={refreshing}
          sx={{ 
            bgcolor: 'white', 
            boxShadow: 1, 
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
          }}
        >
          {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      {/* Time Range Filter */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
        >
          <ToggleButton value="week" aria-label="last week">
            Last 7 Days
          </ToggleButton>
          <ToggleButton value="month" aria-label="last month">
            Last 30 Days
          </ToggleButton>
          <ToggleButton value="all" aria-label="all time">
            All Time
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                Campaign ID
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              {rawData ? rawData.campaignID : '-'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GradeIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                Health Grade
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'medium',
                  color: healthScore?.grade === 'A' ? theme.palette.success.main : 
                         healthScore?.grade === 'B' ? theme.palette.warning.main : 
                         theme.palette.error.main
                }}
              >
                {healthScore?.grade ? healthScore.grade : '-'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MarkEmailReadIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                Inbox Rate
              </Typography>
            </Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'medium',
                color: getInboxRateColor(avgInboxRate)
              }}
            >
              {avgInboxRate}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ReplyIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                Reply Rate
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              {replyRate}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Authentication Cards */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <InsightsIcon sx={{ mr: 1 }} />
          Email Authentication Status
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                  SPF
                </Typography>
                <StatusIndicator status={healthScore.spf || 'unknown'} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Sender Policy Framework
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                  DMARC
                </Typography>
                <StatusIndicator status={healthScore.dmarc || 'unknown'} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Domain Message Authentication
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                  MX
                </Typography>
                <StatusIndicator status={healthScore.mx || 'unknown'} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Mail Exchange Records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" gutterBottom>
                  Domain Age
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRangeIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                  <Typography variant="body1">
                    {domainAgeYears} years
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Affects sender reputation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Material UI Tabs */}
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            textColor="primary" 
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'medium',
                py: 2
              }
            }}
          >
            <Tab 
              label="Overview" 
              icon={<AssessmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Warm Up Details" 
              icon={<MailOutlineIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Replies Details" 
              icon={<ReplyIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 3 }}>
          {/* Overview Tab Panel */}
          {activeTab === 0 && (
            <Fade in={activeTab === 0}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Daily Overview
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, mb: 6 }}>
                  <Box sx={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#9e9e9e" />
                        <YAxis yAxisId="left" stroke="#9e9e9e" />
                        <YAxis yAxisId="right" orientation="right" stroke="#9e9e9e" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            border: 'none'
                          }} 
                          labelFormatter={(value) => `Date: ${value}`}
                          formatter={(value, name) => {
                            const formattedValue = [value];
                            let displayName = name;
                            
                            switch(name) {
                              case 'warmupTotal':
                                displayName = 'Warm Up Emails';
                                break;
                              case 'warmupInbox':
                                displayName = 'Inbox (Warm Up)';
                                break;
                              case 'repliesTotal':
                                displayName = 'Replies';
                                break;
                              default:
                                break;
                            }
                            
                            return [formattedValue, displayName];
                          }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="warmupTotal" 
                          name="Warm Up Emails" 
                          stroke={theme.palette.primary.main} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationDuration={1500}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="warmupInbox" 
                          name="Inbox (Warm Up)" 
                          stroke={theme.palette.success.main} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationDuration={1500}
                          animationBegin={300}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="repliesTotal" 
                          name="Replies" 
                          stroke={theme.palette.warning.main} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationDuration={1500}
                          animationBegin={600}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InsightsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Inbox Placement Rate
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#9e9e9e" />
                        <YAxis domain={[0, 100]} stroke="#9e9e9e" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            border: 'none'
                          }} 
                          formatter={(value) => [`${value}%`, 'Inbox Rate']}
                          labelFormatter={(value) => `Date: ${value}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="inboxRate" 
                          name="Inbox Rate (%)" 
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              
                {/* Summary Statistics Cards */}
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Summary Statistics
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary" gutterBottom>
                            Total Warm Up Emails
                          </Typography>
                          <Typography variant="h5" fontWeight="medium" sx={{ color: theme.palette.primary.main }}>
                            {totalStats.totalWarmupEmails}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mt: 1,
                              bgcolor: theme.palette.primary.light + '40'
                            }} 
                            color="primary"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary" gutterBottom>
                            Total Inbox Placement
                          </Typography>
                          <Typography variant="h5" fontWeight="medium" sx={{ color: theme.palette.success.main }}>
                            {totalStats.totalWarmupInbox}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(totalStats.totalWarmupInbox / totalStats.totalWarmupEmails) * 100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mt: 1,
                              bgcolor: theme.palette.success.light + '40'
                            }} 
                            color="success"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary" gutterBottom>
                            Total Replies
                          </Typography>
                          <Typography variant="h5" fontWeight="medium" sx={{ color: theme.palette.warning.main }}>
                            {totalStats.totalReplies}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(totalStats.totalReplies / totalStats.totalWarmupEmails) * 100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mt: 1,
                              bgcolor: theme.palette.warning.light + '40'
                            }} 
                            color="warning"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="overline" color="text.secondary" gutterBottom>
                            Campaign Duration
                          </Typography>
                          <Typography variant="h5" fontWeight="medium" sx={{ color: theme.palette.info.main }}>
                            {processedData.length} days
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              mt: 1,
                              bgcolor: theme.palette.info.light + '40'
                            }} 
                            color="info"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Fade>
          )}
          
          {/* Warmup Tab Panel */}
          {activeTab === 1 && (
            <Fade in={activeTab === 1}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <MailOutlineIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Warm Up Email Breakdown
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#9e9e9e" />
                        <YAxis stroke="#9e9e9e" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            border: 'none'
                          }}
                          formatter={(value, name) => {
                            const displayNames = {
                              warmupInbox: 'Inbox',
                              warmupSpam: 'Spam',
                              warmupTrash: 'Trash',
                              warmupNotFound: 'Not Found/Deleted',
                              warmupOther: 'Other'
                            };
                            return [value, displayNames[name] || name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="warmupInbox" name="Inbox" stackId="a" fill={theme.palette.success.main} animationDuration={1500} />
                        <Bar dataKey="warmupSpam" name="Spam" stackId="a" fill={theme.palette.error.main} animationDuration={1500} animationBegin={300} />
                        <Bar dataKey="warmupTrash" name="Trash" stackId="a" fill="#9e9e9e" animationDuration={1500} animationBegin={400} />
                        <Bar dataKey="warmupNotFound" name="Not Found/Deleted" stackId="a" fill={theme.palette.warning.main} animationDuration={1500} animationBegin={500} />
                        <Bar dataKey="warmupOther" name="Other" stackId="a" fill={theme.palette.secondary.main} animationDuration={1500} animationBegin={600} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InsightsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Warm Up Statistics
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Badge badgeContent={totalStats.totalWarmupEmails} color="primary" max={999}>
                            <EmailIcon color="action" />
                          </Badge>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Total Sent
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {totalStats.totalWarmupEmails}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Total warm up emails sent during campaign
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Badge badgeContent={totalStats.totalWarmupInbox} color="success" max={999}>
                            <MarkEmailReadIcon color="action" />
                          </Badge>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Inbox Placement
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {totalStats.totalWarmupInbox}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(avgInboxRate)} 
                            sx={{ height: 8, borderRadius: 5, flexGrow: 1, mr: 1 }}
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {avgInboxRate}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MailOutlineIcon color="primary" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Avg. Daily Send
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {processedData.length > 0 ? (totalStats.totalWarmupEmails / processedData.length).toFixed(1) : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Average emails sent per day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`${avgInboxRate}%`} 
                            color={parseFloat(avgInboxRate) >= 90 ? "success" : parseFloat(avgInboxRate) >= 70 ? "warning" : "error"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Inbox Rate
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium" sx={{ color: getInboxRateColor(avgInboxRate) }}>
                          {avgInboxRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Percentage of emails landing in inbox
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
          
          {/* Replies Tab Panel */}
          {activeTab === 2 && (
            <Fade in={activeTab === 2}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ReplyIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Replies Breakdown
                  </Typography>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" stroke="#9e9e9e" />
                        <YAxis stroke="#9e9e9e" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                            border: 'none'
                          }}
                          formatter={(value, name) => {
                            const displayNames = {
                              repliesInbox: 'Inbox',
                              repliesSpam: 'Spam',
                              repliesTrash: 'Trash',
                              repliesNotFound: 'Not Found/Deleted',
                              repliesOther: 'Other'
                            };
                            return [value, displayNames[name] || name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="repliesInbox" name="Inbox" stackId="a" fill={theme.palette.success.main} animationDuration={1500} />
                        <Bar dataKey="repliesSpam" name="Spam" stackId="a" fill={theme.palette.error.main} animationDuration={1500} animationBegin={300} />
                        <Bar dataKey="repliesTrash" name="Trash" stackId="a" fill="#9e9e9e" animationDuration={1500} animationBegin={400} />
                        <Bar dataKey="repliesNotFound" name="Not Found/Deleted" stackId="a" fill={theme.palette.warning.main} animationDuration={1500} animationBegin={500} />
                        <Bar dataKey="repliesOther" name="Other" stackId="a" fill={theme.palette.secondary.main} animationDuration={1500} animationBegin={600} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Reply Statistics
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Badge badgeContent={totalStats.totalReplies} color="warning" max={999}>
                            <ReplyIcon color="action" />
                          </Badge>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Total Replies
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {totalStats.totalReplies}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Total replies received during campaign
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Badge badgeContent={totalStats.totalRepliesInbox} color="success" max={999}>
                            <MarkEmailReadIcon color="action" />
                          </Badge>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Replies to Inbox
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {totalStats.totalRepliesInbox}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={totalStats.totalReplies > 0 ? (totalStats.totalRepliesInbox / totalStats.totalReplies) * 100 : 0} 
                            sx={{ height: 8, borderRadius: 5, flexGrow: 1, mr: 1 }}
                            color="success"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {totalStats.totalReplies > 0 ? ((totalStats.totalRepliesInbox / totalStats.totalReplies) * 100).toFixed(1) : 0}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ReplyIcon color="primary" />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            Avg. Daily Replies
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {processedData.length > 0 ? (totalStats.totalReplies / processedData.length).toFixed(1) : 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Average replies received per day
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 1 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Chip 
                            label={`${replyRate}%`} 
                            color={parseFloat(replyRate) >= 20 ? "success" : parseFloat(replyRate) >= 10 ? "warning" : "primary"}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Reply Rate
                          </Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="medium">
                          {replyRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Percentage of emails receiving replies
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>
      
      {/* Data Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Daily Data Table
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {processedData.length} days of data
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Warm Up Sent</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Inbox Placement</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Inbox Rate</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Replies</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedData.map((day, idx) => (
                <TableRow 
                  key={idx} 
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell>{day.fullDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={day.warmupTotal}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={day.warmupInbox}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '60%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={parseFloat(day.inboxRate)} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 5,
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getInboxRateColor(day.inboxRate)
                            }
                          }}
                        />
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium',
                          color: getInboxRateColor(day.inboxRate)
                        }}
                      >
                        {day.inboxRate}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={day.repliesTotal}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default EmailWarmupDashboard;
