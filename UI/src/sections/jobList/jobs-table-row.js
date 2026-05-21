import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// components
import { Chip, ListItemText, Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';
import { format } from 'date-fns';

// ----------------------------------------------------------------------

export default function JobTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const {
    title,
    company,
    sourceName,
    blueprintName,
    expiredStatus,
    effectiveDate,
    experience,
    location,
    salary,
    openings,
    applicants,
  } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {title || 'N/A'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{company || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sourceName || 'Unknown'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Chip
            size="small"
            label={expiredStatus || 'Unknown'}
            color={expiredStatus === 'Expired' ? 'error' : 'success'}
          />
        </TableCell>
        <TableCell>
          <ListItemText
            primary={format(new Date(effectiveDate), 'dd MMM yyyy')}
            secondary={format(new Date(effectiveDate), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        {/* Actions */}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="View Job">
            <IconButton onClick={onViewRow}>
              <Iconify icon="carbon:view-filled" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </>
  );
}

JobTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
};
