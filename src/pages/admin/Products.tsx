import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Button, Space, Tag, Image, Input, Modal, Form, Select, message, InputNumber, Dropdown } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagsOutlined,
  MoreOutlined,
  FilterOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { FilterDropdownProps, SorterResult } from 'antd/es/table/interface';
import api from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductVariationsSection from '@/components/product-editor/ProductVariationsSection';

const Products = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const [searchText, setSearchText] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | undefined>(undefined);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [variantsModalVisible, setVariantsModalVisible] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockForm] = Form.useForm();

  const fetchProducts = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        page_size: pageSize,
        search: nameFilter || searchText || undefined,
      };
      
      if (typeFilter) {
        params.filter = { type: typeFilter };
      }
      
      const res = await api.products.list(params);
      let productList = res.items ?? [];
      
      // Apply client-side sorting for price if needed
      if (sortField === 'price' && sortOrder) {
        productList = [...productList].sort((a: Product, b: Product) => {
          const priceA = a.sale_price || a.regular_price || 0;
          const priceB = b.sale_price || b.regular_price || 0;
          return sortOrder === 'ascend' ? priceA - priceB : priceB - priceA;
        });
      }
      
      setProducts(productList);
      setPagination({
        current: res.pagination.page,
        pageSize: res.pagination.page_size,
        total: res.pagination.total,
      });
    } catch (error) {
      message.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [nameFilter, searchText, typeFilter, sortField, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, pagination.pageSize);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts, pagination.pageSize]);

  const handleCreate = () => {
    navigate('/admin/products/new');
  };

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: t('deleteConfirm'),
      content: t('deleteConfirmMessage'),
      okText: t('delete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await api.products.delete(id);
          message.success(t('deleteSuccess'));
          fetchProducts(pagination.current, pagination.pageSize);
        } catch (error) {
          message.error(t('deleteFailed'));
        }
      },
    });
  };

  const handleManageStock = (product: Product) => {
    setSelectedProduct(product);
    stockForm.setFieldsValue({
      stock_quantity: product.stock_quantity,
      stock_status: product.stock_status,
    });
    setStockModalVisible(true);
  };

  const handleManageVariants = (product: Product) => {
    setVariantProduct(product);
    setVariantsModalVisible(true);
  };

  interface StockFormValues {
    stock_quantity?: number;
    stock_status?: Product['stock_status'];
  }

  const handleUpdateStock = async (values: StockFormValues) => {
    if (!selectedProduct) return;

    try {
      await api.products.stock.update(selectedProduct.id, values);
      message.success(t('stockUpdateSuccess'));
      setStockModalVisible(false);
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(t('stockUpdateFailed'));
    }
  };

  const getActionMenuItems = (record: Product): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    ...(record.type === 'variable'
      ? [{
          key: 'variants',
          label: 'Manage Variants',
          icon: <AppstoreOutlined />,
          onClick: () => handleManageVariants(record),
        }]
      : []),
    {
      key: 'stock',
      label: 'Manage Stock',
      icon: <TagsOutlined />,
      onClick: () => handleManageStock(record),
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
      title: 'Image',
      dataIndex: 'images',
      key: 'image',
      width: 80,
      render: (_: unknown, record: Product) => (
        <Image 
          src={record.featured_image || record.images?.[0]?.url || 'https://via.placeholder.com/50'}
          alt={record.name}
          width={50} 
          height={50} 
          style={{ objectFit: 'cover' }} 
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => {
        const currentValue = (selectedKeys?.[0] as string) || '';
        return (
          <div style={{ padding: 8 }}>
            <Input
              placeholder={t('searchName')}
              value={currentValue}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => {
                setNameFilter(currentValue || '');
                confirm();
              }}
              style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
                onClick={() => {
                setNameFilter(currentValue || '');
                confirm();
              }}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
                <Button
                  onClick={() => {
                clearFilters?.();
                setNameFilter('');
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
      filteredValue: nameFilter ? [nameFilter] : null,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filterIcon: (filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
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
            <Select.Option value="simple">Simple</Select.Option>
            <Select.Option value="variable">Variable</Select.Option>
          </Select>
          <Space>
            <Button
              type="primary"
                onClick={() => {
                setTypeFilter(currentValue || '');
                confirm();
              }}
              icon={<FilterOutlined />}
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
        <Tag color={type === 'variable' ? 'purple' : 'blue'}>{type.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: 'Price',
      key: 'price',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'price' ? sortOrder : null,
      render: (_: unknown, record: Product) => {
        const price = record.sale_price || record.regular_price || 0;
        return `$${price.toFixed(2)}`;
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 100,
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
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_: unknown, record: Product) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Products</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Product
        </Button>
      </div>
      <Input
        placeholder={t('searchProducts')}
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchProducts(page, pageSize),
        }}
        onChange={(_, __, sorterParam: SorterResult<Product>) => {
          if (sorterParam.field === 'price' && sorterParam.order) {
            setSortField('price');
            setSortOrder(sorterParam.order);
          } else {
            setSortField(undefined);
            setSortOrder(undefined);
          }
        }}
      />

      {/* Stock Management Modal */}
      <Modal
        title={`Manage Stock: ${selectedProduct?.name}`}
        open={stockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        onOk={() => stockForm.submit()}
      >
        <Form form={stockForm} layout="vertical" onFinish={handleUpdateStock}>
          <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_status" label="Stock Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="instock">In Stock</Select.Option>
              <Select.Option value="outofstock">Out of Stock</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Manage Variants: ${variantProduct?.name ?? ''}`}
        open={variantsModalVisible}
        onCancel={() => {
          setVariantsModalVisible(false);
          setVariantProduct(null);
        }}
        footer={null}
        width={960}
        destroyOnClose
      >
        {variantProduct ? (
          <ProductVariationsSection
            productId={variantProduct.id}
            onVariationsChange={() => fetchProducts(pagination.current, pagination.pageSize)}
          />
        ) : null}
      </Modal>

    </div>
  );
};

export default Products;
