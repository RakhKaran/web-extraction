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

const schedulerTypes = [
  { value: 0, label: 'One Time' },
  { value: 1, label: 'Recurring' },
];

const schedulerForValues = [
  { value: 0, label: 'Jobs' },
  { value: 1, label: 'Company' },
];

const intervalTypeValues = [
  { value: 1, label: 'Hours' },
  { value: 2, label: 'Days' },
  { value: 3, label: 'Weeks' },
  { value: 4, label: 'Months' },
];


export default function SchedulerTableRow({ row, selected, onSelectRow, onViewRow, onEditRow }) {
  const { schedularName, schedulerType, schedulerFor, intervalType, interval, date, time, isActive, isScheduled } = row;

  // Safely parse date
  const parsedDate = date ? new Date(date) : null;

  return (
    <TableRow hover selected={selected}>
      <TableCell>{schedularName || 'NA'}</TableCell>
      <TableCell>
        {schedulerTypes.find((item) => item.value === schedulerType)?.label || 'NA'}
      </TableCell>
      <TableCell>
        {schedulerForValues.find((item) => item.value === schedulerFor)?.label || 'NA'}
      </TableCell>
      <TableCell>
        {intervalTypeValues.find((item) => item.value === intervalType)?.label || 'NA'}
      </TableCell>
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

      <TableCell>
        {isValid(new Date(time)) ? (
          <ListItemText
            primary={format(new Date(time), 'p')}
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

      <TableCell>
        <Label
          variant="soft"
          color={(isActive && 'success') || (!isActive && 'error') || 'default'}
        >
          {isActive ? 'Active' : 'In-Active'}
        </Label>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(isScheduled && 'success') || 'info'}
        >
          {isScheduled ? 'Running' : 'Not scheduled'}
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

SchedulerTableRow.propTypes = {
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onEditRow: PropTypes.func,
};
