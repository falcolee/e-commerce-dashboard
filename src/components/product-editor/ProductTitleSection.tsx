import { Card, Form, Input, Space } from 'antd';

const ProductTitleSection = () => {
  return (
    <Card className="shadow-sm">
      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Product name is required' }]}
      >
        <Input
          placeholder="Product name"
          className="text-2xl font-semibold border-0 px-0 focus:shadow-none"
          style={{ fontSize: '24px', fontWeight: 600 }}
        />
      </Form.Item>
      <Form.Item
        label="Permalink"
        tooltip="URL-friendly version of the product name"
      >
        <Space.Compact block>
          <Input readOnly value={`${window.location.origin}/product/`} />
          <Form.Item name="slug" noStyle>
            <Input placeholder="product-slug" />
          </Form.Item>
        </Space.Compact>
      </Form.Item>
    </Card>
  );
};

export default ProductTitleSection;
