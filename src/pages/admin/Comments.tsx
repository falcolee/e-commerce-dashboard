import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, Dropdown } from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  MessageOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import api from '@/lib/api';
import type { Comment } from '@/lib/types';
import { message } from '@/lib/antdApp';

const Comments = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [replyForm] = Form.useForm();

  const fetchComments = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        page_size: pageSize,
        search: searchText || undefined,
      };

      const filters: Record<string, string> = {};
      if (statusFilter) filters.status = statusFilter;
      if (typeFilter) filters.type = typeFilter;
      if (Object.keys(filters).length > 0) {
        params.filter = filters;
      }

      const res = await api.comments.list(params);

      setComments(res.items ?? []);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.page_size,
        total: res.pagination.total,
      });
    } catch (error) {
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments(1, pagination.pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchComments, pagination.pageSize]);

  const handleApprove = async (id: number) => {
    try {
      await api.comments.update(id, { status: 'approved' });
      message.success('Comment approved successfully');
      fetchComments(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to approve comment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.comments.update(id, { status: 'rejected' });
      message.success('Comment rejected successfully');
      fetchComments(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to reject comment');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Comment',
      content: 'Are you sure you want to delete this comment?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.comments.delete(id);
          message.success('Comment deleted successfully');
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const handleReply = (comment: Comment) => {
    setSelectedComment(comment);
    replyForm.resetFields();
    setReplyModalVisible(true);
  };

  const handleSubmitReply = async (values: { content: string }) => {
    if (!selectedComment) return;

    try {
      await api.comments.create({
        content: values.content,
        parent_id: selectedComment.id,
        product_id: selectedComment.product_id,
        post_id: selectedComment.post_id,
      });
      message.success('Reply posted successfully');
      setReplyModalVisible(false);
      fetchComments(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Failed to post reply');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select comments to approve');
      return;
    }

    Modal.confirm({
      title: 'Approve Selected Comments',
      content: `Are you sure you want to approve ${selectedRowKeys.length} comment(s)?`,
      okText: 'Approve',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((id) => api.comments.update(Number(id), { status: 'approved' }))
          );
          message.success('Comments approved successfully');
          setSelectedRowKeys([]);
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to approve comments');
        }
      },
    });
  };

  const handleBulkReject = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select comments to reject');
      return;
    }

    Modal.confirm({
      title: 'Reject Selected Comments',
      content: `Are you sure you want to reject ${selectedRowKeys.length} comment(s)?`,
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((id) => api.comments.update(Number(id), { status: 'rejected' }))
          );
          message.success('Comments rejected successfully');
          setSelectedRowKeys([]);
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to reject comments');
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select comments to delete');
      return;
    }

    Modal.confirm({
      title: 'Delete Selected Comments',
      content: `Are you sure you want to delete ${selectedRowKeys.length} comment(s)? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map((id) => api.comments.delete(Number(id))));
          message.success('Comments deleted successfully');
          setSelectedRowKeys([]);
          fetchComments(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error('Failed to delete comments');
        }
      },
    });
  };

  const getActionMenuItems = (record: Comment): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (record.status === 'pending') {
      items.push(
        {
          key: 'approve',
          label: 'Approve',
          icon: <CheckOutlined />,
          onClick: () => handleApprove(record.id),
        },
        {
          key: 'reject',
          label: 'Reject',
          icon: <CloseOutlined />,
          onClick: () => handleReject(record.id),
        }
      );
    }

    if (record.status === 'approved') {
      items.push({
        key: 'reply',
        label: 'Reply',
        icon: <MessageOutlined />,
        onClick: () => handleReply(record),
      });
    }

    if (items.length > 0) {
      items.push({ type: 'divider' });
    }

    items.push({
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    });

    return items;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Author',
      dataIndex: 'author_name',
      key: 'author_name',
      width: 150,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {content}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
        const currentValue = (selectedKeys?.[0] as string) || '';
        return (
          <div style={{ padding: 8 }}>
            <Select
              placeholder="Select type"
              value={currentValue || undefined}
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              style={{ marginBottom: 8, display: 'block', width: 200 }}
            >
              <Select.Option value="product">Product</Select.Option>
              <Select.Option value="post">Post</Select.Option>
            </Select>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setTypeFilter(currentValue || '');
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() => {
                  clearFilters?.();
                  setTypeFilter('');
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Clear
              </Button>
            </Space>
          </div>
        );
      },
      filteredValue: typeFilter ? [typeFilter] : null,
      render: (type: string) => (
        <Tag color={type === 'product' ? 'blue' : 'purple'}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Related',
      key: 'related',
      width: 200,
      render: (_: unknown, record: Comment) => (
        <span>{record.product_name || record.post_title || '-'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
        const currentValue = (selectedKeys?.[0] as string) || '';
        return (
          <div style={{ padding: 8 }}>
            <Select
              placeholder="Select status"
              value={currentValue || undefined}
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              style={{ marginBottom: 8, display: 'block', width: 200 }}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setStatusFilter(currentValue || '');
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() => {
                  clearFilters?.();
                  setStatusFilter('');
                  confirm();
                }}
                size="small"
                style={{ width: 90 }}
              >
                Clear
              </Button>
            </Space>
          </div>
        );
      },
      filteredValue: statusFilter ? [statusFilter] : null,
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Comment) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Comments</h1>
        {selectedRowKeys.length > 0 && (
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={handleBulkApprove}>
              Approve Selected ({selectedRowKeys.length})
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={handleBulkReject}>
              Reject Selected ({selectedRowKeys.length})
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              Delete Selected ({selectedRowKeys.length})
            </Button>
          </Space>
        )}
      </div>

      <Input
        placeholder="Search comments by author or content..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />

      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        rowSelection={rowSelection}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchComments(page, pageSize),
        }}
      />

      <Modal
        title={`Reply to ${selectedComment?.author_name}`}
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={() => replyForm.submit()}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>Original Comment:</strong>
          <p style={{ marginTop: 8, marginBottom: 0 }}>{selectedComment?.content}</p>
        </div>
        <Form form={replyForm} layout="vertical" onFinish={handleSubmitReply}>
          <Form.Item
            name="content"
            label="Your Reply"
            rules={[{ required: true, message: 'Please enter your reply' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter your reply..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Comments;
