import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Dropdown, message, Modal, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { EyeOutlined, SearchOutlined, MoreOutlined, CarOutlined } from '@ant-design/icons';
import type { Order, OrderShipment } from '@/lib/types';
import api from '@/lib/api';
import ShipmentList from '@/components/shipment/ShipmentList';
import ShipmentForm, { type ShipmentFormValues } from '@/components/shipment/ShipmentForm';

const Orders = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Shipment modal states
  const [shipmentsModalVisible, setShipmentsModalVisible] = useState(false);
  const [createShipmentModalVisible, setCreateShipmentModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderShipments, setOrderShipments] = useState<OrderShipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.orders.list({ page: 1, pageSize: 100 });
        setOrders(response.items ?? []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    console.log(order);
    const matchesSearch = order.order_key.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewShipments = async (order: Order) => {
    setSelectedOrder(order);
    setShipmentsModalVisible(true);
    setShipmentsLoading(true);
    try {
      const res = await api.orderShipments.getByOrder(order.id);
      setOrderShipments(res ?? []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shipments';
      message.error(errorMessage);
    } finally {
      setShipmentsLoading(false);
    }
  };

  const handleCreateShipment = (order: Order) => {
    setSelectedOrder(order);
    setCreateShipmentModalVisible(true);
  };

  const handleCreateShipmentSave = async (values: ShipmentFormValues) => {
    const orderId = selectedOrder?.id ?? values.order_id;
    if (!orderId) {
      message.error('Please select an order before creating a shipment');
      return;
    }

    try {
      await api.orderShipments.create({
        ...values,
        order_id: orderId,
      });
      message.success('Shipment created successfully');
      setCreateShipmentModalVisible(false);
      if (shipmentsModalVisible && selectedOrder) {
        handleViewShipments(selectedOrder);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create shipment';
      message.error(errorMessage);
      throw error;
    }
  };

  const getActionMenuItems = (record: Order): MenuProps['items'] => [
    {
      key: 'view',
      label: 'View',
      icon: <EyeOutlined />,
    },
    {
      key: 'shipments',
      label: 'View Shipments',
      icon: <CarOutlined />,
      onClick: () => handleViewShipments(record),
    },
    {
      key: 'create-shipment',
      label: 'Create Shipment',
      icon: <CarOutlined />,
      onClick: () => handleCreateShipment(record),
    },
  ];

  const columns = [
    {
      title: 'Order',
      dataIndex: 'order_key',
      key: 'order_key',
      width: 150,
    },
    {
      title: 'Total',
      dataIndex: 'order_total',
      key: 'order_total',
      width: 120,
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Order Status',
      dataIndex: 'order_status',
      key: 'order_status',
      width: 130,
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: 'green',
          processing: 'blue',
          pending: 'orange',
          cancelled: 'red',
          refunded: 'purple',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment_status',
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          paid: 'green',
          unpaid: 'orange',
          refunded: 'purple',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Order) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Orders</h1>
      <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
        <Space>
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </Space>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      {/* Shipments Modal */}
      <Modal
        title={`Shipments for Order #${selectedOrder?.id || ''}`}
        open={shipmentsModalVisible}
        onCancel={() => {
          setShipmentsModalVisible(false);
          setSelectedOrder(null);
          setOrderShipments([]);
        }}
        footer={[
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setShipmentsModalVisible(false);
              handleCreateShipment(selectedOrder!);
            }}
          >
            Create Shipment
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setShipmentsModalVisible(false);
              setSelectedOrder(null);
              setOrderShipments([]);
            }}
          >
            Close
          </Button>,
        ]}
        width={1000}
        destroyOnClose
      >
        {orderShipments.length > 0 ? (
          <ShipmentList
            shipments={orderShipments}
            loading={shipmentsLoading}
            onEdit={() => {}}
            onViewTimeline={() => {}}
            onStatusUpdate={async (shipmentId, status) => {
              try {
                await api.orderShipments.update(shipmentId, { status });
                message.success('Status updated successfully');
                if (selectedOrder) {
                  handleViewShipments(selectedOrder);
                }
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
                message.error(errorMessage);
              }
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
            {shipmentsLoading ? 'Loading shipments...' : 'No shipments found for this order'}
          </div>
        )}
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        title={`Create Shipment for Order #${selectedOrder?.id || ''}`}
        open={createShipmentModalVisible}
        onCancel={() => {
          setCreateShipmentModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedOrder && (
          <ShipmentForm
            onSave={handleCreateShipmentSave}
            onCancel={() => {
              setCreateShipmentModalVisible(false);
              setSelectedOrder(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Orders;
