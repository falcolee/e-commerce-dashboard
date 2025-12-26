import { useCallback, useState, useEffect } from 'react';
import { Card, Button, Modal, message, Space, Select, DatePicker, Input } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { OrderShipment } from '@/lib/types';
import ShipmentList from '@/components/shipment/ShipmentList';
import ShipmentForm, { ShipmentFormValues } from '@/components/shipment/ShipmentForm';
import TrackingTimeline from '@/components/shipment/TrackingTimeline';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const Shipments = () => {
  const [shipments, setShipments] = useState<OrderShipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<OrderShipment | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [carrierFilter, setCarrierFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [orderIdSearch, setOrderIdSearch] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        page_size: pageSize,
      };

      if (statusFilter) {
        params['filter[status]'] = statusFilter;
      }
      if (carrierFilter) {
        params['filter[carrier]'] = carrierFilter;
      }
      if (orderIdSearch) {
        params['filter[order_id]'] = orderIdSearch;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        params['filter[created_at_from]'] = dateRange[0].format('YYYY-MM-DD');
        params['filter[created_at_to]'] = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await api.orderShipments.list(params);
      setShipments(res.items ?? []);
      setTotal(res.pagination.total);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shipments';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [carrierFilter, currentPage, dateRange, orderIdSearch, pageSize, statusFilter]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleCreate = () => {
    setSelectedShipment(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (shipment: OrderShipment) => {
    setSelectedShipment(shipment);
    setEditModalVisible(true);
  };

  const handleViewTimeline = (shipment: OrderShipment) => {
    setSelectedShipment(shipment);
    setTimelineModalVisible(true);
  };

  const handleCreateSave = async (values: ShipmentFormValues) => {
    try {
      await api.orderShipments.create(values);
      message.success('Shipment created successfully');
      setCreateModalVisible(false);
      fetchShipments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create shipment';
      message.error(errorMessage);
      throw error;
    }
  };

  const handleEditSave = async (values: ShipmentFormValues) => {
    if (!selectedShipment) return;

    try {
      await api.orderShipments.update(selectedShipment.id, values);
      message.success('Shipment updated successfully');
      setEditModalVisible(false);
      setSelectedShipment(null);
      fetchShipments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update shipment';
      message.error(errorMessage);
      throw error;
    }
  };

  const handleStatusUpdate = async (shipmentId: number, status: string) => {
    try {
      await api.orderShipments.update(shipmentId, { status });
      message.success('Shipment status updated successfully');
      fetchShipments();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      message.error(errorMessage);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setCarrierFilter('');
    setDateRange(null);
    setOrderIdSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter || carrierFilter || dateRange || orderIdSearch;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Order Shipments</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            Track and manage order shipments
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchShipments} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Shipment
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search by Order ID"
            prefix={<SearchOutlined />}
            value={orderIdSearch}
            onChange={(e) => setOrderIdSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="Filter by Status"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            allowClear
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="shipped">Shipped</Select.Option>
            <Select.Option value="in_transit">In Transit</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
          </Select>
          <Select
            placeholder="Filter by Carrier"
            value={carrierFilter || undefined}
            onChange={setCarrierFilter}
            style={{ width: 180 }}
            allowClear
          >
            <Select.Option value="UPS">UPS</Select.Option>
            <Select.Option value="FedEx">FedEx</Select.Option>
            <Select.Option value="DHL">DHL</Select.Option>
            <Select.Option value="USPS">USPS</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 280 }}
            placeholder={['Start Date', 'End Date']}
          />
          {hasActiveFilters && (
            <Button onClick={handleClearFilters}>Clear Filters</Button>
          )}
        </Space>
      </Card>

      {/* Shipments List */}
      <Card>
        <ShipmentList
          shipments={shipments}
          loading={loading}
          onEdit={handleEdit}
          onViewTimeline={handleViewTimeline}
          onStatusUpdate={handleStatusUpdate}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 20);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} shipments`,
          }}
        />
      </Card>

      {/* Create Shipment Modal */}
      <Modal
        title="Create Shipment"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ShipmentForm
          onSave={handleCreateSave}
          onCancel={() => setCreateModalVisible(false)}
        />
      </Modal>

      {/* Edit Shipment Modal */}
      <Modal
        title="Edit Shipment"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedShipment(null);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedShipment && (
          <ShipmentForm
            shipment={selectedShipment}
            onSave={handleEditSave}
            onCancel={() => {
              setEditModalVisible(false);
              setSelectedShipment(null);
            }}
          />
        )}
      </Modal>

      {/* Timeline Modal */}
      <Modal
        title={`Shipment Timeline - ${selectedShipment?.tracking_number || ''}`}
        open={timelineModalVisible}
        onCancel={() => {
          setTimelineModalVisible(false);
          setSelectedShipment(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        {selectedShipment && (
          <TrackingTimeline shipment={selectedShipment} />
        )}
      </Modal>
    </div>
  );
};

export default Shipments;
