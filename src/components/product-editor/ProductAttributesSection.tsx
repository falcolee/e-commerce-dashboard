import { Card, Form, Select, Button, Space, Tag, Spin, Alert } from 'antd';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { ProductAttribute, ProductAttributeValue } from '@/lib/types';

interface Props {
  productType: 'simple' | 'variable';
}

interface AttributeOption {
  id: number;
  name: string;
  values: { id: number; value: string }[];
}

const ProductAttributesSection = ({ productType }: Props) => {
  const [attributes, setAttributes] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<number[]>([]);
  const [variationAttrs, setVariationAttrs] = useState<number[]>([]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true);
        const attributeList = await api.attributes.list();

        const attrsWithValues = await Promise.all(
          attributeList.map(async (attr: ProductAttribute) => {
            const values = await api.attributes.values.list(attr.id);
            return {
              id: attr.id,
              name: attr.name,
              values: values.map((v: ProductAttributeValue) => ({ id: v.id, value: v.value }))
            };
          })
        );

        setAttributes(attrsWithValues);
        setError(null);
      } catch (err: unknown) {
        const message =
          (typeof err === 'object' && err !== null && 'response' in err &&
            (err as { response?: { data?: { message?: string } } }).response?.data?.message) ||
          (err instanceof Error ? err.message : null) ||
          'Failed to load attributes';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  const addAttribute = (attrId: number) => {
    if (!selectedAttrs.includes(attrId)) {
      setSelectedAttrs([...selectedAttrs, attrId]);
    }
  };

  const removeAttribute = (attrId: number) => {
    setSelectedAttrs(selectedAttrs.filter(id => id !== attrId));
    setVariationAttrs(variationAttrs.filter(id => id !== attrId));
  };

  const toggleVariationAttr = (attrId: number) => {
    if (variationAttrs.includes(attrId)) {
      setVariationAttrs(variationAttrs.filter(id => id !== attrId));
    } else {
      setVariationAttrs([...variationAttrs, attrId]);
    }
  };

  if (loading) {
    return (
      <Card title="Attributes" className="shadow-sm">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Attributes" className="shadow-sm">
        <Alert type="error" message={error} showIcon />
      </Card>
    );
  }

  return (
    <Card
      title="Attributes"
      className="shadow-sm"
      extra={
        <Select
          placeholder="Add attribute"
          style={{ width: 200 }}
          onChange={addAttribute}
          value={null}
        >
          {attributes.filter(attr => !selectedAttrs.includes(attr.id)).map(attr => (
            <Select.Option key={attr.id} value={attr.id}>
              {attr.name}
            </Select.Option>
          ))}
        </Select>
      }
    >
      <Space direction="vertical" size="middle" className="w-full">
        {selectedAttrs.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No attributes added yet. Use the dropdown above to add product attributes.
          </div>
        ) : (
          selectedAttrs.map(attrId => {
            const attr = attributes.find(a => a.id === attrId)!;
            return (
              <div key={attrId} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Space>
                    <span className="font-medium">{attr.name}</span>
                    {productType === 'variable' && (
                      <Tag
                        color={variationAttrs.includes(attrId) ? 'blue' : 'default'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleVariationAttr(attrId)}
                      >
                        {variationAttrs.includes(attrId) ? 'Used for variations' : 'Click to use for variations'}
                      </Tag>
                    )}
                  </Space>
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={() => removeAttribute(attrId)}
                  >
                    Remove
                  </Button>
                </div>
                <Form.Item name={['attributes', attrId]} className="mb-0">
                  <Select
                    mode="multiple"
                    placeholder={`Select ${attr.name}`}
                    options={attr.values.map(v => ({ label: v.value, value: v.id }))}
                  />
                </Form.Item>
              </div>
            );
          })
        )}
      </Space>
    </Card>
  );
};

export default ProductAttributesSection;
