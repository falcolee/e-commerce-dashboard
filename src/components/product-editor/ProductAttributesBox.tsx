import { Card, Form, Input, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const ProductAttributesBox = () => {
  return (
    <Card title="General Attributes" size="small" className="shadow-sm">
      <Form.List name="general_attributes">
        {(fields, { add, remove }) => (
          <>
            <Space direction="vertical" size="small" className="w-full">
              {fields.map(field => (
                <Space key={field.key} className="w-full" align="start">
                  <Form.Item {...field} name={[field.name, 'key']} className="mb-0 flex-1">
                    <Input placeholder="Key" size="small" />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'value']} className="mb-0 flex-1">
                    <Input placeholder="Value" size="small" />
                  </Form.Item>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </Space>
              ))}
            </Space>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => add()}
              className="w-full mt-2"
            >
              Add Attribute
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
};

export default ProductAttributesBox;
