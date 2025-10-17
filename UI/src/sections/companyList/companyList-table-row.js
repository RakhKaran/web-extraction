import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import { IconButton, Tooltip } from '@mui/material';
import { format, isValid } from 'date-fns';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';

// ----------------------------------------------------------------------


export default function CompanyListTableRow({ row, selected, onSelectRow, onViewRow, onEditRow }) {
  const { companyName, description, designation } = row;


  return (
    <TableRow hover selected={selected}>
      <TableCell>{companyName || 'NA'}</TableCell>
        <TableCell>{designation || 'NA'}</TableCell>
      <TableCell>
        {description|| 'NA'}
      </TableCell>
  
      <TableCell>
        <Tooltip title="Edit" placement="top" arrow>
          <IconButton onClick={onEditRow}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

CompanyListTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onEditRow: PropTypes.func,
};
