import React, { useState } from 'react';
import { TextField, Button, Menu, MenuItem, ListSubheader, Divider, InputAdornment, Box } from '@mui/material';
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

  return (
    <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
      <TextField
        fullWidth
        type="text"
        placeholder="Search courses, topics, instructors..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          sx: { height: 48, borderRadius: 4, bgcolor: 'background.paper', fontSize: '1rem' },
        }}
      />

      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<TuneIcon />}
        sx={{ height: 48, px: 2.5, borderRadius: 4, bgcolor: 'background.paper', fontWeight: 600, whiteSpace: 'nowrap' }}
      >
        Sort
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 192, mt: 0.5 } }}
      >
        <ListSubheader sx={{ lineHeight: '32px' }}>Sort by</ListSubheader>
        <Divider />
        {SORT_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={sortBy === opt.value}
            onClick={() => {
              onSortChange(opt.value);
              setAnchorEl(null);
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}