import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Avatar, Link } from '@mui/material';

// ----------------------------------------------------------------------

export default function CompanyTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const { id, fullName, profileUrl, company, designation, location, redirectUrl } = row;

  const avatarSrc = typeof profileUrl === 'string' && profileUrl.trim() && profileUrl.startsWith('https') ? profileUrl : undefined;

  const confirm = useBoolean();
  const popover = usePopover();
  const router = useRouter();

  const handleViewCandidate = () => {
    router.push(paths.dashboard.company.candidateDetails(id));
  };

  return (
    <>
      <TableRow hover selected={selected}>
        {/* Checkbox */}
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={fullName}
            src={avatarSrc}
            variant="rounded"
            sx={{ width: 64, height: 64, mr: 2 }}
          />

          <ListItemText
            disableTypography
            primary={
              <Link
                noWrap
                color="inherit"
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
              >
                {fullName}
              </Link>
            }
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{company}</TableCell>


        {/* Address */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{designation}</TableCell>


        {/* Phone Number */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Link
            noWrap
            color="inherit"
            variant="subtitle2"
            onClick={() => window.open(redirectUrl, '_blank')}
            sx={{ cursor: 'pointer' }}
          >
            Profile
          </Link>
        </TableCell>


        {/* Email */}


        {/* Created At */}
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </TableCell> */}

        {/* Actions */}
        <TableCell>
          <Tooltip title="View Events">
            <IconButton onClick={() => router.push(paths.dashboard.company.candidateDetails(id))}>
              <Iconify icon="carbon:view-filled" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Popover */}
      {/* <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover> */}

      {/* Confirm Delete Dialog */}
    </>
  );
}

CompanyTableRow.propTypes = {
  row: PropTypes.object,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func.isRequired,
  onSelectRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
};
