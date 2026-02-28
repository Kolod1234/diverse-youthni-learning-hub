import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination bar.
 * Props:
 *   page        - current 0-based page index
 *   totalItems  - total number of items
 *   pageSize    - items per page (default 20)
 *   onPageChange - (newPage: number) => void
 */
export default function PaginationBar({ page, totalItems, pageSize = 20, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalItems);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Showing {from}–{to} of {totalItems}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton size="small" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
          <ChevronLeft size={18} />
        </IconButton>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          // Show first, last, and pages around current
          let pageNum;
          if (totalPages <= 7) {
            pageNum = i;
          } else if (i === 0) {
            pageNum = 0;
          } else if (i === 6) {
            pageNum = totalPages - 1;
          } else if (page < 4) {
            pageNum = i;
          } else if (page > totalPages - 5) {
            pageNum = totalPages - 7 + i;
          } else {
            pageNum = page - 3 + i;
          }
          const isEllipsis = totalPages > 7 && (
            (i === 1 && pageNum > 1) || (i === 5 && pageNum < totalPages - 2)
          );
          if (isEllipsis) {
            return <Typography key={i} variant="caption" sx={{ px: 0.5, color: 'text.disabled' }}>…</Typography>;
          }
          return (
            <Button
              key={pageNum}
              size="small"
              variant={pageNum === page ? 'contained' : 'outlined'}
              onClick={() => onPageChange(pageNum)}
              sx={{ minWidth: 32, px: 1, py: 0.25, fontSize: '0.75rem', lineHeight: 1.6 }}
            >
              {pageNum + 1}
            </Button>
          );
        })}
        <IconButton size="small" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
          <ChevronRight size={18} />
        </IconButton>
      </Box>
    </Box>
  );
}