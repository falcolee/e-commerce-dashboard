import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Input, Modal, Form, Select, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Post } from '@/lib/types';
import WysiwygEditor from '@/components/common/WysiwygEditor';

const Pages = () => {
  const [searchText, setSearchText] = useState('');
  const [pages, setPages] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<Post | null>(null);
  const [form] = Form.useForm();

  const fetchPages = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await api.posts.list({
        page,
        page_size: pageSize,
        filter: { type: 'page' },
        search: searchText || undefined,
      });
      setPages(res.items ?? []);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.page_size,
        total: res.pagination.total,
      });
    } catch (error) {
      message.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPages(1, pagination.pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPages, pagination.pageSize]);

  const handleCreate = () => {
    setEditingPage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (page: Post) => {
    setEditingPage(page);
    form.setFieldsValue(page);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Page',
      content: 'Are you sure you want to delete this page?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.posts.delete(id);
          message.success('Page deleted successfully');
          fetchPages(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete page');
        }
      },
    });
  };

  const handleSubmit = async (values: PageFormValues) => {
    try {
      const payload = { ...values, type: 'page' };
      if (editingPage) {
        await api.posts.update(editingPage.id, payload);
        message.success('Page updated successfully');
      } else {
        await api.posts.create(payload);
        message.success('Page created successfully');
      }
      setModalVisible(false);
      fetchPages(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to save page');
    }
  };

  const getActionMenuItems = (record: Post): MenuProps['items'] => [
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

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 250,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'publish' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Post) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Pages</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Page
        </Button>
      </div>
      <Input
        placeholder="Search pages..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={pages}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchPages(page, pageSize),
        }}
      />

      <Modal
        title={editingPage ? 'Edit Page' : 'Create Page'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            help="Leave empty to auto-generate from title"
            rules={[{ required: !!editingPage, message: 'Slug is required for updates' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="excerpt" label="Excerpt">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <WysiwygEditor
              placeholder="Write your page content here..."
              className="min-h-[300px]"
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]} initialValue="draft">
            <Select>
              <Select.Option value="publish">Publish</Select.Option>
              <Select.Option value="draft">Draft</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="comment_status" label="Comment Status" rules={[{ required: true }]} initialValue="open">
            <Select>
              <Select.Option value="open">Open</Select.Option>
              <Select.Option value="closed">Closed</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

interface PageFormValues {
  title: string;
  slug?: string;
  content: string;
  status: string;
  excerpt?: string;
}

export default Pages;
