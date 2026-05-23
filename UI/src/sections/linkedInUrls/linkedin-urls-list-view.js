import { useState, useCallback, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
// @mui
import {
  Card,
  Table,
  Button,
  Tooltip,
  Container,
  TableBody,
  IconButton,
  TableContainer,
  TableRow,
  TableCell,
} from '@mui/material';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

//
import LinkedInUrlsTableRow from './linkedin-urls-table-row';
import LinkedInUrlsTableToolbar from './linkedin-urls-table-toolbar';
import { useGetLinkedInUrls } from 'src/api/linkedin-urls';

// ---

const TABLE_HEAD = [
  { id: 'url', label: 'URL' },
  { id: 'company', label: 'Company' },
  { id: 'designation', label: 'Designation' },
  { id: 'action', label: 'Actions' },
];

const defaultFilters = {
  company: '',
  designation: '',
};

// ---

export default function LinkedInUrlsListView() {
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();

  const confirm = useBoolean();

  const { linkedInUrls, linkedInUrlsLoading } = useGetLinkedInUrls();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: linkedInUrls || [],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 76;

  const notFound = !dataFiltered.length;

  const handleFilters = useCallback((name, value) => {
    table.onResetPage();
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, [table]);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = linkedInUrls.filter((row) => row.id !== id);
      // TODO: Call delete API
      console.log('Delete URL:', id);
    },
    [linkedInUrls]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="LinkedIn URLs"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'LinkedIn URLs' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <LinkedInUrlsTableToolbar
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={!isEqual(filters, defaultFilters)}
          onResetFilters={handleResetFilters}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                onSort={table.onSort}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <LinkedInUrlsTableRow
                      key={row.id}
                      row={row}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                {notFound && <TableNoData notFound={notFound} />}
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
    </Container>
  );
}

// ---

function applyFilter({ inputData, comparator, filters }) {
  const { company, designation } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (company) {
    inputData = inputData.filter(
      (item) => item.company?.toLowerCase().indexOf(company.toLowerCase()) !== -1
    );
  }

  if (designation) {
    inputData = inputData.filter(
      (item) => item.designation?.toLowerCase().indexOf(designation.toLowerCase()) !== -1
    );
  }

  return inputData;
}
