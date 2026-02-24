import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  Stack,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'notistack';
import {
  getFreshnessChecks,
  deleteFreshnessCheck,
  runFreshnessCheck,
  pauseFreshnessCheck,
  resumeFreshnessCheck,
} from 'src/api/data-freshness';
import DataFreshnessCard from 'src/sections/data-freshness/data-freshness-card';

export default function DataFreshnessPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [freshnessChecks, setFreshnessChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  useEffect(() => {
    loadFreshnessChecks();
  }, []);

  const loadFreshnessChecks = async () => {
    try {
      setLoading(true);
      const data = await getFreshnessChecks();
      setFreshnessChecks(data);
    } catch (error) {
      console.error('Error loading freshness checks:', error);
      enqueueSnackbar('Failed to load freshness checks', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/dashboard/data-freshness/create');
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/data-freshness/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteFreshnessCheck(deleteDialog.id);
      enqueueSnackbar('Freshness check deleted successfully', { variant: 'success' });
      setDeleteDialog({ open: false, id: null, name: '' });
      loadFreshnessChecks();
    } catch (error) {
      console.error('Error deleting freshness check:', error);
      enqueueSnackbar('Failed to delete freshness check', { variant: 'error' });
    }
  };

  const handleRun = async (id, name) => {
    try {
      await runFreshnessCheck(id);
      enqueueSnackbar(`Running freshness check: ${name}`, { variant: 'info' });
      setTimeout(() => loadFreshnessChecks(), 2000);
    } catch (error) {
      console.error('Error running freshness check:', error);
      enqueueSnackbar('Failed to run freshness check', { variant: 'error' });
    }
  };

  const handlePause = async (id, name) => {
    try {
      await pauseFreshnessCheck(id);
      enqueueSnackbar(`Paused: ${name}`, { variant: 'success' });
      loadFreshnessChecks();
    } catch (error) {
      console.error('Error pausing freshness check:', error);
      enqueueSnackbar('Failed to pause freshness check', { variant: 'error' });
    }
  };

  const handleResume = async (id, name) => {
    try {
      await resumeFreshnessCheck(id);
      enqueueSnackbar(`Resumed: ${name}`, { variant: 'success' });
      loadFreshnessChecks();
    } catch (error) {
      console.error('Error resuming freshness check:', error);
      enqueueSnackbar('Failed to resume freshness check', { variant: 'error' });
    }
  };

  const handleViewLogs = (id) => {
    navigate(`/dashboard/data-freshness/logs/${id}`);
  };

  return (
    <>
      <Helmet>
        <title>Data Freshness Management</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Data Freshness Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={handleCreate}
          >
            Create Freshness Check
          </Button>
        </Stack>

        {!loading && freshnessChecks.length === 0 && (
          <Card sx={{ p: 5, textAlign: 'center' }}>
            <Iconify icon="eva:clock-outline" width={80} sx={{ mb: 2, color: 'text.disabled' }} />
            <Typography variant="h6" gutterBottom>
              No Freshness Checks Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first data freshness check to automatically monitor if your scraped data
              is still active.
            </Typography>
            <Button variant="contained" onClick={handleCreate}>
              Create Freshness Check
            </Button>
          </Card>
        )}

        <Stack spacing={3}>
          {freshnessChecks.map((check) => (
            <DataFreshnessCard
              key={check.id}
              check={check}
              onEdit={() => handleEdit(check.id)}
              onDelete={() => setDeleteDialog({ open: true, id: check.id, name: check.name })}
              onRun={() => handleRun(check.id, check.name)}
              onPause={() => handlePause(check.id, check.name)}
              onResume={() => handleResume(check.id, check.name)}
              onViewLogs={() => handleViewLogs(check.id)}
            />
          ))}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}>
          <DialogTitle>Delete Freshness Check</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>
              Are you sure you want to delete <strong>{deleteDialog.name}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
