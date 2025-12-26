import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
  List,
  Avatar,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  KeyOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TokenLogStatistics } from "@/lib/types";
import api from "@/lib/api";

const { Title, Text } = Typography;

interface TokenStatisticsProps {
  refreshInterval?: number; // in milliseconds
}

const TokenStatistics = ({ refreshInterval = 30000 }: TokenStatisticsProps) => {
  const [statistics, setStatistics] = useState<TokenLogStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const stats = await api.tokenLogs.statistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatistics, refreshInterval]);

  if (!statistics) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Loading token statistics...</Text>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate percentages
  const activePercentage = statistics.total_tokens > 0
    ? (statistics.active_tokens / statistics.total_tokens) * 100
    : 0;
  const blacklistedPercentage = statistics.total_tokens > 0
    ? (statistics.blacklisted_tokens / statistics.total_tokens) * 100
    : 0;
  const expiredPercentage = statistics.total_tokens > 0
    ? (statistics.expired_tokens / statistics.total_tokens) * 100
    : 0;

  // Token type distribution
  const accessTokenPercentage = statistics.total_tokens > 0
    ? (statistics.access_tokens / statistics.total_tokens) * 100
    : 0;
  const refreshTokenPercentage = statistics.total_tokens > 0
    ? (statistics.refresh_tokens / statistics.total_tokens) * 100
    : 0;

  // Columns for user token table
  const userTokenColumns = [
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (username: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{username}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              ID: {record.user_id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Token Count",
      dataIndex: "token_count",
      key: "token_count",
      render: (count: number) => (
        <Tag color={count > 10 ? "red" : count > 5 ? "orange" : "green"}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: any) => {
        if (record.token_count > 10) {
          return <Tag color="red">High Activity</Tag>;
        } else if (record.token_count > 5) {
          return <Tag color="orange">Moderate Activity</Tag>;
        }
        return <Tag color="green">Normal Activity</Tag>;
      },
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Overview Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Tokens"
              value={statistics.total_tokens}
              prefix={<KeyOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Tokens"
              value={statistics.active_tokens}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
            <Progress
              percent={activePercentage}
              strokeColor="#3f8600"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Blacklisted"
              value={statistics.blacklisted_tokens}
              valueStyle={{ color: "#cf1322" }}
              prefix={<StopOutlined />}
              loading={loading}
            />
            <Progress
              percent={blacklistedPercentage}
              strokeColor="#cf1322"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Expired"
              value={statistics.expired_tokens}
              valueStyle={{ color: "#d46b08" }}
              prefix={<ClockCircleOutlined />}
              loading={loading}
            />
            <Progress
              percent={expiredPercentage}
              strokeColor="#d46b08"
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Token Type Distribution */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Token Type Distribution" loading={loading}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Space justify="space-between" style={{ width: "100%" }}>
                  <Text>Access Tokens</Text>
                  <Text strong>{statistics.access_tokens}</Text>
                </Space>
                <Progress
                  percent={accessTokenPercentage}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
              <div>
                <Space justify="space-between" style={{ width: "100%" }}>
                  <Text>Refresh Tokens</Text>
                  <Text strong>{statistics.refresh_tokens}</Text>
                </Space>
                <Progress
                  percent={refreshTokenPercentage}
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Token Health Status" loading={loading}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Space justify="space-between" style={{ width: "100%" }}>
                  <Text>Healthy Tokens</Text>
                  <Text strong>{statistics.active_tokens}</Text>
                </Space>
                <Progress
                  percent={activePercentage}
                  strokeColor="#52c41a"
                  size="small"
                />
              </div>
              <div>
                <Space justify="space-between" style={{ width: "100%" }}>
                  <Text>Problematic Tokens</Text>
                  <Text strong>{statistics.blacklisted_tokens + statistics.expired_tokens}</Text>
                </Space>
                <Progress
                  percent={blacklistedPercentage + expiredPercentage}
                  strokeColor="#ff4d4f"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* User Token Activity and Recent Tokens */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="User Token Activity"
            loading={loading}
            size="small"
          >
            <Table
              dataSource={statistics.tokens_by_user}
              columns={userTokenColumns}
              pagination={{ pageSize: 5, size: "small" }}
              rowKey="user_id"
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Recent Token Activity"
            loading={loading}
            size="small"
          >
            <List
              dataSource={statistics.recent_tokens.slice(0, 5)}
              renderItem={(token) => (
                <List.Item>
                  <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <Space>
                      <Text strong>{token.user?.username || `User #${token.user_id}`}</Text>
                      <Tag color={token.token_type === "access" ? "blue" : "green"}>
                        {token.token_type.toUpperCase()}
                      </Tag>
                      {token.is_blacklisted && (
                        <Tag color="red">BLACKLISTED</Tag>
                      )}
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        IP: {token.ip_address || "N/A"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {dayjs(token.created_at).fromNow()}
                      </Text>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default TokenStatistics;