import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IconButton, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';

// ----------------------------------------------------------------------


export default function CompanyListTableRow({ row, selected, onSelectRow, onViewRow, onEditRow }) {
  const { companyName, designations, isActive } = row;


  return (
    <TableRow hover selected={selected}>
      <TableCell>{companyName || 'NA'}</TableCell>
      <TableCell>{Array.isArray(designations) && designations.length ? designations.join(', ') : 'NA'}</TableCell>
      <TableCell>
        <Label variant="soft" color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'In-active'}
        </Label>
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
