import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Tag, Modal, Form, Select, Drawer, Card, Tabs, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, DeleteOutlined, HomeOutlined, TagsOutlined, MoreOutlined, MinusCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { User, UserMeta, Role, UserRole } from '@/lib/types';
import { message } from '@/lib/antdApp';

interface CustomerFormValues {
  username: string;
  email: string;
  display_name: string;
  status: number;
  role: string;
}

interface MetaFormValues {
  customMeta?: Array<{ key: string; value: unknown }>;
}

type RoleOption = Pick<Role, 'name' | 'slug' | 'display_name'>;

const Customers = () => {
  const [searchText, setSearchText] = useState('');
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [metaModalVisible, setMetaModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [metaForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const fetchCustomers = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await api.users.list({
        page,
        pageSize: pageSize,
        search: searchText || undefined,
      });
      setCustomers(res.items ?? []);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.pageSize,
        total: res.pagination.total,
      });
    } catch (error) {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1, pagination.pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers, pagination.pageSize]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.roles.list();
        const items = res.items ?? [];
        setRoles(items);
      } catch (error) {
        message.error('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (customer: User) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      username: customer.username,
      email: customer.email,
      display_name: customer.display_name,
      status: customer.status,
      roles: customer.roles?.map(role => role.name),
    });
    setModalVisible(true);
  };

  const handleViewAddresses = (customer: User) => {
    setEditingCustomer(customer);
    setDrawerVisible(true);
  };

  const handleManageMeta = async (customer: User) => {
    setEditingCustomer(customer);
    try {
      const res = await api.users.meta.list(customer.id);
      const customMeta = res.map((meta: UserMeta) => ({
        key: meta.meta_key,
        value: meta.meta_value,
      }));
      metaForm.setFieldsValue({ customMeta });
      setMetaModalVisible(true);
    } catch (error) {
      message.error('Failed to load user meta');
    }
  };

  const handleUpdateMeta = async (values: MetaFormValues) => {
    if (!editingCustomer) return;
    setSaving(true);
    try {
      const { customMeta } = values;
      if (customMeta && Array.isArray(customMeta)) {
        const metaObject = customMeta.reduce<Record<string, unknown>>((acc, entry) => {
          if (entry.key) {
            acc[entry.key] = entry.value;
          }
          return acc;
        }, {} as Record<string, unknown>);
        await api.users.meta.batchUpdate(editingCustomer.id, metaObject);
      }
      message.success('User meta updated successfully');
      setMetaModalVisible(false);
    } catch (error) {
      message.error('Failed to update user meta');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: 'Are you sure you want to delete this customer?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.users.delete(id);
          message.success('Customer deleted successfully');
          fetchCustomers(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete customer');
        }
      },
    });
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    try {
      if (editingCustomer) {
        await api.users.update(editingCustomer.id, values as unknown as Record<string, unknown>);
        message.success('Customer updated successfully');
      } else {
        await api.users.create(values as unknown as Record<string, unknown>);
        message.success('Customer created successfully');
      }
      setModalVisible(false);
      fetchCustomers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to save customer');
    }
  };

  const getActionMenuItems = (record: User): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: 'addresses',
      label: 'Addresses',
      icon: <HomeOutlined />,
      onClick: () => handleViewAddresses(record),
    },
    {
      key: 'meta',
      label: 'Meta',
      icon: <TagsOutlined />,
      onClick: () => handleManageMeta(record),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'display_name',
      key: 'display_name',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      width: 200,
      render: (userRoles: UserRole[]) => (
        <>
          {userRoles?.map(role => (
            <Tag key={role.name} color="blue">{role.display_name || role.name}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: unknown, record: User) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>
          {record.status === 1 ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Registered',
      dataIndex: 'registered_at',
      key: 'registered_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: User) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Customers</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Customer
        </Button>
      </div>
      <Input
        placeholder="Search customers..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchCustomers(page, pageSize),
        }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Create Customer'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="display_name" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>Active</Select.Option>
              <Select.Option value={0}>Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select role">
              {roles.map(role => (
                <Select.Option key={role.slug ?? role.name} value={role.slug ?? role.name}>
                  {role.display_name || role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Addresses Drawer */}
      <Drawer
        title="Customer Addresses"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {editingCustomer?.addresses && editingCustomer.addresses.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            {editingCustomer.addresses.map(addr => (
              <div key={addr.id} style={{ padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                <div><strong>{addr.first_name} {addr.last_name}</strong></div>
                {addr.company && <div>{addr.company}</div>}
                <div>{addr.address_1}</div>
                {addr.address_2 && <div>{addr.address_2}</div>}
                <div>{addr.city}, {addr.state} {addr.postcode}</div>
                <div>{addr.country}</div>
                {addr.phone && <div>Phone: {addr.phone}</div>}
                {addr.is_default && <Tag color="blue">Default</Tag>}
              </div>
            ))}
          </Space>
        ) : (
          <div>No addresses found</div>
        )}
      </Drawer>

      {/* Meta Management Modal */}
      <Modal
        title={`Customer Meta: ${editingCustomer?.display_name}`}
        open={metaModalVisible}
        onCancel={() => setMetaModalVisible(false)}
        onOk={() => metaForm.submit()}
        okButtonProps={{ loading: saving }}
        width={600}
      >
        <Form form={metaForm} layout="vertical" onFinish={handleUpdateMeta}>
          <Form.List name="customMeta">
            {(fields, { add, remove }) => (
              <>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {fields.map(field => (
                    <Space key={field.key} style={{ width: '100%' }} align="start">
                      <Form.Item
                        {...field}
                        name={[field.name, 'key']}
                        rules={[{ required: true, message: 'Key is required' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Meta Key" disabled={saving} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Meta Value" disabled={saving} />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                        disabled={saving}
                      />
                    </Space>
                  ))}
                </Space>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  disabled={saving}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  Add Custom Field
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
