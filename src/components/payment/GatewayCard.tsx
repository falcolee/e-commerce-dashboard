import { Card, Switch, Button, Tag, Space, Tooltip } from 'antd';
import { SettingOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { PaymentGateway } from '@/lib/types';

interface GatewayCardProps {
  gateway: PaymentGateway;
  onToggle: (gateway: PaymentGateway) => void;
  onConfigure: (gateway: PaymentGateway) => void;
  onTest: (gateway: PaymentGateway) => void;
  testing?: boolean;
}

const GatewayCard = ({ gateway, onToggle, onConfigure, onTest, testing = false }: GatewayCardProps) => {
  const isConfigured = gateway.config && Object.keys(gateway.config).length > 0;

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderColor: gateway.enabled ? '#52c41a' : '#d9d9d9',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with Logo/Icon */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{gateway.title}</h3>
            <div style={{ marginTop: 4 }}>
              {gateway.enabled ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Enabled
                </Tag>
              ) : (
                <Tag color="default">Disabled</Tag>
              )}
              {isConfigured ? (
                <Tag color="blue">Configured</Tag>
              ) : (
                <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                  Not Configured
                </Tag>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {gateway.description && (
          <p
            style={{
              margin: '0 0 16px',
              color: '#666',
              fontSize: 13,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {gateway.description}
          </p>
        )}

        {/* Actions */}
        <div style={{ marginTop: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Enable Gateway</span>
              <Switch
                checked={gateway.enabled}
                onChange={() => onToggle(gateway)}
                disabled={!isConfigured}
              />
            </div>

            <Space style={{ width: '100%' }} size={8}>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => onConfigure(gateway)}
                style={{ flex: 1 }}
              >
                Configure
              </Button>
              {isConfigured && (
                <Tooltip title="Test Connection">
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => onTest(gateway)}
                    loading={testing}
                  >
                    Test
                  </Button>
                </Tooltip>
              )}
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default GatewayCard;
