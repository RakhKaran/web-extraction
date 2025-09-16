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

export default function WorkflowInstanceTableRow({
  row,
  selected,
  onEditRow,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  onStatusChange
}) {
  const navigate = useNavigate();
  const { id, workflowInstanceName, workflow, currentStage, isInstanceRunning } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{workflowInstanceName}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{workflow?.name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{currentStage || 'NA'}</TableCell>

        <TableCell sx={{ px: 1, whiteSpace: 'nowrap', display: 'flex', gap: '10px', justifyContent: 'end' }}>
          <Tooltip title={isInstanceRunning ? 'Pause' : 'Start'} placement="top" arrow>
            <IconButton
              sx={{
                backgroundColor: 'rgba(65, 130, 235, 0.1)',
                border: '1px solid rgba(65, 130, 235, 0.3)',
                p: 1,
                borderRadius: '12px',
                color: '#4182EB',
              }}
              onClick={() => {
                onStatusChange();
              }}
            >
              <Iconify
                icon={isInstanceRunning ? 'ic:round-pause-circle' : 'ic:round-play-circle'}
                width={20}
                height={20}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Documents" placement="top" arrow>
            <IconButton
              sx={{
                backgroundColor: 'rgba(65, 130, 235, 0.1)',
                border: '1px solid rgba(65, 130, 235, 0.3)',
                p: 1,
                borderRadius: '12px',
                color: '#4182EB', // icon color
              }}
              onClick={() => console.log('documents clicked')}
            >
              <Iconify icon="ic:baseline-insert-drive-file" width={20} height={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton
              sx={{
                backgroundColor: 'rgba(65, 130, 235, 0.1)',
                border: '1px solid rgba(65, 130, 235, 0.3)',
                p: 1,
                borderRadius: '12px',
                color: '#4182EB', // icon color
              }}
              onClick={() => onEditRow()}
            >
              <Iconify icon="solar:pen-bold" width={20} height={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View" placement="top" arrow>
            <IconButton
              sx={{
                backgroundColor: 'rgba(65, 130, 235, 0.1)',
                border: '1px solid rgba(65, 130, 235, 0.3)',
                p: 1,
                borderRadius: '12px',
                color: '#4182EB',
              }}
              onClick={() => navigate(paths.dashboard.workflowInstance.reactFlow(row.id))}
            >
              <Iconify icon="carbon:view-filled" width={20} height={20} />
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

WorkflowInstanceTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onStatusChange: PropTypes.func,
};
