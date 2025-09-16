import PropTypes from 'prop-types';
import { Card, Box, Typography, Stack, Button, Divider } from '@mui/material';
import Iconify from 'src/components/iconify';
import { format } from 'date-fns';

export default function ProcessTypeTableGrid({ row, onViewRow, onQueryRow }) {
  const { processType, description, createdAt, documents } = row;

  const hasDocuments = documents && documents.length > 0;

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      {/* Top Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="mdi:file-document-outline" width={20} color="#2e5aac" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Process Name
              </Typography>
              <Typography variant="subtitle1">{processType}</Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1,
            borderRadius: 1,
            border: '1px solid #ccc',
            bgcolor: '#f9f9f9',
            fontSize: 14,
            color: 'text.secondary',
            minWidth: 100,
            textAlign: 'center',
          }}
        >
          {hasDocuments ? `${documents.length} Documents` : 'No Documents'}
        </Box>
      </Stack>

      {/* Divider */}
      <Divider sx={{ my: 2 }} />

      {/* Middle Info Section */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:calendar-month-outline" width={20} color="#5ac267" />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Date and Time
            </Typography>
            <Typography variant="body2">
              {format(new Date(createdAt), 'dd MMM, yyyy, hh:mm a')}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:file-document-outline" width={20} color="#2e5aac" />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Process Description
            </Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Bottom Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#9da7b3',
            color: 'white',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
          }}
          onClick={onViewRow}
        >
          View Documents
        </Button>

        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#9da7b3',
            color: 'white',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 500,
          }}
          onClick={onQueryRow}
        >
          Query Documents
        </Button>
      </Stack>
    </Card>
  );
}

ProcessTypeTableGrid.propTypes = {
  onViewRow: PropTypes.func,
  onQueryRow: PropTypes.func,
  row: PropTypes.shape({
    processType: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string,
    documents: PropTypes.array,
  }),
};
