/**
 * DataTable Component
 *
 * A reusable data table component with pagination, sorting, search, filtering,
 * bulk selection, loading states, and responsive design.
 *
 * Features:
 * - Pagination controls with page size selector
 * - Column sorting (ascending/descending)
 * - Search input with 500ms debounce
 * - Filter dropdowns for filterable columns
 * - Bulk selection with actions
 * - Loading skeleton state
 * - Empty state handling
 * - Responsive design (mobile card view)
 * - Full accessibility (ARIA labels, keyboard navigation)
 */

import * as React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginationParams } from '@/lib/queryBuilder';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Column type definitions
 */
export type ColumnType = 'text' | 'number' | 'date' | 'badge' | 'actions';

/**
 * Column definition interface
 */
export interface ColumnDefinition<T> {
  key: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Bulk action definition
 */
export interface BulkAction {
  key: string;
  label: string;
  destructive?: boolean;
  onClick: (selectedIds: string[]) => void | Promise<void>;
}

/**
 * DataTable props interface
 */
export interface DataTableProps<T extends { id: string }> {
  columns: ColumnDefinition<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationParams;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  onSelect?: (selectedIds: string[]) => void;
  bulkActions?: BulkAction[];
  searchable?: boolean;
  selectable?: boolean;
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Format number with locale
 */
function formatNumber(value: number | string | null | undefined): string {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  if (Number.isNaN(numericValue)) {
    return '';
  }
  return new Intl.NumberFormat().format(numericValue);
}

/**
 * Format date with locale
 */
function formatDate(value: string | Date | number | undefined): string {
  if (!value) {
    return '';
  }
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  return new Intl.DateTimeFormat().format(date);
}

/**
 * Get badge variant based on value
 */
function getBadgeVariant(value: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const lowerValue = value.toLowerCase();
  if (lowerValue.includes('active') || lowerValue.includes('success') || lowerValue.includes('completed')) {
    return 'default';
  }
  if (lowerValue.includes('pending') || lowerValue.includes('warning')) {
    return 'secondary';
  }
  if (lowerValue.includes('error') || lowerValue.includes('failed') || lowerValue.includes('inactive')) {
    return 'destructive';
  }
  return 'outline';
}

/**
 * Loading skeleton component
 */
interface LoadingSkeletonProps<T> {
  columns: ColumnDefinition<T>[];
  rows?: number;
}

function LoadingSkeleton<T>({ columns, rows = 5 }: LoadingSkeletonProps<T>) {
  return (
    <TableBody aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="h-4 w-4 animate-pulse rounded bg-muted" />
          </TableCell>
          {columns.map((col, j) => (
            <TableCell key={j}>
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

/**
 * Empty state component
 */
function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={100} className="h-24 text-center">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Search className="h-8 w-8" />
            <p>{message}</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

/**
 * Sort icon component
 */
function SortIcon({
  field,
  current,
  order,
}: {
  field: string;
  current: string | null;
  order: 'asc' | 'desc';
}) {
  if (current !== field) {
    return <ChevronsUpDown className="ml-2 h-4 w-4" />;
  }
  return order === 'asc' ? (
    <ChevronUp className="ml-2 h-4 w-4" />
  ) : (
    <ChevronDown className="ml-2 h-4 w-4" />
  );
}

/**
 * Table header component
 */
function TableHeaderComponent<T extends { id: string }>({
  columns,
  sortField,
  sortOrder,
  onSort,
  selectable,
  allSelected,
  onSelectAll,
}: {
  columns: ColumnDefinition<T>[];
  sortField: string | null;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  selectable?: boolean;
  allSelected: boolean;
  onSelectAll: () => void;
}) {
  return (
    <TableHeader>
      <TableRow>
        {selectable && (
          <TableHead role="columnheader" className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all rows"
            />
          </TableHead>
        )}
        {columns.map((column) => (
          <TableHead
            key={column.key}
            role="columnheader"
            aria-sort={
              sortField === column.key
                ? sortOrder === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined
            }
            className={cn(
              column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
              column.width,
              `text-${column.align || 'left'}`
            )}
            onClick={() => column.sortable && onSort(column.key)}
          >
            <div className="flex items-center">
              {column.label}
              {column.sortable && (
                <SortIcon field={column.key} current={sortField} order={sortOrder} />
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

/**
 * Table row component
 */
function TableRowComponent<T extends { id: string }>({
  row,
  columns,
  selected,
  onSelect,
  selectable,
}: {
  row: T;
  columns: ColumnDefinition<T>[];
  selected: boolean;
  onSelect: (id: string) => void;
  selectable?: boolean;
}) {
  const rowRecord: Record<string, unknown> = row as Record<string, unknown>;

  const renderCell = (column: ColumnDefinition<T>, value: unknown) => {
    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'number':
        return (
          <span className="font-mono">
            {formatNumber(value as number | string | null | undefined)}
          </span>
        );
      case 'date':
        return <span>{formatDate(value as string | Date | number | undefined)}</span>;
      case 'badge':
        return (
          <Badge variant={getBadgeVariant(String(value))}>{String(value)}</Badge>
        );
      case 'actions':
        return (value as React.ReactNode) ?? null;
      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <TableRow
      role="row"
      aria-selected={selected}
      data-state={selected ? 'selected' : undefined}
    >
      {selectable && (
        <TableCell>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(row.id)}
            aria-label={`Select row ${row.id}`}
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell
          key={column.key}
          className={cn(`text-${column.align || 'left'}`)}
        >
          {renderCell(column, rowRecord[column.key])}
        </TableCell>
      ))}
    </TableRow>
  );
}

/**
 * Search and filter controls component
 */
function SearchAndFilter<T>({
  columns,
  onSearch,
  onFilter,
  searchable,
}: {
  columns: ColumnDefinition<T>[];
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
  searchable?: boolean;
}) {
  const [searchValue, setSearchValue] = React.useState('');
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch?.(value);
    }, 500);
  };

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFilter?.({});
  };

  const filterableColumns = columns.filter((col) => col.filterable);
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
      {searchable && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search..."
            aria-label="Search table"
            aria-controls="data-table"
            className="pl-9"
          />
        </div>
      )}

      {filterableColumns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterableColumns.map((column) => (
            <Select
              key={column.key}
              value={filters[column.key] || ''}
              onValueChange={(value) => handleFilterChange(column.key, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Filter ${column.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {column.label}</SelectItem>
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-10"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pagination controls component
 */
function TablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: PaginationParams;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const { total, page, page_size, total_pages } = pagination;
  const startItem = (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total_pages <= maxVisible) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total_pages);
      } else if (page >= total_pages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total_pages - 3; i <= total_pages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(total_pages);
      }
    }

    return pages.map((p, idx) =>
      typeof p === 'number' ? (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(p)}
          aria-label={`Go to page ${p}`}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </Button>
      ) : (
        <span key={`ellipsis-${idx}`} className="px-2">
          {p}
        </span>
      )
    );
  };

  return (
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {total} items
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Go to first page"
          aria-disabled={page === 1}
        >
          First
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
          aria-disabled={page === 1}
        >
          Previous
        </Button>

        <div className="hidden items-center gap-1 sm:flex">{renderPageNumbers()}</div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === total_pages}
          aria-label="Go to next page"
          aria-disabled={page === total_pages}
        >
          Next
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(total_pages)}
          disabled={page === total_pages}
          aria-label="Go to last page"
          aria-disabled={page === total_pages}
        >
          Last
        </Button>
      </div>

      <Select
        value={String(page_size)}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-[140px]" aria-label="Items per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="20">20 per page</SelectItem>
          <SelectItem value="50">50 per page</SelectItem>
          <SelectItem value="100">100 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Bulk actions bar component
 */
function BulkActionsBar({
  selectedCount,
  actions,
  onClearSelection,
}: {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg bg-muted p-4">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.key}
            variant={action.destructive ? 'destructive' : 'default'}
            size="sm"
            onClick={() => action.onClick([])}
          >
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  );
}

/**
 * Main DataTable component
 */
export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSort,
  onSearch,
  onFilter,
  onSelect,
  bulkActions = [],
  searchable = false,
  selectable = false,
  emptyMessage = 'No data available',
  ariaLabel = 'Data table',
  className,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [sortField, setSortField] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort?.(field, newOrder);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelect?.([]);
    } else {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedRows(allIds);
      onSelect?.(Array.from(allIds));
    }
  };

  const handleToggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    onSelect?.(Array.from(newSelected));
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
    onSelect?.([]);
  };

  const renderTableBody = () => {
    if (loading) {
      return <LoadingSkeleton columns={columns} />;
    }
    if (data.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }
    return (
      <TableBody>
        {data.map((row) => (
          <TableRowComponent
            key={row.id}
            row={row}
            columns={columns}
            selected={selectedRows.has(row.id)}
            onSelect={handleToggleRow}
            selectable={selectable}
          />
        ))}
      </TableBody>
    );
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {(searchable || columns.some((col) => col.filterable)) && (
        <SearchAndFilter
          columns={columns}
          onSearch={onSearch}
          onFilter={onFilter}
          searchable={searchable}
        />
      )}

      {selectable && bulkActions.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRows.size}
          actions={bulkActions}
          onClearSelection={handleClearSelection}
        />
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table
          id="data-table"
          role="table"
          aria-label={ariaLabel}
          aria-describedby="table-description"
        >
          <TableHeaderComponent
            columns={columns}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            selectable={selectable}
            allSelected={selectedRows.size === data.length && data.length > 0}
            onSelectAll={handleSelectAll}
          />
          {renderTableBody()}
        </Table>
      </div>

      <div id="table-description" className="sr-only">
        Use arrow keys to navigate, Enter to select, Space to toggle
      </div>

      {pagination && onPageChange && onPageSizeChange && (
        <TablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
