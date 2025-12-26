import { Card, Form, InputNumber, Row, Col } from 'antd';

const ProductShippingSection = () => {
  return (
    <Card title="Shipping & Dimensions" className="shadow-sm">
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="meta.weight" label="Weight (kg)">
            <InputNumber min={0} step={0.1} precision={2} className="w-full" placeholder="0.0" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="meta.length" label="Length (cm)">
            <InputNumber min={0} step={0.1} precision={1} className="w-full" placeholder="0.0" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="meta.width" label="Width (cm)">
            <InputNumber min={0} step={0.1} precision={1} className="w-full" placeholder="0.0" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="meta.height" label="Height (cm)">
            <InputNumber min={0} step={0.1} precision={1} className="w-full" placeholder="0.0" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductShippingSection;
