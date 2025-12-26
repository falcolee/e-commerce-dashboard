/**
 * Basic TypeScript types for pp-shop dashboard
 * Created when Swagger endpoint was not available
 */

export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  growthRate: number;
}

export interface SalesStats {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  orders: number;
  rank: number;
  imageUrl?: string;
}

export interface OrderStatusStats {
  status: string;
  count: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
}

// Standard pagination types
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}
