import { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Dropdown,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Flex,
  Avatar,
  theme,
  Empty,
  Spin,
  Alert,
} from "antd";
import type { MenuProps } from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/lib/types";
import type {
  OverviewStats,
  SalesStats,
  TopProduct,
  OrderStatusStats,
  RevenueData
} from "@/types/generated";
import { DailyRevenue } from "@/components/dashboard/DailyRevenue";
import { DailyOrders } from "@/components/dashboard/DailyOrders";
import { NewCustomers } from "@/components/dashboard/NewCustomers";
import api from "@/lib/api";
import dayjs from "dayjs";
import { Select } from "antd";

const { Title, Text } = Typography;

const Dashboard = () => {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<"week" | "month">("week");

  // Real API calls for dashboard data
  const {
    data: overviewStats,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.overviewStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: recentOrders,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['dashboard', 'recentOrders'],
    queryFn: () => api.dashboard.recentOrders(7),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ['dashboard', 'revenue', dateRange],
    queryFn: () => api.dashboard.revenueByPeriod(dateRange === 'week' ? 'daily' : 'weekly'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: topProducts,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['dashboard', 'topProducts', dateRange],
    queryFn: () => api.dashboard.topProducts(dateRange, 4),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const {
    data: salesData,
    isLoading: salesLoading,
    refetch: refetchSales
  } = useQuery({
    queryKey: ['dashboard', 'sales', dateRange],
    queryFn: () => api.dashboard.salesStats(dateRange === 'week' ? 'daily' : 'weekly'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers
  } = useQuery({
    queryKey: ['dashboard', 'customers', dateRange],
    queryFn: () => api.dashboard.salesStats(dateRange === 'week' ? 'daily' : 'weekly').then(data =>
      data.map(item => ({
        ...item,
        value: Math.floor(item.total_revenue / 50) // Estimated customers based on revenue
      }))
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle refresh all data
  const handleRefreshAll = () => {
    refetchOverview();
    refetchOrders();
    refetchRevenue();
    refetchProducts();
    refetchSales();
    refetchCustomers();
  };

  // Loading state for overall dashboard
  const isInitialLoading = overviewLoading || ordersLoading || revenueLoading;

  // Error state
  const hasErrors = overviewError || ordersError || revenueError || productsError;

  const recentOrdersTableData = recentOrders?.map((o) => ({
    ...o,
    orderKey: o.order_key,
    orderTotal: o.order_total,
    orderStatus: o.order_status,
  })) || [];

  const trendingProducts = topProducts?.map((p, index) => ({
    id: p.product_id,
    name: p.product_name,
    sku: p.sku,
    imageUrl: p.image_url ?? p.imageUrl,
    totalRevenue: p.total_revenue,
    totalSold: p.total_sold,
    rank: index + 1,
    price: p.total_sold > 0 ? p.total_revenue / p.total_sold : 0,
  })) || [];

  // Transform revenue data for charts
  const transformedRevenueData = revenueData?.map(item => ({
    timeText: dayjs(item.date || item.period).format("YYYY-MM-DD"),
    value: item.revenue,
    state: "revenue",
  })) || [];

  // Transform sales data for charts
  const transformedSalesData = salesData?.map(item => ({
    timeText: dayjs(item.period).format("YYYY-MM-DD"),
    value: item.total_orders,
    state: "orders",
  })) || [];

  // Transform customer data for charts
  const transformedCustomersData = customersData?.map(item => ({
    timeText: dayjs(item.date || item.period).format("YYYY-MM-DD"),
    value: item.value,
    state: "customers",
  })) || [];

  const getActionMenuItems = (record: Order): MenuProps["items"] => [
    {
      key: "view",
      label: "View Order",
      icon: <EyeOutlined />,
      onClick: () => {
        // Navigate to order details
        window.location.href = `/admin/orders/${record.id}`;
      },
    },
  ];

  const orderColumns = [
    {
      title: "Order",
      dataIndex: "orderKey",
      key: "orderKey",
      width: 150,
      render: (text: string) => <span className="font-semibold">#{text}</span>,
    },
    {
      title: "Total",
      dataIndex: "orderTotal",
      key: "orderTotal",
      width: 120,
      render: (total: number) => (
        <span className="font-semibold">${total?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      width: 100,
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: "green",
          processing: "blue",
          pending: "orange",
          cancelled: "red",
        };
        return (
          <Tag color={colors[status?.toLowerCase()] || "default"}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      fixed: "right" as const,
      render: (_: unknown, record: Order) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Create stat cards from real data
  const statCards = [
    {
      title: "Daily Revenue",
      value: overviewStats ? `US$${overviewStats.total_revenue?.toFixed(2) || '0.00'}` : "$0.00",
      trend: 0,
      iconBg: "rgba(22, 119, 255, 0.12)",
      iconColor: token.colorPrimary,
      icon: <DollarOutlined />,
      chart: <DailyRevenue data={transformedRevenueData} height={140} loading={revenueLoading} />,
      loading: revenueLoading,
    },
    {
      title: "Daily Orders",
      value: overviewStats?.total_orders || 0,
      trend: 8, // Would come from API
      iconBg: "rgba(250, 140, 22, 0.12)",
      iconColor: "#fa8c16",
      icon: <ShoppingCartOutlined />,
      chart: <DailyOrders data={transformedSalesData} height={140} loading={salesLoading} />,
      loading: salesLoading,
    },
    {
      title: "New Customers",
      value: overviewStats?.total_users || 0,
      trend: 5, // Would come from API
      iconBg: "rgba(19, 194, 194, 0.12)",
      iconColor: "#13c2c2",
      icon: <UserOutlined />,
      chart: <NewCustomers data={transformedCustomersData} height={140} loading={customersLoading} />,
      loading: customersLoading,
    },
  ];

  // Show loading state for initial load
  if (isInitialLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16 }}>
          Loading dashboard...
        </Title>
      </div>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Flex align="center" justify="space-between" wrap>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Overview
          </Title>
          <Text type="secondary">Key metrics of your store performance</Text>
        </div>
        <Space>
          <Select
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 180 }}
            options={[
              { value: "week", label: "Last 7 days" },
              { value: "month", label: "Last 30 days" },
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshAll}
            loading={overviewLoading || ordersLoading}
          >
            Refresh
          </Button>
        </Space>
      </Flex>

      {hasErrors && (
        <Alert
          message="Data Loading Error"
          description="Some dashboard data could not be loaded. Please try refreshing the page."
          type="error"
          showIcon
          closable
          action={
            <Button size="small" onClick={handleRefreshAll}>
              Retry
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col key={card.title} xs={24} md={8}>
            <Card
              styles={{ body: { padding: 16 } }}
              variant="borderless"
              className="shadow-sm"
              loading={card.loading}
            >
              <Flex align="center" justify="space-between" gap={12} wrap>
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: card.iconBg,
                      display: "grid",
                      placeItems: "center",
                      color: card.iconColor,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <Text type="secondary">{card.title}</Text>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Title level={4} style={{ margin: 0 }}>
                        {card.value}
                      </Title>
                      <Text
                        type={card.trend >= 0 ? "success" : "danger"}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {card.trend >= 0 ? (
                          <ArrowUpOutlined />
                        ) : (
                          <ArrowDownOutlined />
                        )}
                        {Math.abs(card.trend)}%
                      </Text>
                    </div>
                  </div>
                </Flex>
              </Flex>
              <div style={{ marginTop: 12 }}>{card.chart}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card variant="borderless" className="shadow-sm">
            <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(250, 84, 28, 0.1)",
                  display: "grid",
                  placeItems: "center",
                  color: "#fa541c",
                }}
              >
                <ShoppingCartOutlined />
              </div>
              <Title level={4} style={{ margin: 0 }}>
                Recent Orders
              </Title>
            </Flex>
            {recentOrders && recentOrders.length > 0 ? (
              <Table
                columns={orderColumns}
                dataSource={recentOrdersTableData}
                rowKey="id"
                pagination={{ pageSize: 7, size: "small" }}
                scroll={{ x: 800 }}
                size="small"
                loading={ordersLoading}
              />
            ) : (
              <Empty
                description="No recent orders found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="shadow-sm">
            <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(24, 144, 255, 0.12)",
                  display: "grid",
                  placeItems: "center",
                  color: token.colorPrimary,
                }}
              >
                <RiseOutlined />
              </div>
              <Title level={4} style={{ margin: 0 }}>
                Trending Products
              </Title>
            </Flex>
            {trendingProducts.length > 0 ? (
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                {trendingProducts.map((product) => (
                  <Flex key={product.id} align="center" gap={12}>
                    <Avatar
                      shape="square"
                      size={56}
                      src={product.imageUrl}
                      style={{ backgroundColor: token.colorFillSecondary }}
                    >
                      {product.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text strong ellipsis>
                          {product.name}
                        </Text>
                        <Tag
                          color={
                            product.rank === 1
                              ? "gold"
                              : product.rank === 2
                                ? "blue"
                                : "purple"
                          }
                        >
                          #{product.rank}
                        </Tag>
                      </div>
                      <Text strong>{`US$${product.price?.toFixed(2) || '0.00'}`}</Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Ordered {product.totalSold || 0} times
                        </Text>
                      </div>
                    </div>
                  </Flex>
                ))}
              </Space>
            ) : (
              <Empty
                description="No trending products found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;
