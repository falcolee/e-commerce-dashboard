import { Card, Form, Select } from 'antd';

const ProductStatusBox = () => {
  return (
    <Card title="Publish" size="small" className="shadow-sm">
      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Select a product status' }]}
        className="mb-0"
      >
        <Select
          options={[
            { label: 'Published', value: 'publish' },
            { label: 'Draft', value: 'draft' },
            { label: 'Private', value: 'private' },
          ]}
        />
      </Form.Item>
    </Card>
  );
};

export default ProductStatusBox;
