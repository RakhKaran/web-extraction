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
import axiosInstance from 'src/utils/axios';
import { useGetWorkflowInstances } from 'src/api/workflow-instance';
import { Box, Grid, Typography } from '@mui/material';
import WorkflowInstanceTableRow from '../workflowInstance-table-row';
import ProcessTypeTableGrid from '../processInstance-table-grid';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'no', label: 'NO.', width: 180 },
  { id: 'instanceId', label: 'Instance Id' },
  { id: 'workflowName', label: 'Workflow Name' },
  { id: 'currentStage', label: 'Current Stage' },
  { id: '', label: 'Actions', width: 120},
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function WorkflowInstanceListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const [view, setView] = useState('list');

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const { workflowInstances, workflowInstancesEmpty, refreshWorkflowInstances } = useGetWorkflowInstances();

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
      router.push(paths.dashboard.workflowInstance.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.processType.view(id));
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

  const handleProcessInstanceRunningStatus = async(row) => {
    try{
      await axiosInstance.patch(`/workflow-instances/${row?.id}`, {isInstanceRunning: !row?.isInstanceRunning});
      refreshWorkflowInstances();
    }catch(error){
      console.error('Error while changing running status', error);
    }
  }

  useEffect(() => {
    if (workflowInstances) {
      setTableData(workflowInstances);
    }
  }, [workflowInstances]);

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
            Workflow Instances
          </Typography>

          {/* Right Side: Icons + Create Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* <TableViewToggleSwitch view={view} setView={setView} /> */}

            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              component={RouterLink}
              href={paths.dashboard.workflowInstance.new}
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
              Create Instance
            </Button>
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
                        <WorkflowInstanceTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onViewRow={() => handleViewRow(row.id)}
                          onStatusChange={() => handleProcessInstanceRunningStatus(row)}
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
            {dataFiltered
              .slice(
                table.page * table.rowsPerPage,
                table.page * table.rowsPerPage + table.rowsPerPage
              )
              .map((row) => (
                <Grid item xs={12} sm={6} md={4} key={row.id}>
                  <ProcessTypeTableGrid
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
    inputData = inputData.filter((processType) =>
      Object.values(processType).some((value) =>
        String(value).toLowerCase().includes(name.toLowerCase())
      )
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((processType) =>
      status === '1' ? processType.isActive : !processType.isActive
    );
  }

  if (role.length) {
    inputData = inputData.filter(
      (processType) =>
        processType.permissions &&
        processType.permissions.some((processTypeRole) => {
          console.log(processTypeRole);
          const mappedRole = roleMapping[processTypeRole];
          console.log('Mapped Role:', mappedRole); // Check the mapped role
          return mappedRole && role.includes(mappedRole);
        })
    );
  }

  return inputData;
}
