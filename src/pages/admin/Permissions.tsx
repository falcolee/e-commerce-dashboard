import { useState, useEffect } from 'react';
import { Table, Button, Input, Card, Tabs, Tag, Space } from 'antd';
import { SearchOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Permission, Role } from '@/lib/types';
import PermissionMatrix from '@/components/permissions/PermissionMatrix';
import { message } from '@/lib/antdApp';

const { TabPane } = Tabs;

interface GroupedPermissions {
  [resource: string]: Permission[];
}

const Permissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  const fetchPermissions = async () => {
    setLoading(true);
    try {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.roles.list({ page: 1, page_size: 100 });
      const allRoles: Role[] = [...(res.items ?? [])];

      if (res.pagination.total_pages > 1) {
        const pagePromises = [] as Promise<typeof res>[];
        for (let page = 2; page <= res.pagination.total_pages; page++) {
          pagePromises.push(api.roles.list({ page, page_size: 100 }));
        }
        const pageResults = await Promise.all(pagePromises);
        pageResults.forEach((pageRes) => {
          allRoles.push(...(pageRes.items ?? []));
        });
      }

      setRoles(allRoles);
    } catch (error) {
      message.error('Failed to load roles');
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const groupPermissionsByResource = (perms: Permission[]): GroupedPermissions => {
    return perms.reduce((acc, perm) => {
      const resource = perm.resource || 'other';
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(perm);
      return acc;
    }, {} as GroupedPermissions);
  };

  const filteredPermissions = permissions.filter(perm => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      perm.name?.toLowerCase().includes(search) ||
      perm.resource?.toLowerCase().includes(search) ||
      perm.action?.toLowerCase().includes(search) ||
      perm.display_name?.toLowerCase().includes(search) ||
      perm.description?.toLowerCase().includes(search)
    );
  });

  const groupedPermissions = groupPermissionsByResource(filteredPermissions);

  const columns = [
    {
      title: 'Permission',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: Permission) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.display_name || text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{text}</div>
        </div>
      ),
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (text: string) => <Tag color="green">{text}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  const renderListView = () => {
    const resources = Object.keys(groupedPermissions).sort();

    return (
      <div>
        {resources.map(resource => (
          <Card
            key={resource}
            title={
              <Space>
                <Tag color="blue">{resource}</Tag>
                <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#888' }}>
                  {groupedPermissions[resource].length} permissions
                </span>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={columns}
              dataSource={groupedPermissions[resource]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Permissions Management</h1>
        <Button type="link" href="/admin/roles">
          Go to Roles Management to Edit Permissions
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Search permissions by name, resource, action, or description..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'list',
                label: (
                  <span>
                    <AppstoreOutlined /> List View
                  </span>
                ),
              },
              {
                key: 'matrix',
                label: (
                  <span>
                    <TableOutlined /> Matrix View
                  </span>
                ),
              },
            ]}
          />
        </Space>
      </Card>

      {loading ? (
        <Card loading={loading}>
          <div style={{ height: 400 }} />
        </Card>
      ) : (
        <>
          {activeTab === 'list' && renderListView()}
          {activeTab === 'matrix' && (
            <PermissionMatrix
              permissions={filteredPermissions}
              roles={roles}
            />
          )}
        </>
      )}

      {!loading && filteredPermissions.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            No permissions found matching your search criteria
          </div>
        </Card>
      )}
    </div>
  );
};

export default Permissions;
