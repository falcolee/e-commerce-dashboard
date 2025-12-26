import { Card, Form, Input, Tabs } from 'antd';
import type { TabsProps } from 'antd';

import WysiwygEditor from '@/components/common/WysiwygEditor';

const { TextArea } = Input;

const ProductDescriptionSection = () => {
  const items: TabsProps['items'] = [
    {
      key: 'description',
      label: 'Description',
      children: (
        <Form.Item name="description" className="mb-0">
          <WysiwygEditor
            placeholder="Enter the full product description with rich formatting"
            className="min-h-[240px]"
          />
        </Form.Item>
      ),
    },
    {
      key: 'short',
      label: 'Short Description',
      children: (
        <Form.Item name="short_description" className="mb-0">
          <TextArea
            rows={10}
            placeholder="Enter a short description that appears in product listings"
            className="font-mono text-sm"
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <Card title="Product Description" className="shadow-sm">
      <Tabs items={items} />
    </Card>
  );
};

export default ProductDescriptionSection;
