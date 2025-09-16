/* eslint-disable no-nested-ternary */
import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import { useGetWorkflows } from 'src/api/workflow';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';
import { Box, CardContent, Grid, Typography } from '@mui/material';
import TableViewToggleSwitch from 'src/components/table/table-view-toggle-switch';
import WorkflowTableRow from '../workflow-table-row';
import WorkflowTableGrid from '../workflow-table-grid';
import WorkflowCreateForm from '../workflow-create-form';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Workflow Name', width: 180 },
  { id: 'description', label: 'Description' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function WorkflowListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const [view, setView] = useState('grid');

  const createWorkflow = useBoolean();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { workflows, workflowsLoading, workflowsEmpty, refreshWorkflows } = useGetWorkflows();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.processes.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.processes.view(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleViewChange = useCallback(() => {
    console.log('here');
    // setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    if (workflows) {
      setTableData(workflows);
    }
  }, [workflows]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box
          sx={{
            mb: 2,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Side: Heading */}
          <Typography variant="h6" component="div">
            Workflow
          </Typography>

          {/* Right Side: Icons + Create Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TableViewToggleSwitch view={view} setView={setView} />
            {view === 'list' ? (
              <Button
                variant="contained"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={createWorkflow.onTrue}
                sx={{
                  borderRadius: '30px',
                  backgroundColor: '#4182EB',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  height: 40,
                  '&:hover': {
                    backgroundColor: '#3069c6',
                  },
                }}
              >
                Create
              </Button>
            ) : null}
          </Box>
        </Box>
        {view === 'list' ? (
          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={tableData.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={tableData.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        tableData.map((row) => row.id)
                      )
                    }
                    showCheckbox={false}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <WorkflowTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onViewRow={() => handleViewRow(row.id)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        ) : view === 'grid' ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
                onClick={() => {
                  createWorkflow.onTrue();
                }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(66, 133, 244, 0.1)', // light blue bg
                      color: '#4285F4', // Google blue
                      borderRadius: '12px',
                      width: 48,
                      height: 48,
                      margin: '0 auto 10px',
                    }}
                  >
                    <Iconify icon="eva:plus-fill" width={24} height={24} />
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#4285F4' }}>
                    Create Workflow
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {dataFiltered
              .slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              .map((row) => (
                <Grid item xs={12} sm={6} md={4} key={row.id}>
                  <WorkflowTableGrid
                    row={row}
                    onDeleteRow={() => handleDeleteRow(row.id)}
                    onEditRow={() => handleEditRow(row.id)}
                    onViewRow={() => handleViewRow(row.id)}
                  />
                </Grid>
              ))}
          </Grid>
        ) : null}
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />

      <WorkflowCreateForm open={createWorkflow.value} onClose={createWorkflow.onFalse} />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;
  const stabilizedThis = inputData.map((el, index) => [el, index]);
  const roleMapping = {
    production_head: 'Production Head',
    initiator: 'Initiator',
    validator: 'Validator',
  };
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((processes) =>
      Object.values(processes).some((value) =>
        String(value).toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((processes) =>
      status === '1' ? processes.isActive : !processes.isActive
    );
  }

  if (role.length) {
    inputData = inputData.filter(
      (processes) =>
        processes.permissions &&
        processes.permissions.some((processesRole) => {
          console.log(processesRole);
          const mappedRole = roleMapping[processesRole];
          console.log('Mapped Role:', mappedRole); // Check the mapped role
          return mappedRole && role.includes(mappedRole);
        })
    );
  }

  return inputData;
}
