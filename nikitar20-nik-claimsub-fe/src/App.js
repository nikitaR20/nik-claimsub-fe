import React, { useState, useEffect } from "react";
import {
  Tabs, Tab, TextField, MenuItem, Button, Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, InputLabel, Select, FormControl,
  Grid
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [claims, setClaims] = useState([]);
  const [form, setForm] = useState({
    provider: "",
    risk: "",
    status: "To Do",
    submissionDate: "",
    summary: "",
  });
  const [filters, setFilters] = useState({
    provider: "",
    risk: "",
    status: "",
    keyword: ""
  });

  const theme = useTheme();

  useEffect(() => {
    const savedClaims = localStorage.getItem("claims");
    if (savedClaims) setClaims(JSON.parse(savedClaims));
  }, []);

  useEffect(() => {
    localStorage.setItem("claims", JSON.stringify(claims));
  }, [claims]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.provider || !form.risk || !form.status || !form.submissionDate || !form.summary) {
      alert("Please fill in all fields before submitting.");
      return;
    }
    const newClaim = { ...form, claimId: uuidv4() };
    setClaims([...claims, newClaim]);
    setForm({ provider: "", risk: "", status: "To Do", submissionDate: "", summary: "" });
    setTabIndex(1);
  };

  const filteredClaims = claims.filter((claim) => {
    return (
      (!filters.provider || claim.provider === filters.provider) &&
      (!filters.risk || claim.risk === filters.risk) &&
      (!filters.status || claim.status === filters.status) &&
      (!filters.keyword || claim.summary.toLowerCase().includes(filters.keyword.toLowerCase()))
    );
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)} variant="fullWidth">
        <Tab label="Add Claim" />
        <Tab label="List Claims" />
      </Tabs>

      {tabIndex === 0 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Provider</InputLabel>
                <Select
                  name="provider"
                  value={form.provider}
                  onChange={handleChange}
                  label="Provider"
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">Select Provider</MenuItem>
                  <MenuItem value="Provider A">Provider A</MenuItem>
                  <MenuItem value="Provider B">Provider B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Risk</InputLabel>
                <Select
                  name="risk"
                  value={form.risk}
                  onChange={handleChange}
                  label="Risk"
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">Select Risk</MenuItem>
                  <MenuItem value="Low Risk">Low Risk</MenuItem>
                  <MenuItem value="High Risk">High Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label="Status"
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Denied">Denied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="submissionDate"
                label="Submission Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.submissionDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="summary"
                label="Summary"
                multiline
                rows={3}
                value={form.summary}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#388e3c" } }}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Provider</InputLabel>
                <Select
                  name="provider"
                  value={filters.provider}
                  onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Provider A">Provider A</MenuItem>
                  <MenuItem value="Provider B">Provider B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Risk</InputLabel>
                <Select
                  name="risk"
                  value={filters.risk}
                  onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Low Risk">Low Risk</MenuItem>
                  <MenuItem value="High Risk">High Risk</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Denied">Denied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Keyword"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            {filteredClaims.length === 0 ? (
              <Typography>No claims found.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 180 }}>Claim ID</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Provider</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Risk</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>Status</TableCell>
                      <TableCell sx={{ minWidth: 140 }}>Date</TableCell>
                      <TableCell>Summary</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClaims.map((claim) => (
                      <TableRow key={claim.claimId}>
                        <TableCell>{claim.claimId}</TableCell>
                        <TableCell>{claim.provider}</TableCell>
                        <TableCell>{claim.risk}</TableCell>
                        <TableCell>{claim.status}</TableCell>
                        <TableCell>{claim.submissionDate}</TableCell>
                        <TableCell>{claim.summary}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
