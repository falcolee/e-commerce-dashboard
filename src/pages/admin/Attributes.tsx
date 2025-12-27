import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Card, List, Popconfirm, Dropdown, InputNumber } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { ProductAttribute, ProductAttributeValue } from '@/lib/types';
import { message } from '@/lib/antdApp';

interface AttributeFormValues {
  name: string;
  slug: string;
  type: string;
  order_by?: number;
  description?: string;
}

interface AttributeValueFormValues {
  value: string;
  order_by?: number;
  slug?: string;
}

const Attributes = () => {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<ProductAttribute | null>(null);
  const [editingValue, setEditingValue] = useState<ProductAttributeValue | null>(null);
  const [form] = Form.useForm();
  const [valueForm] = Form.useForm();

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await api.attributes.list();
      setAttributes(res || []);
    } catch (error) {
      message.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleCreate = () => {
    setEditingAttribute(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (attribute: ProductAttribute) => {
    setEditingAttribute(attribute);
    form.setFieldsValue(attribute);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.attributes.delete(id);
      message.success('Attribute deleted successfully');
      fetchAttributes();
    } catch (error) {
      message.error('Failed to delete attribute');
    }
  };

  const handleSubmit = async (values: AttributeFormValues) => {
    try {
      if (editingAttribute) {
        await api.attributes.update(editingAttribute.id, values);
        message.success('Attribute updated successfully');
      } else {
        await api.attributes.create(values);
        message.success('Attribute created successfully');
      }
      setModalVisible(false);
      fetchAttributes();
    } catch (error) {
      message.error('Failed to save attribute');
    }
  };

  const handleManageValues = async (attribute: ProductAttribute) => {
    setSelectedAttribute(attribute);
    try {
      const res = await api.attributes.values.list(attribute.id);
      setSelectedAttribute({ ...attribute, values: res });
      setValueModalVisible(true);
    } catch (error) {
      message.error('Failed to load attribute values');
    }
  };

  const handleCreateValue = () => {
    setEditingValue(null);
    valueForm.resetFields();
  };

  const handleEditValue = (value: ProductAttributeValue) => {
    setEditingValue(value);
    valueForm.setFieldsValue(value);
  };

  const handleDeleteValue = async (valueId: number) => {
    if (!selectedAttribute) return;
    
    try {
      await api.attributes.values.delete(selectedAttribute.id, valueId);
      message.success('Value deleted successfully');
      
      const res = await api.attributes.values.list(selectedAttribute.id);
      setSelectedAttribute({ ...selectedAttribute, values: res });
      fetchAttributes();
    } catch (error) {
      message.error('Failed to delete value');
    }
  };

  const handleSubmitValue = async (values: AttributeValueFormValues) => {
    if (!selectedAttribute) return;
    try {
      if (editingValue) {
        await api.attributes.values.update(selectedAttribute.id, editingValue.id, values);
        message.success('Value updated successfully');
      } else {
        await api.attributes.values.create(selectedAttribute.id, values);
        message.success('Value created successfully');
      }
      valueForm.resetFields();
      setEditingValue(null);
      const res = await api.attributes.values.list(selectedAttribute.id);
      setSelectedAttribute({ ...selectedAttribute, values: res });
      fetchAttributes();
    } catch (error) {
      message.error('Failed to save value');
    }
  };

  const getActionMenuItems = (record: ProductAttribute): MenuProps['items'] => [
    {
      key: 'values',
      label: 'Manage Values',
      onClick: () => handleManageValues(record),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Delete Attribute',
          content: 'Are you sure you want to delete this attribute?',
          okText: 'Delete',
          okType: 'danger',
          onOk: () => handleDelete(record.id),
        });
      },
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      render: (slug: string) => <Tag>{slug}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
    },
    {
      title: 'Values',
      dataIndex: 'terms_count',
      key: 'terms_count',
      width: 120,
      render: (count: number) => <Tag color="blue">{count} values</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: ProductAttribute) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Product Attributes</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Attribute
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={attributes}
        rowKey="id"
        loading={loading}
        scroll={{ x: 850 }}
        pagination={false}
      />

      <Modal
        title={editingAttribute ? 'Edit Attribute' : 'Create Attribute'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Attribute Name" rules={[{ required: true }]}>
            <Input placeholder="Color, Size, Material, etc." />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            help="Leave empty to auto-generate from name"
            rules={[{ required: !!editingAttribute, message: 'Slug is required for updates' }]}
          >
            <Input placeholder="pa_color" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'select', label: 'Select' },
                { value: 'input', label: 'Input' },
                { value: 'color', label: 'Color' },
              ]}
            />
          </Form.Item>
          <Form.Item name="order_by" label="Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Manage Values: ${selectedAttribute?.name}`}
        open={valueModalVisible}
        onCancel={() => {
          setValueModalVisible(false);
          setSelectedAttribute(null);
          setEditingValue(null);
          valueForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Card 
          title={editingValue ? 'Edit Value' : 'Add New Value'}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Form form={valueForm} layout="inline" onFinish={handleSubmitValue}>
            <Form.Item name="value" rules={[{ required: true }]}>
              <Input placeholder="Attribute value" style={{ width: 150 }} />
            </Form.Item>
            <Form.Item name="order_by">
              <InputNumber placeholder="Order" min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingValue ? 'Update' : 'Add'}
                </Button>
                {editingValue && (
                  <Button onClick={handleCreateValue}>Cancel</Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <List
          dataSource={selectedAttribute?.values || []}
          renderItem={(value) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEditValue(value)}
                >
                  Edit
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Delete Value"
                  description="Are you sure?"
                  onConfirm={() => handleDeleteValue(value.id)}
                  okText="Delete"
                  okType="danger"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={<Tag color="blue">{value.value}</Tag>}
                description={
                  <Space>
                    {typeof value.order_by === 'number' && <span>• Order: {value.order_by}</span>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default Attributes;
