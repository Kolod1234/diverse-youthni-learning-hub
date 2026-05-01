import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  ListSubheader,
  Divider,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'teachers', label: 'By Teachers' },
];

export default function SearchBar({ value, onChange, sortBy, onSortChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSort = (sortValue) => {
    onSortChange(sortValue);
    handleClose();
  };

  return (
    <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
      <TextField
        type="text"
        placeholder="Search courses, topics, instructors..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          sx: {
            height: 48,
            borderRadius: 3,
            bgcolor: 'background.paper',
            fontSize: '1rem',
          },
        }}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },
        }}
      />

      <Button
        variant="outlined"
        onClick={handleOpen}
        startIcon={<TuneIcon />}
        sx={{
          height: 48,
          px: 2,
          borderRadius: 3,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 600,
          flexShrink: 0,
          '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' },
        }}
      >
        Sort
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { minWidth: 192, mt: 0.5, borderRadius: 2 } }}
      >
        <ListSubheader sx={{ lineHeight: '32px', fontWeight: 700 }}>Sort by</ListSubheader>
        <Divider sx={{ my: 0.5 }} />
        {SORT_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={sortBy === opt.value}
            onClick={() => handleSort(opt.value)}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}