import { Card, Col, Row, Space, Spin, Tag, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Pie, type PieConfig } from "@ant-design/plots";
import api from "@/lib/api";

const { Title, Text } = Typography;

type StatusItem = { status: string; count: number };

function normalizeStatusStats(input: unknown): StatusItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const raw = item as Record<string, unknown>;
      const status =
        (typeof raw.status === "string" && raw.status) ||
        (typeof raw.order_status === "string" && raw.order_status) ||
        "unknown";
      const countRaw = raw.count ?? raw.total ?? 0;
      const count =
        typeof countRaw === "number"
          ? countRaw
          : Number.isFinite(Number(countRaw))
            ? Number(countRaw)
            : 0;
      return { status, count };
    })
    .filter((x) => x.count > 0);
}

const OrderStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", "orderStatusStats"],
    queryFn: () => api.dashboard.orderStatusStats(),
    staleTime: 5 * 60 * 1000,
  });

  const items = normalizeStatusStats(data);

  const config: PieConfig = {
    data: items.map((x) => ({ type: x.status, value: x.count })),
    angleField: "value",
    colorField: "type",
    innerRadius: 0.6,
    padding: 6,
    label: false,
    legend: { position: "bottom" },
    tooltip: { formatter: (datum) => ({ name: datum.type, value: String(datum.value) }) },
    statistic: {
      title: false,
      content: {
        style: { whiteSpace: "pre-wrap", overflow: "hidden", textOverflow: "ellipsis" },
        content: `${items.reduce((sum, x) => sum + x.count, 0)} orders`,
      },
    },
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div>
        <Title level={2} style={{ margin: 0 }}>
          Order Statistics
        </Title>
        <Text type="secondary">Breakdown of orders by status</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Status Distribution"
            extra={
              <a
                onClick={(e) => {
                  e.preventDefault();
                  refetch();
                }}
              >
                Refresh
              </a>
            }
          >
            {isLoading ? (
              <div style={{ height: 320, display: "grid", placeItems: "center" }}>
                <Spin />
              </div>
            ) : items.length > 0 ? (
              <Pie {...config} height={320} />
            ) : (
              <Text type="secondary">No order status data available</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Status Summary">
            {error ? (
              <Text type="danger">Failed to load order statistics</Text>
            ) : (
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {items.map((x) => (
                  <div
                    key={x.status}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Tag>{x.status}</Tag>
                    <Text strong>{x.count.toLocaleString()}</Text>
                  </div>
                ))}
                {items.length === 0 && !isLoading && (
                  <Text type="secondary">No data</Text>
                )}
              </Space>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default OrderStats;

