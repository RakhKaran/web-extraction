import PropTypes from 'prop-types';
// @mui
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
// components
import { Tooltip } from '@mui/material';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function JobTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const { title, company, experience, location, salary, openings, applicants } = row;

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {title || 'N/A'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{company || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{location || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{experience || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{salary || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{openings || 'N/A'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{applicants || 'N/A'}</TableCell>
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
