import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Tag } from '@/lib/types';

const Tags = () => {
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchTags = async (page = 1, pageSize = 30) => {
    setLoading(true);
    try {
      const res = await api.taxonomies.tags.list({
        filter: {taxonomy: 'product_tag'},
        page,
        page_size: pageSize,
      });
      setTags(res.items ?? []);
      setPagination({
        current: res.pagination?.page || 1,
        pageSize: res.pagination?.page_size || 30,
        total: res.pagination?.total || 0,
      });
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(apiError || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.setFieldsValue({
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Tag',
      content: 'Are you sure you want to delete this tag?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.taxonomies.tags.delete(id);
          message.success('Tag deleted successfully');
          fetchTags();
        } catch (error: unknown) {
          const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
          message.error(apiError || 'Failed to delete tag');
        }
      },
    });
  };

  const handleSubmit = async (values: { name: string; slug?: string; description?: string }) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || '',
      };

      if (editingTag) {
        await api.taxonomies.tags.update(editingTag.id, payload);
        message.success('Tag updated successfully');
      } else {
        await api.taxonomies.tags.create(payload);
        message.success('Tag created successfully');
      }
      setModalVisible(false);
      fetchTags();
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(apiError || 'Failed to save tag');
    }
  };

  const getActionMenuItems = (record: Tag): MenuProps['items'] => [
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
      onClick: () => handleDelete(record.id),
    },
  ];

  const handleTableChange = (newPagination: any) => {
    fetchTags(newPagination.current, newPagination.pageSize);
  };

  const filteredTags = searchText
    ? tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchText.toLowerCase()) ||
          tag.slug.toLowerCase().includes(searchText.toLowerCase())
      )
    : tags;

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
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 350,
      ellipsis: true,
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Tag) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Product Tags</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Tag
        </Button>
      </div>
      <Input
        placeholder="Search tags..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={filteredTags}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: searchText ? filteredTags.length : pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} tags`,
          onChange: (page, pageSize) => {
            if (!searchText) {
              handleTableChange({ current: page, pageSize });
            }
          },
        }}
      />

      <Modal
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter tag name' }]}>
            <Input placeholder="e.g., New Arrival" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            help="Leave empty to auto-generate from name"
            rules={[{ required: !!editingTag, message: 'Slug is required for updates' }]}
          >
            <Input placeholder="e.g., new-arrival" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional tag description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tags;
