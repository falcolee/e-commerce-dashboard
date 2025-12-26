import { Table, Card, Tag, Button, Space } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, EditOutlined } from '@ant-design/icons';
import type { Permission, Role } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

interface PermissionMatrixProps {
  permissions: Permission[];
  roles: Role[];
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

const PermissionMatrix = ({ permissions, roles }: PermissionMatrixProps) => {
  const navigate = useNavigate();

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

  const hasPermission = (role: Role, permissionId: number): boolean => {
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return false;
    }
    return role.permissions.some(p => p.id === permissionId);
  };

  const groupedPermissions = groupPermissionsByResource(permissions);
  const resources = Object.keys(groupedPermissions).sort();

  const renderMatrix = () => {
    return resources.map(resource => {
      const resourcePermissions = groupedPermissions[resource];

      const columns = [
        {
          title: 'Permission',
          dataIndex: 'name',
          key: 'name',
          width: 250,
          fixed: 'left' as const,
          render: (text: string, record: Permission) => (
            <div>
              <div style={{ fontWeight: 500 }}>{record.display_name || text}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {record.resource}.{record.action}
              </div>
            </div>
          ),
        },
        ...roles.map(role => ({
          title: (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 500 }}>{role.display_name || role.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                {role.permissions?.length || 0} perms
              </div>
            </div>
          ),
          dataIndex: `role_${role.id}`,
          key: `role_${role.id}`,
          width: 120,
          align: 'center' as const,
          render: (_: unknown, record: Permission) => {
            const hasAccess = hasPermission(role, record.id);
            return hasAccess ? (
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: '18px' }} />
            ) : (
              <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: '18px' }} />
            );
          },
        })),
      ];

      return (
        <Card
          key={resource}
          title={
            <Space>
              <Tag color="blue">{resource}</Tag>
              <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#888' }}>
                {resourcePermissions.length} permissions
              </span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Table
            columns={columns}
            dataSource={resourcePermissions}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </Card>
      );
    });
  };

  return (
    <div>
      <Card style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: 4 }}>
                Permission Matrix (Read-Only)
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                This matrix shows which permissions are assigned to each role. To edit permissions, use the Roles Management page.
              </div>
            </div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate('/admin/roles')}
            >
              Edit Permissions
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <Space>
              <CheckCircleFilled style={{ color: '#52c41a', fontSize: '16px' }} />
              <span style={{ fontSize: '13px' }}>Permission Granted</span>
            </Space>
            <Space>
              <CloseCircleFilled style={{ color: '#d9d9d9', fontSize: '16px' }} />
              <span style={{ fontSize: '13px' }}>Permission Not Granted</span>
            </Space>
          </div>
        </Space>
      </Card>

      {renderMatrix()}

      {permissions.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            No permissions available
          </div>
        </Card>
      )}
    </div>
  );
};

export default PermissionMatrix;
