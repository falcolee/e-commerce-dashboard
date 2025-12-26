import { Card, Form, InputNumber, Row, Col, Space } from 'antd';

interface Props {
  productType: 'simple' | 'variable';
}

const ProductPricingSection = ({ productType }: Props) => {
  if (productType === 'variable') {
    return (
      <Card title="Pricing" className="shadow-sm">
        <div className="text-muted-foreground text-sm">
          Pricing is managed at the variation level for variable products.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Pricing" className="shadow-sm">
      <Space direction="vertical" size="large" className="w-full">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="regular_price"
              label="Regular Price ($)"
              rules={[{ required: true, message: 'Regular price is required' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                className="w-full"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sale_price" label="Sale Price ($)">
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                className="w-full"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Space direction="vertical" size="small">
          <div className="text-xs text-muted-foreground">
            Leave sale price empty if no discount is active.
          </div>
        </Space>
      </Space>
    </Card>
  );
};

export default ProductPricingSection;
