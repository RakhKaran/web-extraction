import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import { IconButton, Tooltip } from '@mui/material';
import { format, isValid } from 'date-fns';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function SchedulerTableRow({ row, selected, onSelectRow, onViewRow, onEditRow }) {
  const { schedularName, schedulerType, schedulerFor, interval, date, time } = row;

  // Safely parse date
  const parsedDate = date ? new Date(date) : null;

  return (
    <TableRow hover selected={selected}>
      <TableCell>{schedularName || 'NA'}</TableCell>
      <TableCell>{schedulerType || 'NA'}</TableCell>
      <TableCell>{schedulerFor || 'NA'}</TableCell>
      <TableCell>{interval || 'NA'}</TableCell>

      <TableCell>
        {parsedDate && isValid(parsedDate) ? (
          <ListItemText
            primary={format(parsedDate, 'dd/MMM/yyyy')}
            secondary={format(parsedDate, 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        ) : (
          'NA'
        )}
      </TableCell>

      <TableCell>{time || 'NA'}</TableCell>

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

SchedulerTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onEditRow: PropTypes.func,
};
