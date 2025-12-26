import { Card, Form, Input, InputNumber, Switch, Row, Col, Select, Space } from 'antd';

interface Props {
  productType: 'simple' | 'variable';
}

const ProductInventorySection = ({ productType }: Props) => {
  const form = Form.useFormInstance();
  const manageStock = Form.useWatch('manage_stock', form) ?? false;

  if (productType === 'variable') {
    return (
      <Card title="Inventory" className="shadow-sm">
        <div className="text-muted-foreground text-sm">
          Inventory is managed at the variation level for variable products.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Inventory" className="shadow-sm">
      <Space direction="vertical" size="large" className="w-full">
        <Form.Item name="sku" label="SKU" tooltip="Stock Keeping Unit">
          <Input placeholder="LAPTOP-001" />
        </Form.Item>

        <Form.Item
          name="stock_status"
          label="Stock Status"
          rules={[{ required: true, message: 'Select a stock status' }]}
        >
          <Select>
            <Select.Option value="instock">In Stock</Select.Option>
            <Select.Option value="outofstock">Out of Stock</Select.Option>
            <Select.Option value="onbackorder">Backorder</Select.Option>
          </Select>
        </Form.Item>

        <div>
          <Space align="center" className="mb-3">
            <Form.Item name="manage_stock" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
            <span className="text-sm font-medium">Manage stock?</span>
          </Space>

          {manageStock && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="stock_quantity" label="Stock Quantity">
                  <InputNumber min={0} className="w-full" placeholder="0" />
                </Form.Item>
              </Col>
            </Row>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default ProductInventorySection;
