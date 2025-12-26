import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, InputNumber, Switch, Divider, message } from 'antd';
import type { ShippingMethod } from '@/lib/types';

const { TextArea } = Input;

interface MethodFormProps {
  method?: ShippingMethod;
  onSave: (values: ShippingMethodFormValues) => Promise<void>;
  onCancel: () => void;
}

export interface ShippingMethodFormValues {
  name: string;
  description: string;
  enabled: boolean;
  pricing_type: 'flat_rate' | 'weight_based' | 'price_based';
  base_cost: number;
  additional_cost_per_unit?: number;
  min_order_amount?: number;
  max_order_amount?: number;
  enabled_regions?: string[];
}

const MethodForm = ({ method, onSave, onCancel }: MethodFormProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const normalizePricingType = (
    value?: string
  ): ShippingMethodFormValues['pricing_type'] => {
    if (value === 'weight_based' || value === 'price_based' || value === 'flat_rate') {
      return value;
    }
    return 'flat_rate';
  };
  const [pricingType, setPricingType] = useState<ShippingMethodFormValues['pricing_type']>('flat_rate');

  useEffect(() => {
    if (method) {
      form.setFieldsValue({
        name: method.name,
        description: method.description,
        enabled: method.enabled,
        pricing_type: normalizePricingType(method.pricing_type),
        base_cost: method.base_cost,
        additional_cost_per_unit: method.additional_cost_per_unit,
        min_order_amount: method.min_order_amount,
        max_order_amount: method.max_order_amount,
        enabled_regions: method.enabled_regions,
      });
      setPricingType(normalizePricingType(method.pricing_type));
    } else {
      form.setFieldsValue({
        enabled: true,
        pricing_type: 'flat_rate',
      });
    }
  }, [method, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as ShippingMethodFormValues;
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

  const pricingTypes = [
    { label: 'Flat Rate', value: 'flat_rate' },
    { label: 'Weight Based', value: 'weight_based' },
    { label: 'Price Based', value: 'price_based' },
  ];

  const regions = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'European Union', value: 'EU' },
    { label: 'China', value: 'CN' },
    { label: 'Japan', value: 'JP' },
    { label: 'Australia', value: 'AU' },
    { label: 'Worldwide', value: 'WW' },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        enabled: true,
        pricing_type: 'flat_rate',
      }}
    >
      {/* Basic Information */}
      <Divider orientation="left" style={{ marginTop: 0 }}>Basic Information</Divider>

      <Form.Item
        label="Method Name"
        name="name"
        rules={[
          { required: true, message: 'Please enter method name' },
          { min: 3, message: 'Name must be at least 3 characters' },
        ]}
      >
        <Input
          placeholder="e.g., Standard Shipping, Express Delivery"
          maxLength={100}
        />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[
          { required: true, message: 'Please enter description' },
        ]}
      >
        <TextArea
          placeholder="Describe this shipping method"
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        label="Enable Method"
        name="enabled"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* Pricing Configuration */}
      <Divider orientation="left">Pricing Configuration</Divider>

      <Form.Item
        label="Pricing Type"
        name="pricing_type"
        rules={[{ required: true, message: 'Please select pricing type' }]}
      >
        <Select
          placeholder="Select pricing type"
          options={pricingTypes}
          onChange={(value) =>
            setPricingType(value as ShippingMethodFormValues['pricing_type'])
          }
        />
      </Form.Item>

      <Form.Item
        label="Base Cost"
        name="base_cost"
        rules={[
          { required: true, message: 'Please enter base cost' },
          { type: 'number', min: 0, message: 'Base cost must be positive' },
        ]}
        tooltip="The base shipping cost for this method"
      >
        <InputNumber
          placeholder="0.00"
          min={0}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
          prefix="$"
        />
      </Form.Item>

      {(pricingType === 'weight_based' || pricingType === 'price_based') && (
        <Form.Item
          label={pricingType === 'weight_based' ? 'Cost per Kg' : 'Cost per $100'}
          name="additional_cost_per_unit"
          rules={[
            { required: true, message: 'Please enter additional cost' },
            { type: 'number', min: 0, message: 'Cost must be positive' },
          ]}
          tooltip={
            pricingType === 'weight_based'
              ? 'Additional cost per kilogram'
              : 'Additional cost per $100 of order value'
          }
        >
          <InputNumber
            placeholder="0.00"
            min={0}
            step={0.01}
            precision={2}
            style={{ width: '100%' }}
            prefix="$"
          />
        </Form.Item>
      )}

      {/* Availability Conditions */}
      <Divider orientation="left">Availability Conditions</Divider>

      <Form.Item
        label="Minimum Order Amount"
        name="min_order_amount"
        rules={[
          { type: 'number', min: 0, message: 'Amount must be positive' },
        ]}
        tooltip="Minimum order value required for this shipping method"
      >
        <InputNumber
          placeholder="0.00"
          min={0}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
          prefix="$"
        />
      </Form.Item>

      <Form.Item
        label="Maximum Order Amount"
        name="max_order_amount"
        rules={[
          { type: 'number', min: 0, message: 'Amount must be positive' },
        ]}
        tooltip="Maximum order value allowed for this shipping method (optional)"
      >
        <InputNumber
          placeholder="0.00"
          min={0}
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
          prefix="$"
        />
      </Form.Item>

      <Form.Item
        label="Enabled Regions"
        name="enabled_regions"
        tooltip="Select regions where this shipping method is available (leave empty for all regions)"
      >
        <Select
          mode="multiple"
          placeholder="Select regions (optional)"
          options={regions}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      {/* Form Actions */}
      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            {method ? 'Update' : 'Create'} Method
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default MethodForm;
