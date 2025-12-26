import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, InputNumber, message } from 'antd';
import type { Order, OrderShipment } from '@/lib/types';
import api from '@/lib/api';

const { TextArea } = Input;

interface ShipmentFormProps {
  shipment?: OrderShipment;
  onSave: (values: ShipmentFormValues) => Promise<void>;
  onCancel: () => void;
}

export interface ShipmentFormValues {
  order_id: number;
  tracking_number: string;
  carrier: string;
  status: string;
  notes?: string;
}

type OrderOption = Order & { customer_name?: string };

const ShipmentForm = ({ shipment, onSave, onCancel }: ShipmentFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderSearchLoading, setOrderSearchLoading] = useState(false);
  const [orders, setOrders] = useState<OrderOption[]>([]);

  useEffect(() => {
    if (shipment) {
      form.setFieldsValue({
        order_id: shipment.order_id,
        tracking_number: shipment.tracking_number,
        carrier: shipment.carrier,
        status: shipment.status,
      });
    }
  }, [shipment, form]);

  const handleSearchOrders = async (searchValue: string) => {
    if (!searchValue) {
      setOrders([]);
      return;
    }

    setOrderSearchLoading(true);
    try {
      const res = await api.orders.list({
        search: searchValue,
        page: 1,
        page_size: 10,
      });
      setOrders(res.items ?? []);
    } catch (error) {
      message.error('Failed to search orders');
    } finally {
      setOrderSearchLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as ShipmentFormValues;
      setLoading(true);
      await onSave(values);
      form.resetFields();
    } catch (error: unknown) {
      if (isValidationError(error)) {
        message.error('Please fill in all required fields');
      } else if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidationError = (err: unknown): err is { errorFields: unknown } =>
    typeof err === 'object' && err !== null && 'errorFields' in err;

  const carriers = [
    { label: 'UPS', value: 'UPS' },
    { label: 'FedEx', value: 'FedEx' },
    { label: 'DHL', value: 'DHL' },
    { label: 'USPS', value: 'USPS' },
    { label: 'China Post', value: 'China Post' },
    { label: 'SF Express', value: 'SF Express' },
    { label: 'Other', value: 'Other' },
  ];

  const statuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        status: 'pending',
      }}
    >
      <Form.Item
        label="Order"
        name="order_id"
        rules={[{ required: true, message: 'Please select an order' }]}
      >
        {shipment ? (
          <Input
            value={`Order #${shipment.order_id}`}
            disabled
            style={{ width: '100%' }}
          />
        ) : (
          <Select
            showSearch
            placeholder="Search and select order"
            filterOption={false}
            onSearch={handleSearchOrders}
            loading={orderSearchLoading}
            notFoundContent={orderSearchLoading ? 'Searching...' : 'No orders found'}
            style={{ width: '100%' }}
          >
            {orders.map((order) => (
              <Select.Option key={order.id} value={order.id}>
                Order #{order.id} - {order.customer_name || 'N/A'}
              </Select.Option>
            ))}
          </Select>
        )}
      </Form.Item>

      <Form.Item
        label="Tracking Number"
        name="tracking_number"
        rules={[
          { required: true, message: 'Please enter tracking number' },
          { min: 5, message: 'Tracking number must be at least 5 characters' },
        ]}
      >
        <Input
          placeholder="Enter tracking number"
          maxLength={100}
        />
      </Form.Item>

      <Form.Item
        label="Carrier"
        name="carrier"
        rules={[{ required: true, message: 'Please select a carrier' }]}
      >
        <Select
          placeholder="Select carrier"
          options={carriers}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        label="Status"
        name="status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select
          placeholder="Select status"
          options={statuses}
        />
      </Form.Item>

      <Form.Item
        label="Notes"
        name="notes"
      >
        <TextArea
          placeholder="Add any notes about this shipment"
          rows={4}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {shipment ? 'Update' : 'Create'} Shipment
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ShipmentForm;
