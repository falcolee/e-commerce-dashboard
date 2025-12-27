import { Table, Tag, Button, Space, Dropdown, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, CopyOutlined, MoreOutlined } from '@ant-design/icons';
import type { OrderShipment } from '@/lib/types';
import type { MenuProps, TablePaginationConfig } from 'antd';
import dayjs from 'dayjs';
import { message } from '@/lib/antdApp';

interface ShipmentListProps {
  shipments: OrderShipment[];
  loading: boolean;
  onEdit: (shipment: OrderShipment) => void;
  onViewTimeline: (shipment: OrderShipment) => void;
  onStatusUpdate: (shipmentId: number, status: string) => void;
  pagination?: TablePaginationConfig;
}

const ShipmentList = ({
  shipments,
  loading,
  onEdit,
  onViewTimeline,
  onStatusUpdate,
  pagination,
}: ShipmentListProps) => {
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      pending: 'default',
      shipped: 'processing',
      in_transit: 'warning',
      delivered: 'success',
      cancelled: 'error',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusLabels[status] || status;
  };

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    message.success('Tracking number copied to clipboard');
  };

  const getActionMenuItems = (record: OrderShipment): MenuProps['items'] => {
    return [
      {
        key: 'timeline',
        label: 'View Timeline',
        icon: <EyeOutlined />,
        onClick: () => onViewTimeline(record),
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlined />,
        onClick: () => onEdit(record),
      },
      {
        type: 'divider',
      },
      {
        key: 'status',
        label: 'Update Status',
        children: [
          {
            key: 'pending',
            label: 'Pending',
            onClick: () => onStatusUpdate(record.id, 'pending'),
          },
          {
            key: 'shipped',
            label: 'Shipped',
            onClick: () => onStatusUpdate(record.id, 'shipped'),
          },
          {
            key: 'in_transit',
            label: 'In Transit',
            onClick: () => onStatusUpdate(record.id, 'in_transit'),
          },
          {
            key: 'delivered',
            label: 'Delivered',
            onClick: () => onStatusUpdate(record.id, 'delivered'),
          },
          {
            key: 'cancelled',
            label: 'Cancelled',
            onClick: () => onStatusUpdate(record.id, 'cancelled'),
          },
        ],
      },
    ];
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 100,
      render: (orderId: number) => (
        <span style={{ fontWeight: 500 }}>#{orderId}</span>
      ),
    },
    {
      title: 'Tracking Number',
      dataIndex: 'tracking_number',
      key: 'tracking_number',
      width: 200,
      render: (trackingNumber: string) => (
        <Space>
          <span style={{ fontFamily: 'monospace' }}>{trackingNumber}</span>
          <Tooltip title="Copy tracking number">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyTracking(trackingNumber)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Carrier',
      dataIndex: 'carrier',
      key: 'carrier',
      width: 120,
      render: (carrier: string) => (
        <Tag color="blue">{carrier}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Shipped At',
      dataIndex: 'shipped_at',
      key: 'shipped_at',
      width: 150,
      render: (shippedAt: string) => (
        shippedAt ? dayjs(shippedAt).format('YYYY-MM-DD HH:mm') : '-'
      ),
    },
    {
      title: 'Delivered At',
      dataIndex: 'delivered_at',
      key: 'delivered_at',
      width: 150,
      render: (deliveredAt: string) => (
        deliveredAt ? dayjs(deliveredAt).format('YYYY-MM-DD HH:mm') : '-'
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (createdAt: string) => (
        dayjs(createdAt).format('YYYY-MM-DD HH:mm')
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: OrderShipment) => (
        <Space>
          <Tooltip title="View Timeline">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewTimeline(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={shipments}
      loading={loading}
      rowKey="id"
      pagination={pagination}
      scroll={{ x: 1200 }}
    />
  );
};

export default ShipmentList;
