import { Card, Switch, Button, Tag, Space, Tooltip } from 'antd';
import { SettingOutlined, CheckCircleOutlined, DeleteOutlined, TruckOutlined } from '@ant-design/icons';
import type { ShippingMethod } from '@/lib/types';

interface MethodCardProps {
  method: ShippingMethod;
  onToggle: (method: ShippingMethod) => void;
  onEdit: (method: ShippingMethod) => void;
  onDelete: (method: ShippingMethod) => void;
}

const MethodCard = ({ method, onToggle, onEdit, onDelete }: MethodCardProps) => {
  const getPricingTypeLabel = (type: string) => {
    switch (type) {
      case 'flat_rate':
        return 'Flat Rate';
      case 'weight_based':
        return 'Weight Based';
      case 'price_based':
        return 'Price Based';
      default:
        return type;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Card
      hoverable
      style={{
        height: '100%',
        borderColor: method.enabled ? '#52c41a' : '#d9d9d9',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with Icon */}
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
            <TruckOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{method.name}</h3>
            <div style={{ marginTop: 4 }}>
              {method.enabled ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Enabled
                </Tag>
              ) : (
                <Tag color="default">Disabled</Tag>
              )}
              <Tag color="blue">{getPricingTypeLabel(method.pricing_type)}</Tag>
            </div>
          </div>
        </div>

        {/* Description */}
        {method.description && (
          <p
            style={{
              margin: '0 0 12px',
              color: '#666',
              fontSize: 13,
              lineHeight: 1.5,
              flex: 1,
            }}
          >
            {method.description}
          </p>
        )}

        {/* Pricing Summary */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
            Base Cost: <strong>{formatPrice(method.base_cost)}</strong>
          </div>
          {method.additional_cost_per_unit && (
            <div style={{ fontSize: 13, color: '#666' }}>
              Additional: <strong>{formatPrice(method.additional_cost_per_unit)}</strong> per unit
            </div>
          )}
          {method.min_order_amount && (
            <div style={{ fontSize: 13, color: '#666' }}>
              Min Order: <strong>{formatPrice(method.min_order_amount)}</strong>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Enable Method</span>
              <Switch
                checked={method.enabled}
                onChange={() => onToggle(method)}
              />
            </div>

            <Space style={{ width: '100%' }} size={8}>
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={() => onEdit(method)}
                style={{ flex: 1 }}
              >
                Edit
              </Button>
              <Tooltip title="Delete Method">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(method)}
                />
              </Tooltip>
            </Space>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default MethodCard;
