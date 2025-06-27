import React, { useEffect, useState } from "react";
import { useFirebase } from "../../firebase_context";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { routes } from "../../app_router";
import {
  Button,
  TableRow,
  TableCell,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import { signOut } from "firebase/auth";

const MarketingsPage = () => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [marketings, setMarketings] = useState([]);
  const [error, setError] = useState(null);
  const [dialogProspects, setDialogProspects] = useState(null);

  const { auth, db, user } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(routes.login);
      return;
    }

    const fetchMarketingsData = async () => {
      try {
        const q = query(
          collection(db, "marketings"),
          where("userID", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMarketings(data);
      } catch (error) {
        setError("Failed to fetch marketing data");
        console.error(error);
      }
    };

    fetchMarketingsData();
  }, [db, navigate, user]);

  const handleAddMarketing = () => {
    navigate(routes.newMarketing);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      setError("Failed to logout");
      console.error(error);
    }
    setLogoutLoading(false);
  };

  const generateProspects = async (id) => {
    setMarketings((prev) =>
      prev.map((marketing) =>
        marketing.id === id
          ? { ...marketing, prospectsLoading: true }
          : marketing
      )
    );

    try {
      // TODO: use API to generate prospects
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockProspects = [
        {
          name: "John Doe",
          email: "john.doe@gmail.com",
          linkedIn: "https://www.linkedin.com/in/johndoe",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@gmail.com",
          linkedIn: "https://www.linkedin.com/in/janesmith",
        },
        {
          name: "Alice Johnson",
          email: "alice.johnson@gmail.com",
          linkedIn: "https://www.linkedin.com/in/alicejohnson",
        },
        {
          name: "Bob Brown",
          email: "bob.brown@gmail.com",
          linkedIn: "https://www.linkedin.com/in/bobbrown",
        },
        {
          name: "Charlie Davis",
          email: "charlie.davis@gmail.com",
          linkedIn: "https://www.linkedin.com/in/charliedavis",
        },
      ];

      await updateDoc(doc(db, "marketings", id), {
        prospects: mockProspects,
      });

      setMarketings((prev) =>
        prev.map((marketing) =>
          marketing.id === id
            ? { ...marketing, prospects: mockProspects }
            : marketing
        )
      );
    } catch (error) {
      setError("Failed to generate prospects");
      console.error(error);
    }

    setMarketings((prev) =>
      prev.map((marketing) =>
        marketing.id === id
          ? { ...marketing, prospectsLoading: undefined }
          : marketing
      )
    );
  };

  const getProspectsAction = (marketing) => {
    if (marketing.prospectsLoading) {
      return (
        <Button variant="contained" color="primary" disabled>
          Loading...
        </Button>
      );
    }

    if (!marketing.prospects) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => generateProspects(marketing.id)}
        >
          Generate
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => setDialogProspects(marketing.prospects)}
      >
        Show
      </Button>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
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
      <Dialog open={dialogProspects} onClose={() => setDialogProspects(null)}>
        <DialogTitle>Prospects</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogProspects?.map((prospect, index) => (
              <TableRow key={index}>
                <TableCell>{prospect.name}</TableCell>
                <TableCell>{prospect.email}</TableCell>
                <TableCell>{prospect.linkedIn}</TableCell>
              </TableRow>
            ))}
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        style={{ float: "right", marginBottom: "20px" }}
        disabled={logoutLoading}
      >
        {logoutLoading ? "Loading..." : "Logout"}
      </Button>
      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business Type</TableCell>
              <TableCell>Job Role</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Email Start</TableCell>
              <TableCell>Email End</TableCell>
              <TableCell>Prospects</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marketings.map((marketing, index) => (
              <TableRow key={index}>
                <TableCell>{marketing.businessType}</TableCell>
                <TableCell>{marketing.jobRole}</TableCell>
                <TableCell>{marketing.location}</TableCell>
                <TableCell>{marketing.emailStart}</TableCell>
                <TableCell>{marketing.emailEnd}</TableCell>
                <TableCell>{getProspectsAction(marketing)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "40vh" }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMarketing}
        >
          New Marketing
        </Button>
      </div>
    </div>
  );
};

export default MarketingsPage;
