import { useFirebase } from "../../firebase_context";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
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
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { createcampaign } from "../../api/api";

const CreateCampaign = () => {
    const { db, user } = useFirebase();
    const [campaignName, setCampaignName] = useState("");
    const [mailboxes, setMailboxes] = useState([]);
    const [leadIds, setLeadIds] = useState([]);
    const [fetchedLeads, setFetchedLeads] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [mailboxInput, setMailboxInput] = useState({ name: "", address: "", password: "" });

    useEffect(() => {
        const fetchUserLeads = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, "marketings"), where("userID", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedLeadData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || `Lead ${doc.id}`
                }));
                setFetchedLeads(fetchedLeadData);
            } catch (error) {
                console.error("Error fetching leads:", error);
            }
        };
        fetchUserLeads();
    }, [user, db]);

    const addMailbox = () => {
        const { name, address, password } = mailboxInput;
        if (!name || !address || !password) {
            setSnackbar({ open: true, message: "Please fill all mailbox fields", severity: "warning" });
            return;
        }
        if (mailboxes.some(item => item.sender_email === address)) {
            setSnackbar({ open: true, message: "Email already exists", severity: "warning" });
            return;
        }
        setMailboxes(prevMailboxes => [...prevMailboxes, { sender_email: address, password, name }]);
        setMailboxInput({ name: "", address: "", password: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!campaignName || mailboxes.length === 0 || leadIds.length === 0) {
            setSnackbar({ open: true, message: "Please fill all fields", severity: "error" });
            return;
        }
        const campaignData = {
            campaignName,
            mailboxes: mailboxes.map(item => ({ sender_email: item.sender_email, password: item.password })),
            leadIds,
            userId: user.uid ? user.uid : `${user.uid}`
        };

        const response = await createcampaign(campaignData);

        if (response.status === 200) {
            setSnackbar({ open: true, message: "Campaign created successfully!", severity: "success" });
        } else {
            setSnackbar({ open: true, message: "Failed to create campaign", severity: "error" });
        }
    };

    const getRandomColor = (id) => {
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD"];
        return colors[id.charCodeAt(0) % colors.length];
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Card elevation={3}>
                <CardHeader title="Create Campaign" sx={{ backgroundColor: "#f5f5f5", textAlign: "center" }} />
                <CardContent>
                    <TextField
                        fullWidth
                        label="Campaign Name"
                        variant="outlined"
                        margin="normal"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                    />

                    {/* Mailbox Section */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6">Mailboxes</Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    variant="outlined"
                                    value={mailboxInput.name}
                                    onChange={(e) => setMailboxInput({ ...mailboxInput, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    value={mailboxInput.address}
                                    onChange={(e) => setMailboxInput({ ...mailboxInput, address: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    value={mailboxInput.password}
                                    onChange={(e) => setMailboxInput({ ...mailboxInput, password: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <Button variant="contained" color="primary" onClick={addMailbox} sx={{ mt: 2 }}>
                            Add Mailbox
                        </Button>
                        {mailboxes.map((mailbox, index) => (
                            <Box key={index} display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1, p: 1, border: "1px solid #ddd", borderRadius: 1 }}>
                                <Typography>{mailbox.name} ({mailbox.sender_email})</Typography>
                                <IconButton onClick={() => setMailboxes(mailboxes.filter((_, i) => i !== index))}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Lead IDs Selection (Dropdown) */}
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>Select Leads</Typography>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel>Lead IDs</InputLabel>
                            <Select
                                multiple
                                value={leadIds}
                                onChange={(e) => setLeadIds(e.target.value)}
                                label="Lead IDs"
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {selected.map((id) => (
                                            <Chip
                                                key={id}
                                                label={fetchedLeads.find(lead => lead.id === id)?.name || id}
                                                sx={{ backgroundColor: "#4CAF50", color: "#fff" }} // Green color for selected chips
                                            />
                                        ))}
                                    </Box>
                                )}
                            >
                                {fetchedLeads.map((lead) => (
                                    <MenuItem
                                        key={lead.id}
                                        value={lead.id}
                                        sx={{
                                            backgroundColor: leadIds.includes(lead.id) ? " #8bca84 !important" : "inherit",
                                            color: leadIds.includes(lead.id) ? "#fff" : "inherit",
                                            "&:hover": { backgroundColor: "#D0F0C0" } // Light green on hover
                                        }}
                                    >
                                        {lead.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Button variant="contained" color="primary" fullWidth onClick={handleSubmit} sx={{ mt: 3 }}>
                        Create Campaign
                    </Button>

                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={4000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                    >
                        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </CardContent>
            </Card>
        </Container>
    );
};

export default CreateCampaign;
