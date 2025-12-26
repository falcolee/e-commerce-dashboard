import { useState, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Typography,
  Alert,
  List,
  Tag,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { BlacklistUserTokensRequest } from "@/lib/types";
import api from "@/lib/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface UserTokenManagerProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    email: string;
    display_name: string;
  };
  onSuccess?: () => void;
}

const UserTokenManager = ({
  visible,
  onClose,
  user,
  onSuccess,
}: UserTokenManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload: BlacklistUserTokensRequest = {
        user_id: user.id,
        reason: values.reason,
        token_type: values.token_type || "all",
      };

      await api.tokenLogs.blacklistUserTokens(payload);
      message.success(
        `All ${values.token_type || ""} tokens for ${user.username} have been blacklisted`
      );

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Failed to blacklist user tokens");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <span>Manage User Tokens</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* User Info */}
        <div>
          <Title level={4}>User Information</Title>
          <Space direction="vertical" size="small">
            <Text><strong>Username:</strong> {user.username}</Text>
            <Text><strong>Email:</strong> {user.email}</Text>
            <Text><strong>Display Name:</strong> {user.display_name}</Text>
            <Text><strong>User ID:</strong> {user.id}</Text>
          </Space>
        </div>

        {/* Warning */}
        <Alert
          message="Warning"
          description="Blacklisting tokens will immediately invalidate all existing sessions for this user. They will need to log in again to continue using the application."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />

        {/* Blacklist Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Token Type"
            name="token_type"
            initialValue="all"
          >
            <Select>
              <Select.Option value="all">All Tokens</Select.Option>
              <Select.Option value="access">Access Tokens Only</Select.Option>
              <Select.Option value="refresh">Refresh Tokens Only</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[
              {
                required: true,
                message: "Please provide a reason for this action",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the reason for blacklisting this user's tokens..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={loading}
                icon={<StopOutlined />}
              >
                Blacklist Tokens
              </Button>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* Information */}
        <div>
          <Title level={5}>What happens when tokens are blacklisted?</Title>
          <List size="small">
            <List.Item>
              <Text>• User will be immediately logged out from all devices</Text>
            </List.Item>
            <List.Item>
              <Text>• All existing tokens become invalid</Text>
            </List.Item>
            <List.Item>
              <Text>• User must log in again to access the system</Text>
            </List.Item>
            <List.Item>
              <Text>• This action cannot be undone</Text>
            </List.Item>
          </List>
        </div>
      </Space>
    </Modal>
  );
};

export default UserTokenManager;