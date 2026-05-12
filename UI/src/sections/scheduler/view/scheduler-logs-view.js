import {useEffect, useState} from 'react';
import {Fragment} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Container,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {format} from 'date-fns';
import Iconify from 'src/components/iconify';
import {paths} from 'src/routes/paths';
import {getSchedulerExecutionLogs, getSchedulerExecutions} from 'src/api/scheduler-execution';

function getStatusColor(status) {
  const map = {
    running: 'info',
    success: 'success',
    failed: 'error',
    partial: 'warning',
  };
  return map[status] || 'default';
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return 'NA';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default function SchedulerLogsView() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExecutions = async () => {
      setLoading(true);
      try {
        const runs = await getSchedulerExecutions(id, 50, 0);
        setExecutions(runs);
      } catch (error) {
        console.error('Failed to load scheduler executions', error);
      } finally {
        setLoading(false);
      }
    };
    loadExecutions();
  }, [id]);

  const toggleExecutionLogs = async (executionId) => {
    const isOpen = expandedId === executionId;
    if (isOpen) {
      setExpandedId(null);
      return;
    }

    if (!logsMap[executionId]) {
      try {
        const logs = await getSchedulerExecutionLogs(executionId, 500, 0);
        setLogsMap((prev) => ({...prev, [executionId]: logs}));
      } catch (error) {
        console.error('Failed to load execution logs', error);
      }
    }
    setExpandedId(executionId);
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 4}}>
        <Stack>
          <Typography variant="h4">Scheduler Executions</Typography>
          <Typography variant="body2" color="text.secondary">
            Scheduler ID: {id}
          </Typography>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => navigate(paths.dashboard.scheduler.list)}
        >
          Back
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Run Started</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Search</TableCell>
                <TableCell>Airflow Run</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executions.map((execution) => (
                <Fragment key={execution.id}>
                  <TableRow key={execution.id} hover>
                    <TableCell>
                      <IconButton size="small" onClick={() => toggleExecutionLogs(execution.id)}>
                        <Iconify
                          icon={
                            expandedId === execution.id
                              ? 'eva:arrow-ios-upward-fill'
                              : 'eva:arrow-ios-downward-fill'
                          }
                        />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {execution.startedAt
                        ? format(new Date(execution.startedAt), 'MMM dd, yyyy HH:mm:ss')
                        : 'NA'}
                    </TableCell>
                    <TableCell>
                      <Chip label={execution.status} color={getStatusColor(execution.status)} size="small" />
                    </TableCell>
                    <TableCell>{execution.searchField || 'NA'}</TableCell>
                    <TableCell>{execution.airflowRunId || 'NA'}</TableCell>
                    <TableCell>{formatDuration(execution.durationMs)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{py: 0}}>
                      <Collapse in={expandedId === execution.id} timeout="auto" unmountOnExit>
                        <Box sx={{p: 2, bgcolor: 'background.neutral'}}>
                          {(logsMap[execution.id] || []).length ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Time</TableCell>
                                  <TableCell>Type</TableCell>
                                  <TableCell>Node</TableCell>
                                  <TableCell>Message</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(logsMap[execution.id] || []).map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell>
                                      {log.createdAt
                                        ? format(new Date(log.createdAt), 'HH:mm:ss')
                                        : 'NA'}
                                    </TableCell>
                                    <TableCell>{log.logType}</TableCell>
                                    <TableCell>{log.nodeType || 'general'}</TableCell>
                                    <TableCell>{log.message}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No logs for this execution.
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && executions.length === 0 && (
          <Box sx={{p: 5, textAlign: 'center'}}>
            <Typography variant="body2" color="text.secondary">
              No executions found for this scheduler yet.
            </Typography>
          </Box>
        )}
      </Card>
    </Container>
  );
}
