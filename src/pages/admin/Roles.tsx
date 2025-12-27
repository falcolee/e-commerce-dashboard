import { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, List, Modal, Form, Input, Select, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Role, Permission } from '@/lib/types';
import { message } from '@/lib/antdApp';

interface RoleFormValues {
  name: string;
  display_name: string;
  description?: string;
  permission_ids: number[];
}

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // Fetch all roles - get first page to determine total pages
      const res = await api.roles.list({});
      const allRoles: Role[] = res.items;
      setRoles(allRoles);
    } catch (error) {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      // Fetch all permissions - get first page to determine total pages
      const res = await api.permissions.list({ page: 1, page_size: 100 });
      const allPermissions: Permission[] = [...(res.items ?? [])];

      if (res.pagination.total_pages > 1) {
        const pagePromises = [] as Promise<typeof res>[];
        for (let page = 2; page <= res.pagination.total_pages; page++) {
          pagePromises.push(api.permissions.list({ page, page_size: 100 }));
        }
        const pageResults = await Promise.all(pagePromises);
        pageResults.forEach((pageRes) => {
          allPermissions.push(...(pageRes.items ?? []));
        });
      }

      setPermissions(allPermissions);
    } catch (error) {
      message.error('Failed to load permissions');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permission_ids: role.permissions && Array.isArray(role.permissions) ? role.permissions.map(p => p.id) : [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Role',
      content: 'Are you sure you want to delete this role?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.roles.delete(id);
          message.success('Role deleted successfully');
          fetchRoles();
        } catch (error) {
          message.error('Failed to delete role');
        }
      },
    });
  };

  const handleSubmit = async (values: RoleFormValues) => {
    try {
      if (editingRole) {
        await api.roles.update(editingRole.id, values);
        message.success('Role updated successfully');
      } else {
        await api.roles.create(values);
        message.success('Role created successfully');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      message.error('Failed to save role');
    }
  };

  const getActionMenuItems = (record: Role): MenuProps['items'] => [
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
      disabled: record.is_system,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Display Name',
      dataIndex: 'display_name',
      key: 'display_name',
      width: 200,
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: Permission[]) => {
        if (!permissions || !Array.isArray(permissions)) {
          return <Tag>No permissions</Tag>;
        }
        return (
          <>
            {permissions.slice(0, 3).map((perm) => (
              <Tag key={perm.id} color="blue">
                {perm.display_name || `${perm.resource}:${perm.action}`}
              </Tag>
            ))}
            {permissions.length > 3 && <Tag>+{permissions.length - 3} more</Tag>}
          </>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Role) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Roles & Permissions</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Role
        </Button>
      </div>
      <Table columns={columns} dataSource={roles} rowKey="id" loading={loading} scroll={{ x: 900 }} pagination={false} />
      <Card title="Available Permissions" style={{ marginTop: 24 }}>
        <List
          dataSource={permissions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Tag color="blue">{item.display_name || item.name}</Tag>}
                description={`${item.resource}.${item.action}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title={editingRole ? 'Edit Role' : 'Create Role'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input disabled={!!editingRole?.is_system} />
          </Form.Item>
          <Form.Item name="display_name" label="Display Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="permission_ids" label="Permissions" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select permissions">
              {permissions.map(perm => (
                <Select.Option key={perm.id} value={perm.id}>
                  {perm.display_name || perm.name} ({perm.resource}:{perm.action})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Roles;
