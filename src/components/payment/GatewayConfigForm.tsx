import { useState, useCallback, useMemo } from 'react';
import { Form, Input, Button, Space, Switch } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, SaveOutlined } from '@ant-design/icons';
import type { PaymentGateway } from '@/lib/types';
import { getErrorMessage } from '@/lib/error';
import { message } from '@/lib/antdApp';

interface GatewayConfigFormProps {
  gateway: PaymentGateway;
  onSave: (values: GatewayConfigValues) => Promise<void>;
  onCancel: () => void;
}

export interface GatewayConfigValues {
  api_key: string;
  api_secret: string;
  webhook_url?: string;
  test_mode: boolean;
  merchant_id?: string;
  public_key?: string;
}

const GatewayConfigForm = ({ gateway, onSave, onCancel }: GatewayConfigFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  const handleSubmit = useCallback(async (values: GatewayConfigValues) => {
    setLoading(true);
    try {
      await onSave(values);
      form.resetFields();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Failed to save configuration'));
    } finally {
      setLoading(false);
    }
  }, [onSave, form]);

  // Memoize initial values to prevent unnecessary re-renders
  const initialValues = useMemo(() => {
    const rawTestMode = gateway.config?.test_mode;
    return {
      api_key: gateway.config?.api_key || '',
      api_secret: gateway.config?.api_secret || '',
      webhook_url: gateway.config?.webhook_url || '',
      test_mode: rawTestMode === true || rawTestMode === 'true',
      merchant_id: gateway.config?.merchant_id || '',
      public_key: gateway.config?.public_key || '',
    };
  }, [gateway.config]);

  // Memoize password field toggle handlers to prevent child re-renders
  const handleApiKeyVisibilityToggle = useCallback((visible: boolean) => {
    setShowApiKey(visible);
  }, []);

  const handleApiSecretVisibilityToggle = useCallback((visible: boolean) => {
    setShowApiSecret(visible);
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
      autoComplete="off"
    >
      <Form.Item
        label="API Key"
        name="api_key"
        rules={[
          { required: true, message: 'Please enter API key' },
          { min: 10, message: 'API key must be at least 10 characters' },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: 'API key can only contain letters, numbers, underscores, and hyphens'
          },
        ]}
      >
        <Input.Password
          placeholder="Enter API key"
          iconRender={(visible) =>
            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
          }
          visibilityToggle={{
            visible: showApiKey,
            onVisibleChange: handleApiKeyVisibilityToggle,
          }}
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        label="API Secret"
        name="api_secret"
        rules={[
          { required: true, message: 'Please enter API secret' },
          { min: 10, message: 'API secret must be at least 10 characters' },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: 'API secret can only contain letters, numbers, underscores, and hyphens'
          },
        ]}
      >
        <Input.Password
          placeholder="Enter API secret"
          iconRender={(visible) =>
            visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
          }
          visibilityToggle={{
            visible: showApiSecret,
            onVisibleChange: handleApiSecretVisibilityToggle,
          }}
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        label="Merchant ID"
        name="merchant_id"
        rules={[{ required: false }]}
      >
        <Input placeholder="Enter merchant ID (optional)" />
      </Form.Item>

      <Form.Item
        label="Public Key"
        name="public_key"
        rules={[{ required: false }]}
      >
        <Input placeholder="Enter public key (optional)" />
      </Form.Item>

      <Form.Item label="Webhook URL">
        <Space.Compact block>
          <Input readOnly value="POST" style={{ width: 88, textAlign: 'center' }} />
          <Form.Item
            name="webhook_url"
            noStyle
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="https://your-domain.com/webhooks/payment" />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        label="Test Mode"
        name="test_mode"
        valuePropName="checked"
        extra="Enable test mode to use sandbox credentials"
      >
        <Switch />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Save Configuration
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default GatewayConfigForm;
