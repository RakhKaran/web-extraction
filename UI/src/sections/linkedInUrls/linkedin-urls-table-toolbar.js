import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
// components
import Iconify from 'src/components/iconify';

// ---

export default function LinkedInUrlsTableToolbar({
  filters,
  onFilters,
  canReset,
  onResetFilters,
}) {
  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <TextField
        fullWidth
        placeholder="Search company..."
        value={filters.company}
        onChange={(event) => onFilters('company', event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* {canReset && (
        <Button
          variant="outlined"
          color="inherit"
          onClick={onResetFilters}
          startIcon={<Iconify icon="eva:refresh-fill" />}
        >
          Reset
        </Button>
      )} */}
    </Stack>
  );
}

LinkedInUrlsTableToolbar.propTypes = {
  canReset: PropTypes.bool,
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
};
