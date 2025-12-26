import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, message, Dropdown, TreeSelect, Upload, Image, InputNumber } from 'antd';
import type { MenuProps, TreeSelectProps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import api from '@/lib/api';
import type { Category } from '@/lib/types';

type CategoryTreeNode = Required<TreeSelectProps['treeData']>[number];

const PostCategories = () => {
  const taxonomy = 'post_cat';
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const tree = await api.taxonomies.categories.tree({ filter: { taxonomy } });
      setCategories(tree || []);
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(apiError || 'Failed to load post categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ menu_order: 0, image_url: '' });
    setImageFile(null);
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_id: category.parent_id || undefined,
      menu_order: category.menu_order ?? 0,
      image_url: category.image_url ?? '',
    });
    if (category.image_url) {
      setImageFile({
        uid: `-${category.id}`,
        name: 'category-image',
        status: 'done',
        url: category.image_url,
      });
    } else {
      setImageFile(null);
    }
    setModalVisible(true);
  };

  const handleImageChange = async ({ file }: UploadChangeParam<UploadFile>) => {
    if (file.status === 'removed') {
      setImageFile(null);
      form.setFieldsValue({ image_url: '' });
      return;
    }

    if (!file.originFileObj) {
      return;
    }

    setUploadingImage(true);
    try {
      const mediaItem = await api.media.upload(file.originFileObj as File, {
        title: file.name,
        alt_text: file.name,
      });

      const doneFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: mediaItem.url,
      };
      setImageFile(doneFile);
      form.setFieldsValue({ image_url: mediaItem.url });
      message.success('Post category image uploaded successfully');
    } catch (error) {
      message.error('Failed to upload post category image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete Post Category',
      content: 'Are you sure you want to delete this post category? Categories with children cannot be deleted.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.taxonomies.categories.delete(id);
          message.success('Post category deleted successfully');
          fetchCategories();
        } catch (error: unknown) {
          const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
          message.error(apiError || 'Failed to delete post category');
        }
      },
    });
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || '',
        parent_id: values.parent_id || 0,
        menu_order: values.menu_order ?? 0,
        image_url: values.image_url ?? '',
      };

      if (editingCategory) {
        await api.taxonomies.categories.update(editingCategory.id, payload);
        message.success('Post category updated successfully');
      } else {
        await api.taxonomies.categories.create({ ...payload, taxonomy });
        message.success('Post category created successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(apiError || 'Failed to save post category');
    }
  };

  const getActionMenuItems = (record: Category): MenuProps['items'] => [
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

  const buildTreeSelectData = (cats: Category[], currentId?: number): CategoryTreeNode[] => {
    return cats
      .filter(cat => cat.id !== currentId)
      .map(cat => ({
        value: cat.id,
        title: cat.name,
        children: cat.children ? buildTreeSelectData(cat.children, currentId) : undefined,
      }));
  };

  const filterTree = (data: Category[], search: string): Category[] => {
    if (!search) return data;

    const filtered: Category[] = [];
    for (const item of data) {
      if (item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.slug.toLowerCase().includes(search.toLowerCase())) {
        filtered.push(item);
      } else if (item.children) {
        const filteredChildren = filterTree(item.children, search);
        if (filteredChildren.length > 0) {
          filtered.push({ ...item, children: filteredChildren });
        }
      }
    }
    return filtered;
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url: string | undefined) =>
        url ? <Image src={url} width={40} height={40} style={{ objectFit: 'cover' }} /> : null,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
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
      width: 300,
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
      title: 'Order',
      dataIndex: 'menu_order',
      key: 'menu_order',
      width: 100,
      render: (order: number | undefined) => order ?? 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Category) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const displayData = searchText ? filterTree(categories, searchText) : categories;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Post Categories</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Post Category
        </Button>
      </div>
      <Input
        placeholder="Search post categories..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={displayData}
        rowKey="id"
        loading={loading}
        pagination={false}
        expandable={{
          defaultExpandAllRows: false,
        }}
      />

      <Modal
        title={editingCategory ? 'Edit Post Category' : 'Create Post Category'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter category name' }]}>
            <Input placeholder="e.g., News" />
          </Form.Item>
          <Form.Item name="menu_order" label="Menu Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Category Image">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={imageFile ? [imageFile] : []}
              beforeUpload={() => false}
              onChange={handleImageChange}
              onRemove={() => {
                setImageFile(null);
                form.setFieldsValue({ image_url: '' });
                return true;
              }}
              disabled={uploadingImage}
            >
              {imageFile ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{uploadingImage ? 'Uploading...' : 'Upload'}</div>
                </div>
              )}
            </Upload>
            <Form.Item name="image_url" hidden>
              <Input />
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            help="Leave empty to auto-generate from name"
            rules={[{ required: !!editingCategory, message: 'Slug is required for updates' }]}
          >
            <Input placeholder="e.g., news" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional category description" />
          </Form.Item>
          <Form.Item name="parent_id" label="Parent Category">
            <TreeSelect
              showSearch
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Select parent category (optional)"
              allowClear
              treeDefaultExpandAll={false}
              treeData={[
                { value: 0, title: 'None (Top Level)' },
                ...buildTreeSelectData(categories, editingCategory?.id),
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

interface CategoryFormValues {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number;
  menu_order?: number;
  image_url?: string;
}

export default PostCategories;
