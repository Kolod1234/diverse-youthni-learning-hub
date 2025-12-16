import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export default function SearchBar({ value, onChange, sortBy, onSortChange }) {
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search courses, topics, instructors..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 h-12 bg-white border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-200 bg-white">
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange('popular')}>
            Most Popular
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('rating')}>
            Highest Rated
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('newest')}>
            Newest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('price_low')}>
            Price: Low to High
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('price_high')}>
            Price: High to Low
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}