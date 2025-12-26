/**
 * Enhanced Data Table Component
 *
 * A reusable data table component with built-in pagination support for backend APIs.
 * Integrates with useApiQueryWithPagination hook for seamless data fetching.
 */

import * as React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { useApiQueryWithPagination } from '@/hooks/useApiQueryWithPagination';
import { QueryParams } from '@/lib/queryBuilder';
import type { Pagination } from '@/lib/types';

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
 * Enhanced DataTable props interface
 */
export interface EnhancedDataTableProps<T extends { id: string | number }> {
  columns: ColumnDefinition<T>[];
  queryKey: string[];
  queryFn: (params: QueryParams) => Promise<{ items: T[]; pagination: Pagination }>;
  initialParams?: QueryParams;
  searchable?: boolean;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  emptyMessage?: string;
  ariaLabel?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
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
 * Enhanced Pagination controls component
 */
function EnhancedPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage,
  goToFirst,
  goToLast,
  goToNext,
  goToPrevious,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToFirst: () => void;
  goToLast: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
}) {
  const { total, page, pageSize, totalPages } = pagination;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('...');
        pages.push(totalPages);
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
          onClick={goToFirst}
          disabled={!hasPreviousPage}
          aria-label="Go to first page"
          aria-disabled={!hasPreviousPage}
        >
          First
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={!hasPreviousPage}
          aria-label="Go to previous page"
          aria-disabled={!hasPreviousPage}
        >
          Previous
        </Button>

        <div className="hidden items-center gap-1 sm:flex">{renderPageNumbers()}</div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={!hasNextPage}
          aria-label="Go to next page"
          aria-disabled={!hasNextPage}
        >
          Next
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToLast}
          disabled={!hasNextPage}
          aria-label="Go to last page"
          aria-disabled={!hasNextPage}
        >
          Last
        </Button>
      </div>

      <Select
        value={String(pageSize)}
        onValueChange={(value) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-[140px]" aria-label="Items per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 per page</SelectItem>
          <SelectItem value="20">20 per page</SelectItem>
          <SelectItem value="50">50 per page</SelectItem>
          <SelectItem value="100">100 per page</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Search and filter controls component
 */
function SearchAndFilter<T>({
  columns,
  onSearch,
  searchable,
}: {
  columns: ColumnDefinition<T>[];
  onSearch?: (query: string) => void;
  searchable?: boolean;
}) {
  const [searchValue, setSearchValue] = React.useState('');
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

  if (!searchable) return null;

  return (
    <div className="mb-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search..."
          aria-label="Search table"
          className="pl-9"
        />
      </div>
    </div>
  );
}

/**
 * Main Enhanced DataTable component
 */
export function EnhancedDataTable<T extends { id: string | number }>({
  columns,
  queryKey,
  queryFn,
  initialParams = {},
  searchable = false,
  selectable = false,
  bulkActions = [],
  emptyMessage = 'No data available',
  ariaLabel = 'Data table',
  className,
  onRowClick,
  rowClassName,
}: EnhancedDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(new Set());

  const {
    data,
    pagination,
    isLoading,
    error,
    params,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    hasNextPage,
    hasPreviousPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
  } = useApiQueryWithPagination(queryKey, queryFn, initialParams);

  const handleSort = (field: string) => {
    const currentSort = params.sortBy;
    const currentOrder = params.order || 'asc';

    let newOrder: 'asc' | 'desc' = 'asc';
    let newSortBy = field;

    if (currentSort === field) {
      // Toggle order if same field
      newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    }

    setSort(newSortBy, newOrder);
  };

  const handleSelectAll = () => {
    if (!data) return;

    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = new Set(data.map((row) => row.id));
      setSelectedRows(allIds);
    }
  };

  const handleToggleRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleRowClick = (row: T) => {
    onRowClick?.(row);
  };

  const renderCell = (column: ColumnDefinition<T>, value: unknown, row: T) => {
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

  const renderTableBody = () => {
    if (isLoading) {
      return <LoadingSkeleton columns={columns} />;
    }

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-24 text-center">
              <div className="text-destructive">
                Error loading data: {(error as Error).message}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (!data || data.length === 0) {
      return <EmptyState message={emptyMessage} />;
    }

    return (
      <TableBody>
        {data.map((row) => (
          <TableRow
            key={row.id}
            className={cn(
              onRowClick && "cursor-pointer hover:bg-muted/50",
              rowClassName?.(row)
            )}
            onClick={() => handleRowClick(row)}
          >
            {selectable && (
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedRows.has(row.id)}
                  onCheckedChange={() => handleToggleRow(row.id)}
                  aria-label={`Select row ${row.id}`}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(`text-${column.align || 'left'}`)}
              >
                {renderCell(column, (row as any)[column.key], row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <SearchAndFilter columns={columns} onSearch={setSearch} searchable={searchable} />

      <div className="overflow-x-auto rounded-md border">
        <Table
          role="table"
          aria-label={ariaLabel}
        >
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead role="columnheader" className="w-12">
                  <Checkbox
                    checked={data && selectedRows.size === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  aria-sort={
                    params.sortBy === column.key
                      ? params.order === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50',
                    column.width,
                    `text-${column.align || 'left'}`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <SortIcon
                        field={column.key}
                        current={params.sortBy || null}
                        order={params.order || 'asc'}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {renderTableBody()}
        </Table>
      </div>

      {pagination && (
        <EnhancedPagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          goToFirst={goToFirstPage}
          goToLast={goToLastPage}
          goToNext={goToNextPage}
          goToPrevious={goToPreviousPage}
        />
      )}
    </div>
  );
}

export default EnhancedDataTable;