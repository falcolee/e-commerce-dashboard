import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Col,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Product, ProductAttribute } from '@/lib/types';
import { message } from '@/lib/antdApp';

interface Props {
  productId?: number;
  onVariationsChange?: (hasVariations: boolean) => void;
}

interface VariantFormValues {
  name: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  manage_stock: boolean;
  stock_quantity?: number;
  stock_status: Product['stock_status'];
  attributes?: Record<string, string>;
}

const DEFAULT_FORM_VALUES: Partial<VariantFormValues> = {
  manage_stock: true,
  stock_status: 'instock',
};

const ProductVariationsSection = ({ productId, onVariationsChange }: Props) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [attributesLoading, setAttributesLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<VariantFormValues>();
  const [editingVariant, setEditingVariant] = useState<Product | null>(null);

  const manageStock = Form.useWatch('manage_stock', form) ?? false;

  const attributeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    attributes.forEach((attr) => {
      map.set(attr.slug, attr.name);
      map.set(attr.name, attr.name);
    });
    return map;
  }, [attributes]);

  const attributeValueLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    attributes.forEach((attr) => {
      attr.values?.forEach((value) => {
        map.set(`${attr.slug}:${value.slug}`, value.name);
        map.set(`${attr.name}:${value.slug}`, value.name);
        map.set(`${attr.slug}:${value.name}`, value.name);
        map.set(`${attr.name}:${value.name}`, value.name);
      });
    });
    return map;
  }, [attributes]);

  const loadVariants = useCallback(async () => {
    if (!productId) return;
    setVariantsLoading(true);
    try {
      const res = await api.products.variants.list(productId);
      const list = Array.isArray(res.variants) ? res.variants : [];
      setVariants(list);
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load variants';
      message.error(messageText);
    } finally {
      setVariantsLoading(false);
    }
  }, [productId]);

  const loadAttributes = useCallback(async () => {
    setAttributesLoading(true);
    try {
      const res = await api.attributes.list();
      setAttributes(res || []);
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load attributes';
      message.error(messageText);
    } finally {
      setAttributesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      loadVariants();
    }
  }, [productId, loadVariants]);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  useEffect(() => {
    onVariationsChange?.(variants.length > 0);
  }, [variants.length, onVariationsChange]);

  const openDrawer = (variant?: Product) => {
    if (!productId) {
      message.info('Save the product before managing variants.');
      return;
    }
    if (variant) {
      setEditingVariant(variant);
      form.setFieldsValue({
        ...DEFAULT_FORM_VALUES,
        name: variant.name,
        sku: variant.sku,
        regular_price: variant.regular_price,
        sale_price: variant.sale_price,
        manage_stock: variant.manage_stock ?? true,
        stock_quantity: variant.stock_quantity,
        stock_status: variant.stock_status ?? 'instock',
        attributes: variant.attributes || {},
      });
    } else {
      setEditingVariant(null);
      form.resetFields();
      form.setFieldsValue(DEFAULT_FORM_VALUES);
    }
    setDrawerVisible(true);
  };

  const handleSaveVariant = async () => {
    if (!productId) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      const attributesPayload = Object.entries(values.attributes || {}).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        },
        {}
      );

      const payload = {
        name: values.name,
        sku: values.sku,
        regular_price: values.regular_price,
        sale_price: values.sale_price || undefined,
        manage_stock: values.manage_stock ?? true,
        stock_quantity: values.manage_stock ? values.stock_quantity ?? 0 : undefined,
        stock_status: values.stock_status,
        attributes: attributesPayload,
      };

      if (editingVariant) {
        await api.products.variants.update(editingVariant.id, payload);
        message.success('Variant updated successfully');
      } else {
        await api.products.variants.create(productId, payload);
        message.success('Variant created successfully');
      }

      setDrawerVisible(false);
      form.resetFields();
      loadVariants();
    } catch (err) {
      if ((err as { errorFields?: unknown[] }).errorFields) {
        return;
      }
      const messageText =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save variant';
      message.error(messageText);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await api.products.variants.delete(variantId);
      message.success('Variant deleted successfully');
      loadVariants();
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete variant';
      message.error(messageText);
    }
  };

  const columns = [
    {
      title: 'Attributes',
      dataIndex: 'attributes',
      key: 'attributes',
      render: (attrs: Record<string, string>) => {
        if (!attrs || Object.keys(attrs).length === 0) {
          return <span className="text-muted-foreground text-xs">No attributes</span>;
        }
        return (
          <Space direction="vertical" size="small">
            {Object.entries(attrs).map(([key, value]) => {
              const label = attributeLabelMap.get(key) ?? key;
              const valueLabel = attributeValueLabelMap.get(`${key}:${value}`) ?? value;
              return (
                <Tag key={`${key}-${value}`}>
                  {label}: {valueLabel}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 160,
    },
    {
      title: 'Price',
      key: 'price',
      width: 140,
      render: (_: unknown, record: Product) => {
        const regular = record.regular_price ?? 0;
        const sale = record.sale_price;
        return (
          <Space direction="vertical" size="small">
            {sale && <span className="text-muted-foreground line-through">${regular.toFixed(2)}</span>}
            <span className="font-medium">${(sale ?? regular).toFixed(2)}</span>
          </Space>
        );
      },
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 140,
      render: (_: unknown, record: Product) => (
        <Space direction="vertical" size="small">
          <span>{record.stock_quantity ?? 0}</span>
          <Tag color={record.stock_status === 'instock' ? 'green' : record.stock_status === 'onbackorder' ? 'orange' : 'red'}>
            {record.stock_status}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openDrawer(record)} />
          <Popconfirm
            title="Delete variant?"
            okText="Delete"
            okType="danger"
            onConfirm={() => handleDeleteVariant(record.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    if (!productId) {
      return (
        <Alert
          type="info"
          showIcon
          message="Save the product before adding variants."
        />
      );
    }

    if (variants.length === 0 && !variantsLoading) {
      return (
        <div className="py-6">
          <Empty description="No variants yet. Use the button above to add one." />
        </div>
      );
    }

    return (
      <Table
        columns={columns}
        dataSource={variants}
        rowKey="id"
        pagination={false}
        size="small"
        loading={variantsLoading}
      />
    );
  };

  return (
    <>
      <Card
        title="Variations"
        className="shadow-sm"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadVariants} disabled={!productId} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()} disabled={!productId}>
              Add Variant
            </Button>
          </Space>
        }
      >
        {variantsLoading ? (
          <div className="py-10 flex justify-center">
            <Spin />
          </div>
        ) : (
          renderContent()
        )}
      </Card>

      <Drawer
        title={editingVariant ? 'Edit Variant' : 'Add Variant'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={640}
        destroyOnHidden
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawerVisible(false)}>Cancel</Button>
            <Button type="primary" loading={saving} onClick={handleSaveVariant}>
              Save
            </Button>
          </div>
        }
      >
        <Form layout="vertical" form={form} initialValues={DEFAULT_FORM_VALUES}>
          <Form.Item name="name" label="Variant Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g., 16GB RAM / 512GB SSD" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'SKU is required' }]}>
                <Input placeholder="VAR-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="regular_price"
                label="Regular Price"
                rules={[{ required: true, message: 'Regular price is required' }]}
              >
                <InputNumber min={0} step={0.01} className="w-full" prefix="$" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sale_price" label="Sale Price">
                <InputNumber min={0} step={0.01} className="w-full" prefix="$" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock_status" label="Stock Status" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'In Stock', value: 'instock' },
                    { label: 'Out of Stock', value: 'outofstock' },
                    { label: 'Backorder', value: 'onbackorder' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="manage_stock" label="Manage Stock" valuePropName="checked">
            <Switch />
          </Form.Item>

          {manageStock && (
            <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true, message: 'Specify quantity' }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          )}

          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium">Attributes</div>
            {attributesLoading && (
              <div className="py-4">
                <Spin size="small" />
              </div>
            )}
            {!attributesLoading && attributes.length === 0 && (
              <Alert
                type="info"
                showIcon
                message="No global attributes found. Add product attributes first to enable structured variants."
              />
            )}
            {attributes.map((attribute) => (
              <Form.Item
                key={attribute.id}
                name={['attributes', attribute.slug]}
                label={attribute.name}
                tooltip={`Assign a ${attribute.name} value to this variant`}
              >
                <Select
                  placeholder={`Select ${attribute.name}`}
                  allowClear
                  options={attribute.values?.map((value) => ({
                    label: value.name,
                    value: value.slug,
                  }))}
                />
              </Form.Item>
            ))}
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export default ProductVariationsSection;
