import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { Post } from '@/lib/types';
import WysiwygEditor from '@/components/common/WysiwygEditor';
import { message } from '@/lib/antdApp';

const Posts = () => {
  const [searchText, setSearchText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [form] = Form.useForm();

  const fetchPosts = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await api.posts.list({
        page,
        page_size: pageSize,
        filter: { type: 'post' },
        search: searchText || undefined,
      });
      setPosts(res.items ?? []);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.page_size,
        total: res.pagination.total,
      });
    } catch (error) {
      message.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, pagination.pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPosts, pagination.pageSize]);

  const handleCreate = () => {
    setEditingPost(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    form.setFieldsValue(post);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Post',
      content: 'Are you sure you want to delete this post?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.posts.delete(id);
          message.success('Post deleted successfully');
          fetchPosts(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete post');
        }
      },
    });
  };

  const handleSubmit = async (values: PostFormValues) => {
    try {
      const payload = { ...values, type: 'post' };
      if (editingPost) {
        await api.posts.update(editingPost.id, payload);
        message.success('Post updated successfully');
      } else {
        await api.posts.create(payload);
        message.success('Post created successfully');
      }
      setModalVisible(false);
      fetchPosts(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to save post');
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
        <h1>Posts</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Post
        </Button>
      </div>
      <Input
        placeholder="Search posts..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchPosts(page, pageSize),
        }}
      />

      <Modal
        title={editingPost ? 'Edit Post' : 'Create Post'}
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
            rules={[{ required: !!editingPost, message: 'Slug is required for updates' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="excerpt" label="Excerpt">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <WysiwygEditor
              placeholder="Write your post content here..."
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

interface PostFormValues {
  title: string;
  slug?: string;
  content: string;
  status: string;
  excerpt?: string;
}

export default Posts;
