import PropTypes from 'prop-types';
import { Card, Box, Typography, Stack, Button, IconButton } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function WorkflowTableGrid({ row, onViewRow, onQueryRow, onEdit, onDelete }) {
  const { name, description } = row;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
        maxWidth: 520,
        width: '100%',
        mx: 'auto',
      }}
    >
      {/* Top Section: Title & Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#e6f0fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:file-document-outline" width={22} color="#2e5aac" />
          </Box>
          <Box>
            <Typography variant="caption" color="#9ca3af" fontWeight={500}>
              Workflow Name
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {name}
            </Typography>
          </Box>
        </Stack>

        {/* Edit/Delete Icons */}
        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ backgroundColor: '#f0f8ff' }} onClick={onEdit}>
            <Iconify icon="mdi:pencil-outline" width={18} color="#2e5aac" />
          </IconButton>
          <IconButton size="small" sx={{ backgroundColor: '#ffe5e5' }} onClick={onDelete}>
            <Iconify icon="mdi:delete-outline" width={18} color="#d32f2f" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Description */}
      <Stack direction="row" spacing={2} mt={3}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#fff1ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="mdi:clipboard-text-outline" width={22} color="#f97316" />
        </Box>
        <Box>
          <Typography variant="caption" color="#9ca3af" fontWeight={500}>
            Workflow Description
          </Typography>
          <Typography variant="body2" mt={0.5}>
            {description || '—'}
          </Typography>
        </Box>
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} mt={4} justifyContent="center">
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#2e5aac',
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#4182EB' },
          }}
          onClick={onViewRow}
        >
          View Documents
        </Button>

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#2e5aac',
            borderRadius: '25px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { backgroundColor: '#4182EB' },
          }}
          onClick={onQueryRow}
        >
          Interact With Documents
        </Button>
      </Stack>
    </Card>
  );
}

WorkflowTableGrid.propTypes = {
  onViewRow: PropTypes.func,
  onQueryRow: PropTypes.func,
  row: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
