import PropTypes from 'prop-types';
// @mui
import { TableRow, TableCell, IconButton, Tooltip, Link } from '@mui/material';
// components
import Iconify from 'src/components/iconify';

// ---

export default function LinkedInUrlsTableRow({ row, onDeleteRow }) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(row.url);
    console.log('URL copied to clipboard:', row.url);
    // Toast notification would be added here if the project has a toast provider
  };

  return (
    <TableRow hover>
      <TableCell>
        <Link
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          {row.url && row.url.length > 50
            ? row.url.substring(0, 50) + '...'
            : row.url}
          <Iconify icon="eva:external-link-fill" width={16} />
        </Link>
      </TableCell>

      <TableCell>{row.company || '-'}</TableCell>

      <TableCell>{row.designation || '-'}</TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <Tooltip title="Copy URL to clipboard">
          <IconButton
            color="default"
            onClick={handleCopyUrl}
            size="small"
          >
            <Iconify icon="eva:copy-fill" width={16} />
          </IconButton>
        </Tooltip>

        {/* <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={onDeleteRow}
            size="small"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </IconButton>
        </Tooltip> */}
      </TableCell>
    </TableRow>
  );
}

LinkedInUrlsTableRow.propTypes = {
  row: PropTypes.object,
  onDeleteRow: PropTypes.func,
};
