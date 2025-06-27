"use client"

import { useFirebase } from "../../firebase_context"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Stepper,
  Step,
  FormControlLabel,
  Checkbox,
  StepLabel,
  Paper,
  useTheme,
  alpha,
  styled,
  CircularProgress,
  Fade,
  Zoom,
  ThemeProvider,
  createTheme,
  CssBaseline,
  LinearProgress,
  Avatar,
  Tooltip,
  Badge,
  InputAdornment,
  Backdrop,
  useMediaQuery,
} from "@mui/material"

// Icons
import DeleteIcon from "@mui/icons-material/Delete"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import EmailIcon from "@mui/icons-material/Email"
import BusinessIcon from "@mui/icons-material/Business"
import GroupIcon from "@mui/icons-material/Group"
import HandshakeIcon from "@mui/icons-material/Handshake"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import LockIcon from "@mui/icons-material/Lock"
import PersonIcon from "@mui/icons-material/Person"
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"
import CampaignIcon from "@mui/icons-material/Campaign"
import CheckIcon from "@mui/icons-material/Check"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import SettingsIcon from "@mui/icons-material/Settings"
import DashboardIcon from "@mui/icons-material/Dashboard"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"

import { createcampaign } from "../../api/api"

// Create a custom theme for a premium SaaS look
const saasTheme = createTheme({
  palette: {
    primary: {
      main: "#4361ee",
      light: "#738eef",
      dark: "#2f3fd1",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7209b7",
      light: "#9d3fd3",
      dark: "#5a078f",
      contrastText: "#ffffff",
    },
    success: {
      main: "#10b981",
      light: "#3fc79a",
      dark: "#0b8a61",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f26d6d",
      dark: "#d03333",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f59e0b",
      light: "#f7b23b",
      dark: "#d18808",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3b82f6",
      light: "#669df8",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.05)",
    "0px 8px 16px rgba(0, 0, 0, 0.05)",
    "0px 12px 24px rgba(0, 0, 0, 0.05)",
    "0px 16px 32px rgba(0, 0, 0, 0.05)",
    "0px 20px 40px rgba(0, 0, 0, 0.05)",
    "0px 24px 48px rgba(0, 0, 0, 0.05)",
    "0px 28px 56px rgba(0, 0, 0, 0.05)",
    "0px 32px 64px rgba(0, 0, 0, 0.05)",
    "0px 36px 72px rgba(0, 0, 0, 0.05)",
    "0px 40px 80px rgba(0, 0, 0, 0.05)",
    "0px 44px 88px rgba(0, 0, 0, 0.05)",
    "0px 48px 96px rgba(0, 0, 0, 0.05)",
    "0px 52px 104px rgba(0, 0, 0, 0.05)",
    "0px 56px 112px rgba(0, 0, 0, 0.05)",
    "0px 60px 120px rgba(0, 0, 0, 0.05)",
    "0px 64px 128px rgba(0, 0, 0, 0.05)",
    "0px 68px 136px rgba(0, 0, 0, 0.05)",
    "0px 72px 144px rgba(0, 0, 0, 0.05)",
    "0px 76px 152px rgba(0, 0, 0, 0.05)",
    "0px 80px 160px rgba(0, 0, 0, 0.05)",
    "0px 84px 168px rgba(0, 0, 0, 0.05)",
    "0px 88px 176px rgba(0, 0, 0, 0.05)",
    "0px 92px 184px rgba(0, 0, 0, 0.05)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.1)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(90deg, #4361ee 0%, #3a56d4 100%)",
        },
        containedSecondary: {
          background: "linear-gradient(90deg, #7209b7 0%, #5c07a2 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
          overflow: "visible",
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
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
            },
            "&.Mui-focused": {
              boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.1)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 500,
        },
      },
    },
  },
})

// Styled components
const AppHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
  position: "sticky",
  top: 0,
  zIndex: 100,
}))

const AppLogo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  "& svg": {
    fontSize: 28,
    color: theme.palette.primary.main,
  },
}))

const AppNav = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}))

const NavButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
}))

const UserAvatar = styled(Avatar)(({ theme }) => ({
  cursor: "pointer",
  backgroundColor: theme.palette.primary.main,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: `0px 0px 0px 2px ${theme.palette.background.paper}, 0px 0px 0px 4px ${theme.palette.primary.main}`,
  },
}))

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
  overflow: "visible",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}))

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3),
  "& .MuiCardHeader-title": {
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  borderRadius: "16px 16px 0 0",
}))

const StepperContainer = styled(Box)(({ theme }) => ({
  margin: theme.spacing(4, 0),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: 16,
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  "& .MuiStepLabel-label": {
    fontWeight: 500,
  },
  "& .MuiStepLabel-active": {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  "& .MuiStepIcon-root.MuiStepIcon-active": {
    color: theme.palette.primary.main,
  },
  "& .MuiStepIcon-root.MuiStepIcon-completed": {
    color: theme.palette.success.main,
  },
}))

const CampaignTypeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  cursor: "pointer",
  transition: "all 0.3s ease",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
    zIndex: 1,
  },
}))

const IconContainer = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(
    theme.palette.primary.main,
    0.2,
  )} 100%)`,
  boxShadow: `0px 10px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
  "& svg": {
    fontSize: 32,
    color: theme.palette.primary.main,
  },
}))

const MailboxItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  marginTop: theme.spacing(1),
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
    boxShadow: `0px 4px 10px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}))

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  padding: theme.spacing(1.2, 3),
  textTransform: "none",
  fontWeight: 600,
  boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.1)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.15)",
  },
}))

const QuestionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  marginBottom: theme.spacing(4),
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "5px",
    height: "100%",
    background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  marginBottom: theme.spacing(3),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    borderRadius: 3,
    backgroundColor: theme.palette.primary.main,
  },
}))

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  borderRadius: 2,
  overflow: "hidden",
  marginBottom: theme.spacing(4),
}))

const ProgressIndicator = styled(Box)(({ theme, value }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: `${value}%`,
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  borderRadius: 2,
  transition: "width 0.5s ease-in-out",
}))

const StepCounter = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: 14,
  marginBottom: theme.spacing(2),
}))

const NewCampaignCreation = () => {
  const { db, user } = useFirebase()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Campaign creation states
  const [campaignName, setCampaignName] = useState("")
  const [mailboxes, setMailboxes] = useState([])
  const [leadIds, setLeadIds] = useState([])
  const [fetchedLeads, setFetchedLeads] = useState([])
  const [mailboxInput, setMailboxInput] = useState({ name: "", address: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [accounts, setAccounts] = useState([]);
  const [linkedinAccountIds, setLinkedinAccountIds] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isLinkedin, setIsLinkedin] = useState(false)
  // Questionnaire states
  const [selectedCampaignType, setSelectedCampaignType] = useState("")
  const [currentSection, setCurrentSection] = useState(0)
  const [questionnaire, setQuestionnaire] = useState([])
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState([])

  // UI states
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [creationStep, setCreationStep] = useState("type-selection") // ["type-selection", "questionnaire", "campaign-details"]
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Questionnaire data
  const questionnaireData = [
    {
      type: "Sales/Lead Generation",
      icon: <BusinessIcon fontSize="large" />,
      description: "Create a campaign focused on generating leads and driving sales conversions.",
      color: "#4361ee",
      sections: [
        {
          section: "Company & Product Context",
          question: [
            { question: "What's your company's name and what does it do?", answer: "" },
            { question: "What's your core product or service?", answer: "" },
            {
              question: "List specific problems your product solves (e.g., reduces churn, automates manual tasks).",
              answer: "",
            },
            { question: "Who are your typical or ideal customers (roles, industries, company size)?", answer: "" },
          ],
        },
        {
          section: "Target Audience",
          question: [
            {
              question: "Who is your target audience in this campaign? (e.g., job titles, industries, seniority)",
              answer: "",
            },
            {
              question: "What's a common pain point or challenge this audience faces related to your solution?",
              answer: "",
            },
            { question: "How are they currently solving this problem (if at all)?", answer: "" },
            {
              question: "Are there any buying signals you look for in leads (e.g., funding raised, tech stack)?",
              answer: "",
            },
          ],
        },
        {
          section: "Campaign Objective",
          question: [
            { question: "What's the primary goal of this email campaign?", answer: "" },
            { question: "What specific action do you want recipients to take?", answer: "" },
            { question: "Is this a one-off campaign or part of a multi-email sequence?", answer: "" },
            {
              question: "What problem does your solution solve that would make this audience want to act now?",
              answer: "",
            },
            {
              question: "Is there a specific offer or incentive you want to highlight (e.g., free trial, discount)?",
              answer: "",
            },
          ],
        },
        {
          section: "Value Proposition & Differentiation",
          question: [
            { question: "What sets your product or solution apart from competitors?", answer: "" },
            { question: "What ROI or success metric do you typically achieve for customers?", answer: "" },
            { question: "What are the most common objections you hear from this audience?", answer: "" },
            { question: "How does your solution directly address those objections?", answer: "" },
          ],
        },
        {
          section: "Personalization & Context",
          question: [
            {
              question:
                "Is there anything you'd like to reference across the emails (e.g., relevant trends, common tools, shared pain points)?",
              answer: "",
            },
            {
              question: "Would you like to include any case studies, customer names, or stats for credibility?",
              answer: "",
            },
            { question: "Do you want to reference any competitor tools your audience might be using?", answer: "" },
          ],
        },
        {
          section: "Tone & Preferences",
          question: [
            {
              question: "What tone should this campaign have (e.g., friendly, professional, witty, direct)?",
              answer: "",
            },
            { question: "Any links, CTAs, or scheduling tools you'd like to include?", answer: "" },
            { question: "Are there any phrases, buzzwords, or angles you want to avoid?", answer: "" },
            {
              question: "Would you like to include a specific signature, company tagline, or PS in each email?",
              answer: "",
            },
          ],
        },
      ],
    },
    {
      type: "Networking",
      icon: <GroupIcon fontSize="large" />,
      description: "Build professional relationships and expand your network with personalized outreach.",
      color: "#7209b7",
      sections: [
        {
          section: "Personal Background",
          question: [
            { question: "What's your name, role, and company?", answer: "" },
            { question: "Why are you reaching out to this person specifically?", answer: "" },
            { question: "Do you have any shared context (e.g., events, alma mater, mutual connections)?", answer: "" },
          ],
        },
        {
          section: "Target Contact",
          question: [
            { question: "Who are you hoping to connect with (name, role, company)?", answer: "" },
            { question: "What interests you about their work or background?", answer: "" },
          ],
        },
        {
          section: "Campaign Objective",
          question: [
            {
              question: "What's your primary goal in this outreach? (e.g., advice, mentorship, shared interests)",
              answer: "",
            },
            {
              question:
                "How would you like to continue the conversation (e.g., call, coffee chat, LinkedIn follow-up)?",
              answer: "",
            },
          ],
        },
        {
          section: "Tone & Preferences",
          question: [
            { question: "Do you prefer a friendly, casual tone or a more professional one?", answer: "" },
            { question: "Would you like to mention any specific context or topic in the intro?", answer: "" },
            { question: "Do you want to include a calendar link or keep the ask open-ended?", answer: "" },
          ],
        },
      ],
    },
    {
      type: "Partnership/Collaboration",
      icon: <HandshakeIcon fontSize="large" />,
      description: "Establish strategic partnerships and collaborations with other organizations.",
      color: "#10b981",
      sections: [
        {
          section: "Company & Product Context",
          question: [
            { question: "What's your company's name and what does it do?", answer: "" },
            { question: "What's your core product or service?", answer: "" },
            {
              question:
                "Have you partnered with other companies before? If so, what kind of collaborations worked well?",
              answer: "",
            },
          ],
        },
        {
          section: "Target Partner",
          question: [
            { question: "Who is the ideal partner for this collaboration?", answer: "" },
            { question: "Why does this specific company or person make a good fit?", answer: "" },
          ],
        },
        {
          section: "Campaign Objective",
          question: [
            {
              question: "What kind of partnership are you proposing (e.g., co-marketing, tech integration, events)?",
              answer: "",
            },
            { question: "What mutual value will this partnership create?", answer: "" },
            { question: "What would success look like for both sides?", answer: "" },
          ],
        },
        {
          section: "Personalization & Tone",
          question: [
            { question: "Do you want to reference any common ground (tools, audience, values, mission)?", answer: "" },
            { question: "What tone should this campaign have (e.g., collaborative, bold, curious)?", answer: "" },
          ],
        },
      ],
    },
    {
      type: "Investor Outreach",
      icon: <MonetizationOnIcon fontSize="large" />,
      description: "Connect with potential investors and secure funding for your venture.",
      color: "#f59e0b",
      sections: [
        {
          section: "Company & Product Context",
          question: [
            { question: "What's your company's name and what does it do?", answer: "" },
            { question: "What's your core product or service?", answer: "" },
            { question: "What stage is your company currently in (e.g., pre-seed, seed, Series A)?", answer: "" },
            { question: "Who are your current investors (if any)?", answer: "" },
          ],
        },
        {
          section: "Traction & Metrics",
          question: [
            { question: "What traction have you achieved so far (revenue, users, growth metrics)?", answer: "" },
            { question: "What key milestones have you hit recently?", answer: "" },
          ],
        },
        {
          section: "Campaign Objective",
          question: [
            { question: "How much are you raising and for what purpose?", answer: "" },
            { question: "Why are you reaching out to this specific investor?", answer: "" },
            { question: "What would be the ideal next step after this email?", answer: "" },
          ],
        },
        {
          section: "Differentiation & Vision",
          question: [
            { question: "What makes your startup or team uniquely positioned to win?", answer: "" },
            { question: "What long-term vision or impact do you want to communicate?", answer: "" },
          ],
        },
        {
          section: "Tone & Preferences",
          question: [
            { question: "Should the tone be formal, confident, visionary, or something else?", answer: "" },
            { question: "Do you want to include a deck, product link, or calendar link?", answer: "" },
          ],
        },
      ],
    },
  ]

  // Help content
  const helpContent = {
    "type-selection": {
      title: "Selecting a Campaign Type",
      content:
        "Choose the type of campaign that best fits your outreach goals. Each type is optimized for different scenarios and will generate tailored email sequences.",
    },
    questionnaire: {
      title: "Completing the Questionnaire",
      content:
        "Answer all questions in each section to help our AI understand your business and goals. The more detailed your answers, the more effective your campaign will be.",
    },
    "campaign-details": {
      title: "Campaign Configuration",
      content:
        "Set up your campaign name, add email accounts to send from, and select the leads you want to target. You'll need at least one mailbox and one lead to create a campaign.",
    },
  }

  useEffect(() => {
    const fetchUserLeads = async () => {
      if (!user) return
      try {
        setIsLoading(true)
        const q = query(collection(db, "marketings"), where("userID", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const fetchedLeadData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || `Lead ${doc.id}`,
        }))
        setFetchedLeads(fetchedLeadData)

        const q1 = query(collection(db, "linkedin_acc"), where("created_by", "==", user.uid));
        const querySnapshot1 = await getDocs(q1);

        const fetchedAccountsData = querySnapshot1.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.account_id, // Fixed: Using the account_id field from the data
            name: data.name || "LinkedIn Account",
            username: data.username || "",
            occupation: data.occupation || "",
            profilePicture: data.profile_picture_url,
            location: data.location || "",
            premium: data.premium || false,
            openProfile: data.open_profile || false,
            createdAt: data.created_at?.toDate() || new Date(),
          };
        });

        setAccounts(fetchedAccountsData);


      } catch (error) {
        console.error("Error fetching leads:", error)
        setSnackbar({ open: true, message: "Failed to fetch leads", severity: "error" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserLeads()
  }, [user, db])

  // Set questionnaire based on selected campaign type
  useEffect(() => {
    if (selectedCampaignType) {
      const selectedQuestionnaire = questionnaireData.find((q) => q.type === selectedCampaignType)
      if (selectedQuestionnaire) {
        setQuestionnaire(selectedQuestionnaire.sections)
        // Create a deep copy to avoid reference issues
        setQuestionnaireAnswers(JSON.parse(JSON.stringify(selectedQuestionnaire.sections)))
      }
    }
  }, [selectedCampaignType])

  // Calculate progress percentage for the current section
  const calculateSectionProgress = () => {
    if (!questionnaireAnswers[currentSection]) return 0

    const totalQuestions = questionnaireAnswers[currentSection].question.length
    const answeredQuestions = questionnaireAnswers[currentSection].question.filter(
      (q) => q.answer && q.answer.trim() !== "",
    ).length

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!questionnaireAnswers.length) return 0

    let totalQuestions = 0
    let answeredQuestions = 0

    questionnaireAnswers.forEach((section) => {
      totalQuestions += section.question.length
      answeredQuestions += section.question.filter((q) => q.answer && q.answer.trim() !== "").length
    })

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  // Mailbox handling functions
  const addMailbox = () => {
    const { name, address, password } = mailboxInput
    if (!name || !address || !password) {
      setSnackbar({ open: true, message: "Please fill all mailbox fields", severity: "warning" })
      return
    }
    if (mailboxes.some((item) => item.sender_email === address)) {
      setSnackbar({ open: true, message: "Email already exists", severity: "warning" })
      return
    }
    setMailboxes((prevMailboxes) => [...prevMailboxes, { sender_email: address, password, name }])
    setMailboxInput({ name: "", address: "", password: "" })
  }

  // Fixed handleAnswerChange function
  const handleAnswerChange = (questionText, value) => {
    const newQuestionnaireAnswers = JSON.parse(JSON.stringify(questionnaireAnswers))

    if (newQuestionnaireAnswers[currentSection]) {
      const questionIndex = newQuestionnaireAnswers[currentSection].question.findIndex(
        (q) => q.question === questionText,
      )

      if (questionIndex !== -1) {
        newQuestionnaireAnswers[currentSection].question[questionIndex].answer = value
        setQuestionnaireAnswers(newQuestionnaireAnswers)
      }
    }
  }

  // Handles moving to the next section
  const handleNextSection = () => {
    const currentSectionData = questionnaireAnswers[currentSection]

    if (!currentSectionData) return

    const allAnswered = currentSectionData.question.every((q) => q.answer && q.answer.trim() !== "")

    if (!allAnswered) {
      setSnackbar({ open: true, message: "Please answer all questions in this section", severity: "warning" })
      return
    }

    if (currentSection < questionnaireAnswers.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // Move to campaign details after completing all sections
      setCreationStep("campaign-details")
    }
  }

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      // Go back to campaign type selection
      setCreationStep("type-selection")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!campaignName || mailboxes.length === 0 || leadIds.length === 0) {
      setSnackbar({ open: true, message: "Please fill all campaign fields", severity: "error" })
      return
    }

    // Map campaign type
    const campaignTypeMap = {
      "Sales/Lead Generation": "sales",
      Networking: "networking",
      "Investor Outreach": "investor",
      "Partnership/Collaboration": "partnership",
    }

    const campaign_t = campaignTypeMap[selectedCampaignType] || "sales"

    try {
      setIsSubmitting(true)
      // Call info extraction endpoint
      const response = await fetch("https://us-central1-mailex-cfa6e.cloudfunctions.net/extractInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_type: campaign_t,
          questions: questionnaireAnswers,
        }),
      })

      if (!response.ok) throw new Error("Failed to extract campaign info")

      const data = await response.json()
      console.log("Extracted Info:", data)

      console.log(linkedinAccountIds)
      const selectedAccountsPayload = linkedinAccountIds.map((id) => {
        const account = accounts.find((acc) => acc.id === id);
        return {
          account_id: id,
          name: account?.name || "LinkedIn Account"
        };
      });
      console.log(selectedAccountsPayload)

      // Construct final campaign data
      const campaignData = {
        campaignName,
        mailboxes: mailboxes.map(({ sender_email, password }) => ({ sender_email, password })),
        leadIds,
        userId: user?.uid || "",
        campaign_type: campaignTypeMap[selectedCampaignType],
        extracted_info: data.extracted_info,
        summary: data.summary,
        islinkedin: isLinkedin,
        linkedinAccounts: isLinkedin ? selectedAccountsPayload : []

      }

      await createcampaign(campaignData)
      setSnackbar({ open: true, message: "Campaign created successfully!", severity: "success" })

    } catch (error) {
      console.error("Error submitting campaign:", error)
      setSnackbar({ open: true, message: "Failed to create campaign", severity: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render the current step
  const renderCurrentStep = () => {
    switch (creationStep) {
      case "type-selection":
        return (
          <Fade in={true} timeout={800}>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                <SectionTitle variant="h5" gutterBottom>
                  Select Campaign Type
                </SectionTitle>
                <Tooltip title="Learn more about campaign types">
                  <IconButton
                    onClick={() => setShowHelp(true)}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Grid container spacing={3}>
                {questionnaireData.map((type, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <CampaignTypeCard
                        elevation={selectedCampaignType === type.type ? 6 : 1}
                        onClick={() => setSelectedCampaignType(type.type)}
                        sx={{
                          border:
                            selectedCampaignType === type.type ? `2px solid ${type.color}` : "1px solid transparent",
                          backgroundColor:
                            selectedCampaignType === type.type ? alpha(type.color, 0.05) : "background.paper",
                        }}
                      >
                        <IconContainer
                          sx={{
                            background:
                              selectedCampaignType === type.type
                                ? `linear-gradient(135deg, ${alpha(type.color, 0.3)} 0%, ${alpha(type.color, 0.2)} 100%)`
                                : `linear-gradient(135deg, ${alpha(type.color, 0.2)} 0%, ${alpha(type.color, 0.1)} 100%)`,
                            boxShadow:
                              selectedCampaignType === type.type
                                ? `0px 10px 20px ${alpha(type.color, 0.25)}`
                                : `0px 10px 20px ${alpha(type.color, 0.15)}`,
                          }}
                        >
                          {type.icon}
                        </IconContainer>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {type.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                        {selectedCampaignType === type.type && (
                          <CheckCircleIcon
                            sx={{
                              color: type.color,
                              position: "absolute",
                              top: 10,
                              right: 10,
                            }}
                          />
                        )}
                      </CampaignTypeCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <ActionButton
                  variant="contained"
                  color="primary"
                  onClick={() => setCreationStep("questionnaire")}
                  disabled={!selectedCampaignType}
                  endIcon={<ArrowForwardIcon />}
                  size="large"
                >
                  Start Questionnaire
                </ActionButton>
              </Box>
            </Box>
          </Fade>
        )

      case "questionnaire":
        if (!questionnaire || questionnaire.length === 0) {
          return <Typography>Please select a campaign type first</Typography>
        }

        const currentSectionData = questionnaire[currentSection]
        const sectionProgress = calculateSectionProgress()
        const overallProgress = calculateOverallProgress()
        const selectedType = questionnaireData.find((q) => q.type === selectedCampaignType)
        const typeColor = selectedType ? selectedType.color : theme.palette.primary.main

        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <StepCounter>
                    Step {currentSection + 1} of {questionnaire.length}
                  </StepCounter>
                  <SectionTitle variant="h5" gutterBottom sx={{ color: typeColor }}>
                    {currentSectionData.section}
                  </SectionTitle>
                </Box>
                <Tooltip title="Help with this section">
                  <IconButton
                    onClick={() => setShowHelp(true)}
                    sx={{
                      backgroundColor: alpha(typeColor, 0.1),
                      color: typeColor,
                    }}
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <ProgressContainer>
                <ProgressIndicator value={overallProgress} />
              </ProgressContainer>

              <StepperContainer>
                <Stepper activeStep={currentSection} alternativeLabel>
                  {questionnaire.map((section, index) => (
                    <Step key={index}>
                      <StepLabel>{section.section}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </StepperContainer>

              <QuestionPaper
                elevation={3}
                sx={{
                  "&::after": { background: `linear-gradient(to bottom, ${typeColor}, ${alpha(typeColor, 0.7)})` },
                }}
              >
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                  Section progress: {sectionProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={sectionProgress}
                  sx={{
                    mb: 4,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(typeColor, 0.1),
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: typeColor,
                    },
                  }}
                />

                {currentSectionData.question.map((q, qIndex) => {
                  // Find the corresponding answer in questionnaireAnswers
                  const answerObj = questionnaireAnswers[currentSection]?.question[qIndex]
                  const currentAnswer = answerObj ? answerObj.answer : ""

                  return (
                    <Box key={qIndex} sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        {qIndex + 1}. {q.question}
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Your answer here..."
                        variant="outlined"
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&:hover fieldset": {
                              borderColor: typeColor,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: typeColor,
                            },
                          },
                        }}
                      />
                    </Box>
                  )
                })}
              </QuestionPaper>

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <ActionButton
                  variant="outlined"
                  onClick={handlePrevSection}
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{ borderColor: typeColor, color: typeColor }}
                >
                  Previous
                </ActionButton>
                <ActionButton
                  variant="contained"
                  onClick={handleNextSection}
                  endIcon={<ArrowForwardIcon />}
                  size="large"
                  sx={{
                    background: `linear-gradient(90deg, ${typeColor} 0%, ${alpha(typeColor, 0.8)} 100%)`,
                    "&:hover": {
                      background: `linear-gradient(90deg, ${typeColor} 20%, ${alpha(typeColor, 0.9)} 100%)`,
                    },
                  }}
                >
                  {currentSection < questionnaire.length - 1 ? "Next Section" : "Configure Campaign"}
                </ActionButton>
              </Box>
            </Box>
          </Fade>
        )

      case "campaign-details":
        const selectedCampaignTypeData = questionnaireData.find((q) => q.type === selectedCampaignType)
        const campaignColor = selectedCampaignTypeData ? selectedCampaignTypeData.color : theme.palette.primary.main

        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                <SectionTitle variant="h5" gutterBottom sx={{ color: campaignColor }}>
                  Campaign Details
                </SectionTitle>
                <Tooltip title="Help with campaign setup">
                  <IconButton
                    onClick={() => setShowHelp(true)}
                    sx={{
                      backgroundColor: alpha(campaignColor, 0.1),
                      color: campaignColor,
                    }}
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "5px",
                    background: `linear-gradient(90deg, ${campaignColor} 0%, ${alpha(campaignColor, 0.7)} 100%)`,
                  },
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: campaignColor }}>
                  Basic Information
                </Typography>

                <TextField
                  fullWidth
                  label="Campaign Name"
                  variant="outlined"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CampaignIcon sx={{ color: campaignColor }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": {
                        borderColor: campaignColor,
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: campaignColor,
                      },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(campaignColor, 0.05),
                    border: `1px solid ${alpha(campaignColor, 0.1)}`,
                    mb: 2,
                  }}
                >
                  <InfoOutlinedIcon sx={{ color: campaignColor, mr: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    This campaign will be created as a <strong>{selectedCampaignType}</strong> campaign. You've
                    completed the questionnaire and now need to configure your sending mailboxes and target leads.
                  </Typography>
                </Box>
              </Paper>

              {/* Mailbox Section */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <EmailIcon sx={{ color: campaignColor, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: campaignColor }}>
                    Mailboxes
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Name"
                      variant="outlined"
                      value={mailboxInput.name}
                      onChange={(e) => setMailboxInput({ ...mailboxInput, name: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: alpha(campaignColor, 0.7) }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: campaignColor,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: campaignColor,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      value={mailboxInput.address}
                      onChange={(e) => setMailboxInput({ ...mailboxInput, address: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AlternateEmailIcon sx={{ color: alpha(campaignColor, 0.7) }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: campaignColor,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: campaignColor,
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      value={mailboxInput.password}
                      onChange={(e) => setMailboxInput({ ...mailboxInput, password: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: alpha(campaignColor, 0.7) }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&:hover fieldset": {
                            borderColor: campaignColor,
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: campaignColor,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={addMailbox}
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${campaignColor} 0%, ${alpha(campaignColor, 0.8)} 100%)`,
                      "&:hover": {
                        background: `linear-gradient(90deg, ${campaignColor} 20%, ${alpha(campaignColor, 0.9)} 100%)`,
                      },
                    }}
                  >
                    Add Mailbox
                  </Button>
                </Box>

                <Box sx={{ mt: 3 }}>
                  {mailboxes.length > 0 ? (
                    mailboxes.map((mailbox, index) => (
                      <Zoom in={true} key={index} style={{ transitionDelay: `${index * 50}ms` }}>
                        <MailboxItem>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                mr: 2,
                                bgcolor: alpha(campaignColor, 0.1),
                                color: campaignColor,
                                fontWeight: 600,
                              }}
                            >
                              {mailbox.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {mailbox.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {mailbox.sender_email}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() => setMailboxes(mailboxes.filter((_, i) => i !== index))}
                            sx={{
                              color: theme.palette.error.main,
                              "&:hover": { backgroundColor: alpha(theme.palette.error.main, 0.1) },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </MailboxItem>
                      </Zoom>
                    ))
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                        border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
                        textAlign: "center",
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No mailboxes added yet. Add at least one mailbox to continue.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Lead IDs Selection */}
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <GroupIcon sx={{ color: campaignColor, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: campaignColor }}>
                    Select Leads
                  </Typography>
                </Box>

                {isLoading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                    <CircularProgress size={40} sx={{ color: campaignColor, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading your leads...
                    </Typography>
                  </Box>
                ) : (
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="lead-select-label" sx={{ backgroundColor: "background.paper", px: 1 }}>
                      Lead IDs
                    </InputLabel>
                    <Select
                      labelId="lead-select-label"
                      multiple
                      value={leadIds}
                      onChange={(e) => setLeadIds(e.target.value)}
                      label="Lead IDs"
                      sx={{
                        borderRadius: 2,
                        minHeight: "56px",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: campaignColor,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: campaignColor,
                        },
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((id) => (
                            <Chip
                              key={id}
                              label={fetchedLeads.find((lead) => lead.id === id)?.name || id}
                              sx={{
                                backgroundColor: alpha(campaignColor, 0.1),
                                color: campaignColor,
                                fontWeight: 500,
                                borderRadius: 8,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {fetchedLeads.length > 0 ? (
                        fetchedLeads.map((lead) => (
                          <MenuItem
                            key={lead.id}
                            value={lead.id}
                            sx={{
                              backgroundColor: leadIds.includes(lead.id) ? alpha(campaignColor, 0.1) : "inherit",
                              color: leadIds.includes(lead.id) ? campaignColor : "inherit",
                              "&:hover": { backgroundColor: alpha(campaignColor, 0.05) },
                              borderRadius: 1,
                              m: 0.5,
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                              {leadIds.includes(lead.id) && <CheckIcon sx={{ mr: 1, color: campaignColor }} />}
                              {lead.name}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No leads available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}

                {fetchedLeads.length === 0 && !isLoading && (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
                      textAlign: "center",
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No leads found. Please create leads before creating a campaign.
                    </Typography>
                  </Box>
                )}
              </Paper>
              <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <GroupIcon sx={{ color: campaignColor, mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: campaignColor }}>
                    LinkedIn Account Selection
                  </Typography>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isLinkedin}
                      onChange={(e) => setIsLinkedin(e.target.checked)}
                      sx={{
                        color: campaignColor,
                        '&.Mui-checked': { color: campaignColor },
                      }}
                    />
                  }
                  label="Use LinkedIn Accounts"
                  sx={{ mb: 2 }}
                />

                {isLinkedin && (
                  <>
                    {isLoadingAccounts ? (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4 }}>
                        <CircularProgress size={40} sx={{ color: campaignColor, mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading your LinkedIn accounts...
                        </Typography>
                      </Box>
                    ) : (
                      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id="linkedin-select-label" sx={{ backgroundColor: "background.paper", px: 1 }}>
                          Account IDs
                        </InputLabel>
                        <Select
                          labelId="linkedin-select-label"
                          multiple
                          value={linkedinAccountIds}
                          onChange={(e) => setLinkedinAccountIds(e.target.value)}
                          label="Account IDs"
                          sx={{
                            borderRadius: 2,
                            minHeight: "56px",
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: campaignColor,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: campaignColor,
                            },
                          }}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((id) => {
                                const account = accounts.find((acc) => acc.id === id);
                                return (
                                  <Chip
                                    key={id}
                                    label={account?.name || id}
                                    sx={{
                                      backgroundColor: alpha(campaignColor, 0.1),
                                      color: campaignColor,
                                      fontWeight: 500,
                                      borderRadius: 8,
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {accounts.length > 0 ? (
                            accounts.map((account) => (
                              <MenuItem
                                key={account.id}
                                value={account.id}
                                sx={{
                                  backgroundColor: linkedinAccountIds.includes(account.id) ? alpha(campaignColor, 0.1) : "inherit",
                                  color: linkedinAccountIds.includes(account.id) ? campaignColor : "inherit",
                                  "&:hover": { backgroundColor: alpha(campaignColor, 0.05) },
                                  borderRadius: 1,
                                  m: 0.5,
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                                  {linkedinAccountIds.includes(account.id) && <CheckIcon sx={{ mr: 1, color: campaignColor }} />}
                                  {account.name} – @{account.username}
                                </Box>
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No LinkedIn accounts available</MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    )}

                    {accounts.length === 0 && !isLoadingAccounts && (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.default, 0.5),
                          border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`,
                          textAlign: "center",
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          No LinkedIn accounts found. Please connect at least one account before continuing.
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Paper>


              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <ActionButton
                  variant="outlined"
                  onClick={() => setCreationStep("questionnaire")}
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{
                    borderColor: campaignColor,
                    color: campaignColor,
                    "&:hover": {
                      borderColor: campaignColor,
                      backgroundColor: alpha(campaignColor, 0.05),
                    },
                  }}
                >
                  Back to Questionnaire
                </ActionButton>
                <ActionButton
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    minWidth: "180px",
                    background: `linear-gradient(90deg, ${campaignColor} 0%, ${alpha(campaignColor, 0.8)} 100%)`,
                    "&:hover": {
                      background: `linear-gradient(90deg, ${campaignColor} 20%, ${alpha(campaignColor, 0.9)} 100%)`,
                    },
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                      Creating...
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </ActionButton>
              </Box>
            </Box>
          </Fade>
        )

      default:
        return <Typography>Unknown step</Typography>
    }
  }

  return (
    <ThemeProvider theme={saasTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>


        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <StyledCard elevation={4}>
            <StyledCardHeader
              title={`Create Campaign${selectedCampaignType ? `: ${selectedCampaignType}` : ""}`}
              sx={{ textAlign: "center" }}
            />
            <CardContent sx={{ p: isMobile ? 2 : 4 }}>
              {renderCurrentStep()}

              <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              >
                <Alert
                  severity={snackbar.severity}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  variant="filled"
                  sx={{ width: "100%", borderRadius: 2 }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </CardContent>
          </StyledCard>
        </Container>

        {/* Help Dialog */}
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showHelp}
          onClick={() => setShowHelp(false)}
        >
          <Paper
            elevation={5}
            sx={{
              maxWidth: 500,
              p: 4,
              borderRadius: 3,
              position: "relative",
              m: 2,

            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              {helpContent[creationStep]?.title || "Help"}
            </Typography>
            <Typography variant="body1" paragraph>
              {helpContent[creationStep]?.content || "Select options to continue with your campaign creation."}
            </Typography>
            <Button variant="contained" onClick={() => setShowHelp(false)} sx={{ mt: 2 }}>
              Got it
            </Button>
          </Paper>
        </Backdrop>
      </Box>
    </ThemeProvider>
  )
}

export default NewCampaignCreation
