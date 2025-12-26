import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Tooltip,
  Typography,
  Dropdown,
  Flex,
  type MenuProps,
} from "antd";
import {
  ReloadOutlined,
  StopOutlined,
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TokenLog, TokenLogFilters } from "@/lib/types";
import api from "@/lib/api";
import TokenStatistics from "@/components/token/TokenStatistics";
import UserTokenManager from "@/components/token/UserTokenManager";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const TokenLogs = () => {
  const [tokenLogs, setTokenLogs] = useState<TokenLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<TokenLogFilters>({});
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Modal states
  const [blacklistModalVisible, setBlacklistModalVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenLog | null>(null);
  const [userTokenManagerVisible, setUserTokenManagerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blacklistForm] = Form.useForm();

  // Fetch token logs
  const fetchTokenLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...filters,
        start_date: dateRange?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
        end_date: dateRange?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
      };

      const response = await api.tokenLogs.list(params);
      setTokenLogs(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error: any) {
      message.error(error.message || "Failed to fetch token logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, filters, dateRange]);


  // Initial data fetch
  useEffect(() => {
    fetchTokenLogs();
  }, [fetchTokenLogs]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TokenLogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle blacklist
  const handleBlacklist = (record: TokenLog) => {
    setSelectedToken(record);
    setBlacklistModalVisible(true);
    blacklistForm.setFieldsValue({
      token_jti: record.token_jti,
      reason: "",
    });
  };

  // Handle manage user tokens
  const handleManageUserTokens = (user: any) => {
    setSelectedUser(user);
    setUserTokenManagerVisible(true);
  };

  // Confirm blacklist
  const confirmBlacklist = async (values: any) => {
    if (!selectedToken) return;

    try {
      await api.tokenLogs.blacklist({
        token_jti: selectedToken.token_jti,
        reason: values.reason,
      });
      message.success("Token blacklisted successfully");
      setBlacklistModalVisible(false);
      setSelectedToken(null);
      blacklistForm.resetFields();
      fetchTokenLogs();
    } catch (error: any) {
      message.error(error.message || "Failed to blacklist token");
    }
  };

  // Handle table pagination change
  const handleTableChange = (paginationConfig: any) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  // Action menu items
  const getActionMenuItems = (record: TokenLog): MenuProps["items"] => [
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
    },
    {
      key: "manage-user",
      label: "Manage User Tokens",
      icon: <UserOutlined />,
      onClick: () => handleManageUserTokens(record.user),
    },
    {
      key: "blacklist",
      label: "Blacklist Token",
      icon: <StopOutlined />,
      danger: true,
      disabled: record.is_blacklisted,
      onClick: () => handleBlacklist(record),
    },
  ];

  // Table columns
  const columns = [
    {
      title: "User",
      dataIndex: ["user", "username"],
      key: "user",
      width: 150,
      render: (username: string, record: TokenLog) => (
        <Space direction="vertical" size="small">
          <Text
            strong
            style={{ cursor: "pointer", color: "#1890ff" }}
            onClick={() => handleManageUserTokens(record.user)}
          >
            {username || `User #${record.user_id}`}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            ID: {record.user_id}
          </Text>
        </Space>
      ),
    },
    {
      title: "Token Type",
      dataIndex: "token_type",
      key: "token_type",
      width: 120,
      render: (type: string) => (
        <Tag color={type === "access" ? "blue" : "green"}>
          {type.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Access", value: "access" },
        { text: "Refresh", value: "refresh" },
      ],
      onFilter: (value: string, record: TokenLog) => record.token_type === value,
    },
    {
      title: "Status",
      dataIndex: "is_blacklisted",
      key: "status",
      width: 100,
      render: (isBlacklisted: boolean, record: TokenLog) => {
        const isExpired = dayjs().isAfter(dayjs(record.expires_at));
        if (isBlacklisted) {
          return <Tag color="red">BLACKLISTED</Tag>;
        }
        if (isExpired) {
          return <Tag color="orange">EXPIRED</Tag>;
        }
        return <Tag color="green">ACTIVE</Tag>;
      },
      filters: [
        { text: "Active", value: "active" },
        { text: "Expired", value: "expired" },
        { text: "Blacklisted", value: "blacklisted" },
      ],
      onFilter: (value: string, record: TokenLog) => {
        const isExpired = dayjs().isAfter(dayjs(record.expires_at));
        switch (value) {
          case "active":
            return !record.is_blacklisted && !isExpired;
          case "expired":
            return !record.is_blacklisted && isExpired;
          case "blacklisted":
            return record.is_blacklisted;
          default:
            return false;
        }
      },
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 140,
      render: (ip: string) => <Text code>{ip || "N/A"}</Text>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format("YYYY-MM-DD HH:mm:ss")}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "Expires",
      dataIndex: "expires_at",
      key: "expires_at",
      width: 180,
      render: (date: string) => {
        const expires = dayjs(date);
        const isExpired = dayjs().isAfter(expires);
        return (
          <Tooltip title={expires.format("YYYY-MM-DD HH:mm:ss")}>
            <Text type={isExpired ? "danger" : "secondary"}>
              {expires.fromNow()}
            </Text>
          </Tooltip>
        );
      },
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right" as const,
      render: (_: unknown, record: TokenLog) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Token Statistics Dashboard */}
      <TokenStatistics refreshInterval={30000} />

      {/* Main Content Card */}
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <Flex align="center" justify="space-between" wrap>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Token Management
              </Title>
              <Text type="secondary">
                Monitor and manage JWT tokens for user authentication
              </Text>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchTokenLogs}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Flex>

          {/* Filters */}
          <Space wrap>
            <Input.Search
              placeholder="Search by username, email, or JTI..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              enterButton
            />
            <Select
              placeholder="Token Type"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange("token_type", value)}
              options={[
                { label: "Access", value: "access" },
                { label: "Refresh", value: "refresh" },
              ]}
            />
            <Select
              placeholder="Status"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange("is_blacklisted", value)}
              options={[
                { label: "Active", value: false },
                { label: "Blacklisted", value: true },
              ]}
            />
            <RangePicker
              showTime
              placeholder={["Start Date", "End Date"]}
              onChange={handleDateRangeChange}
            />
          </Space>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={tokenLogs}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="small"
          />
        </Space>
      </Card>

      {/* Blacklist Modal */}
      <Modal
        title="Blacklist Token"
        open={blacklistModalVisible}
        onOk={() => blacklistForm.submit()}
        onCancel={() => {
          setBlacklistModalVisible(false);
          setSelectedToken(null);
          blacklistForm.resetFields();
        }}
        okText="Blacklist"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <Form
          form={blacklistForm}
          layout="vertical"
          onFinish={confirmBlacklist}
        >
          <Form.Item label="Token JTI">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Reason"
            name="reason"
            rules={[
              { required: true, message: "Please provide a reason for blacklisting" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter the reason for blacklisting this token..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* User Token Manager Modal */}
      <UserTokenManager
        visible={userTokenManagerVisible}
        onClose={() => {
          setUserTokenManagerVisible(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          fetchTokenLogs();
        }}
      />
    </Space>
  );
};

export default TokenLogs;