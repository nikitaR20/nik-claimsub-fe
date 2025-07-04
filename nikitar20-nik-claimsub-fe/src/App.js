import React, { useState, useEffect } from "react";
import {
  Tabs, Tab, TextField, MenuItem, Button, Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, InputLabel, Select, FormControl,
  Grid
} from "@mui/material";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [claims, setClaims] = useState([]);
  const [providers, setProviders] = useState([]);
  const [risks, setRisks] = useState([
    { risk_id: "1084bc4d-dd50-4eb4-a7da-591dc0f9bd76", name: "Low Risk" },
    { risk_id: "7fbb4e86-f09a-4766-a9f5-3442d6142ec1", name: "Medium Risk" },
    { risk_id: "8e5d5889-bb99-4dce-be13-d5566637ce70", name: "High Risk" }
  ]);

  const [form, setForm] = useState({
    provider_id: "",
    risk_id: "",
    status: "To Do",
    submission_date: "",
    summary: "",
  });

  const [filters, setFilters] = useState({
    provider: "",
    risk: "",
    status: "",
    keyword: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/providers/`)
      .then((res) => res.json())
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    if (tabIndex === 1) fetchClaims();
  }, [tabIndex]);

  const fetchClaims = () => {
    fetch(`${API_BASE}/claims/?skip=0&limit=100`)
      .then((res) => res.json())
      .then(setClaims)
      .catch(() => setClaims([]));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { provider_id, risk_id, status, submission_date, summary } = form;
    if (!provider_id || !status || !submission_date) {
      alert("Please fill in required fields.");
      return;
    }

    const payload = {
      provider_id,
      risk_id: risk_id || null,
      status,
      submission_date,
      summary: summary || "",
    };

    fetch(`${API_BASE}/claims/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create claim");
        return res.json();
      })
      .then(() => {
        fetchClaims(); // Refresh claims list after creation
        setForm({
          provider_id: "",
          risk_id: "",
          status: "To Do",
          submission_date: "",
          summary: "",
        });
        setTabIndex(1);
      })
      .catch((err) => alert(err.message));
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesProvider = !filters.provider || String(claim.provider_id) === String(filters.provider);
    const matchesRisk = !filters.risk || (claim.risk_id && String(claim.risk_id) === String(filters.risk));
    const matchesStatus = !filters.status || claim.status === filters.status;
    const matchesKeyword = !filters.keyword || (
      claim.summary && claim.summary.toLowerCase().includes(filters.keyword.toLowerCase())
    );

    return matchesProvider && matchesRisk && matchesStatus && matchesKeyword;
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Tabs value={tabIndex} onChange={(_, i) => setTabIndex(i)} variant="fullWidth">
        <Tab label="Add Claim" />
        <Tab label="List Claims" />
      </Tabs>

      {tabIndex === 0 && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="provider-label">Provider</InputLabel>
                <Select
                  labelId="provider-label"
                  name="provider_id"
                  value={form.provider_id}
                  onChange={handleChange}
                  label="Provider"
                  required
                >
                  <MenuItem value="">Select Provider</MenuItem>
                  {providers.map((p) => (
                    <MenuItem key={p.provider_id} value={p.provider_id}>
                      {p.first_name} {p.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="risk-label">Risk</InputLabel>
                <Select
                  labelId="risk-label"
                  name="risk_id"
                  value={form.risk_id}
                  onChange={handleChange}
                  label="Risk"
                >
                  <MenuItem value="">Select Risk</MenuItem>
                  {risks.map((r) => (
                    <MenuItem key={r.risk_id} value={r.risk_id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 220 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  label="Status"
                  required
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
                name="submission_date"
                label="Submission Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.submission_date}
                onChange={handleChange}
                required
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#388e3c" } }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel id="filter-provider-label">Provider</InputLabel>
                <Select
                  labelId="filter-provider-label"
                  name="provider"
                  value={filters.provider}
                  onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                  label="Provider"
                >
                  <MenuItem value="">All</MenuItem>
                  {providers.map((p) => (
                    <MenuItem key={p.provider_id} value={p.provider_id}>
                      {p.first_name} {p.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel id="filter-risk-label">Risk</InputLabel>
                <Select
                  labelId="filter-risk-label"
                  name="risk"
                  value={filters.risk}
                  onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                  label="Risk"
                >
                  <MenuItem value="">All</MenuItem>
                  {risks.map((r) => (
                    <MenuItem key={r.risk_id} value={r.risk_id}>
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth sx={{ minWidth: 160 }}>
                <InputLabel id="filter-status-label">Status</InputLabel>
                <Select
                  labelId="filter-status-label"
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="Status"
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

          {filteredClaims.length === 0 ? (
            <Typography>No claims found.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Claim ID</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Risk</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Summary</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.claim_id}>
                      <TableCell>{claim.claim_id}</TableCell>
                      <TableCell>
                        {providers.find((p) => p.provider_id === claim.provider_id)
                          ? `${providers.find((p) => p.provider_id === claim.provider_id).first_name} ${providers.find((p) => p.provider_id === claim.provider_id).last_name}`
                          : claim.provider_id}
                      </TableCell>
                      <TableCell>
                        {risks.find((r) => r.risk_id === claim.risk_id)
                          ? risks.find((r) => r.risk_id === claim.risk_id).name
                          : claim.risk_id || "N/A"}
                      </TableCell>
                      <TableCell>{claim.status}</TableCell>
                      <TableCell>{claim.submission_date}</TableCell>
                      <TableCell>{claim.summary || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
