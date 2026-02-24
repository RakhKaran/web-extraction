import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Grid,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'notistack';
import {
  getFreshnessCheckById,
  getFreshnessCheckLogs,
  getFreshnessCheckStats,
} from 'src/api/data-freshness';

export default function DataFreshnessLogsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, logsData, statsData] = await Promise.all([
        getFreshnessCheckById(id),
        getFreshnessCheckLogs(id, 20),
        getFreshnessCheckStats(id),
      ]);
      setConfig(configData);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      enqueueSnackbar('Failed to load logs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      running: 'info',
      success: 'success',
      failed: 'error',
      partial: 'warning',
    };
    return colors[status] || 'default';
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <>
      <Helmet>
        <title>Freshness Check Logs</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Stack>
            <Typography variant="h4">{config?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Freshness Check Logs & Statistics
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => navigate('/dashboard/data-freshness')}
          >
            Back
          </Button>
        </Stack>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {stats.totalRuns}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Runs
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {stats.successfulRuns}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successful
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="error.main">
                  {stats.failedRuns}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3">{formatDuration(stats.averageDuration)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Duration
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4">{stats.totalChecked}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Checked
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.totalActive}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Still Active
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.totalExpired}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expired
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Logs Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Run Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Checked</TableCell>
                  <TableCell align="right">Active</TableCell>
                  <TableCell align="right">Expired</TableCell>
                  <TableCell align="right">Errors</TableCell>
                  <TableCell align="right">Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <>
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          <Iconify
                            icon={
                              expandedLog === log.id
                                ? 'eva:arrow-ios-upward-fill'
                                : 'eva:arrow-ios-downward-fill'
                            }
                          />
                        </IconButton>
                      </TableCell>
                      <TableCell>{format(new Date(log.runAt), 'MMM dd, yyyy HH:mm:ss')}</TableCell>
                      <TableCell>
                        <Chip label={log.status} color={getStatusColor(log.status)} size="small" />
                      </TableCell>
                      <TableCell align="right">{log.totalChecked || 0}</TableCell>
                      <TableCell align="right">{log.stillActive || 0}</TableCell>
                      <TableCell align="right">{log.expired || 0}</TableCell>
                      <TableCell align="right">{log.errors || 0}</TableCell>
                      <TableCell align="right">{formatDuration(log.duration)}</TableCell>
                    </TableRow>

                    {/* Expanded Details */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0 }}>
                        <Collapse in={expandedLog === log.id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, bgcolor: 'background.neutral' }}>
                            {log.errorMessage && (
                              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                                Error: {log.errorMessage}
                              </Typography>
                            )}

                            {log.details && log.details.length > 0 && (
                              <>
                                <Typography variant="subtitle2" gutterBottom>
                                  Details (showing first 10):
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Record ID</TableCell>
                                      <TableCell>URL</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Message</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {log.details.slice(0, 10).map((detail, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{detail.recordId}</TableCell>
                                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {detail.url}
                                        </TableCell>
                                        <TableCell>
                                          <Chip
                                            label={detail.status}
                                            color={
                                              detail.status === 'active'
                                                ? 'success'
                                                : detail.status === 'expired'
                                                ? 'warning'
                                                : 'error'
                                            }
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>{detail.message || '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {logs.length === 0 && (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No logs yet. Run the freshness check to see logs here.
              </Typography>
            </Box>
          )}
        </Card>
      </Container>
    </>
  );
}
