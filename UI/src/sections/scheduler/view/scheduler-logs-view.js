import {useEffect, useMemo, useRef, useState} from 'react';
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
  Tooltip,
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

function getLogColor(type) {
  switch (type) {
    case 0:
      return '#00BFFF'; // info
    case 1:
      return '#FF3B3B'; // error
    case 2:
      return '#00FF00'; // success
    case 3:
      return '#FFD700'; // warning
    default:
      return '#FFFFFF';
  }
}

function formatLogLine(log) {
  const time = log.createdAt ? format(new Date(log.createdAt), 'HH:mm:ss') : 'NA';
  const scope = [log.nodeType, log.step].filter(Boolean).join(':');
  const prefix = scope ? `${scope} - ` : '';
  return `[${time}] ${prefix}${log.message}`;
}

export default function SchedulerLogsView() {
  const {id} = useParams();
  const navigate = useNavigate();
  const [executions, setExecutions] = useState([]);
  const [logsMap, setLogsMap] = useState({}); // executionId -> { logs, page, loading }
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const terminalRef = useRef(null);
  const logsMapRef = useRef({});

  const LOG_PAGE_SIZE = 200;

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

  useEffect(() => {
    logsMapRef.current = logsMap;
  }, [logsMap]);

  const expandedLogsState = useMemo(() => {
    if (!expandedId) return null;
    return logsMap[expandedId] || null;
  }, [expandedId, logsMap]);

  useEffect(() => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [expandedLogsState?.logs, expandedId]);

  const loadMoreLogs = async (executionId) => {
    setLogsMap((prev) => ({
      ...prev,
      [executionId]: {
        logs: prev?.[executionId]?.logs || [],
        page: prev?.[executionId]?.page ?? 0,
        loading: true,
      },
    }));

    const page = logsMapRef.current?.[executionId]?.page ?? 0;
    const skip = page * LOG_PAGE_SIZE;

    try {
      const next = await getSchedulerExecutionLogs(executionId, LOG_PAGE_SIZE, skip);
      setLogsMap((prev) => ({
        ...prev,
        [executionId]: {
          logs: [...(next || []), ...(prev?.[executionId]?.logs || [])],
          page: (prev?.[executionId]?.page ?? 0) + 1,
          loading: false,
        },
      }));
    } catch (error) {
      console.error('Failed to load execution logs', error);
      setLogsMap((prev) => ({
        ...prev,
        [executionId]: {
          logs: prev?.[executionId]?.logs || [],
          page: prev?.[executionId]?.page ?? 0,
          loading: false,
        },
      }));
    }
  };

  const toggleExecutionLogs = async (executionId) => {
    const isOpen = expandedId === executionId;
    if (isOpen) {
      setExpandedId(null);
      return;
    }

    if (!logsMap[executionId]) await loadMoreLogs(executionId);
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
                          <Box
                            ref={expandedId === execution.id ? terminalRef : undefined}
                            sx={{
                              bgcolor: 'black',
                              color: '#00FF00',
                              maxHeight: 420,
                              overflowY: 'auto',
                              px: 2,
                              py: 1.5,
                              borderRadius: 1,
                              fontFamily: 'monospace',
                              scrollbarWidth: 'none',
                              '&::-webkit-scrollbar': {display: 'none'},
                            }}
                          >
                            {((logsMap[execution.id]?.logs || [])).length ? (
                              (logsMap[execution.id]?.logs || [])
                                .slice()
                                .reverse()
                                .map((log) => (
                                  <Typography
                                    key={log.id}
                                    sx={{
                                      color: getLogColor(log.logType),
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem',
                                      whiteSpace: 'pre-wrap',
                                      mb: 0.75,
                                    }}
                                  >
                                    {formatLogLine(log)}
                                  </Typography>
                                ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No logs for this execution.
                              </Typography>
                            )}
                          </Box>

                          <Stack direction="row" justifyContent="center" sx={{pt: 1.5}}>
                            <Tooltip title="Loads older logs for this execution">
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => loadMoreLogs(execution.id)}
                                  disabled={!!logsMap?.[execution.id]?.loading}
                                  startIcon={<Iconify icon="eva:refresh-fill" />}
                                >
                                  Load More
                                </Button>
                              </span>
                            </Tooltip>
                          </Stack>
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
