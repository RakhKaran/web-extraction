import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { format } from 'date-fns';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function WorkflowTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
}) {
  const navigate = useNavigate();
  const { name, description, isActive, createdAt } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{description}</TableCell>
        <TableCell>
          <ListItemText
            primary={format(new Date(createdAt), 'dd MMM yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={(isActive && 'success') || (!isActive && 'error') || 'default'}
          >
            {isActive ? 'Active' : 'In-Active'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="blueprint" placement="top" arrow>
            <IconButton
              onClick={() => {
                navigate(paths.dashboard.workflow.reactFlow(row.id));
              }}
            >
              <Iconify icon="carbon:flow-modeler" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              color="default"
              onClick={() => {
                onEditRow();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View" placement="top" arrow>
            <IconButton
              onClick={() => {
                onViewRow();
              }}
            >
              <Iconify icon="carbon:view-filled" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem> */}

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

WorkflowTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
