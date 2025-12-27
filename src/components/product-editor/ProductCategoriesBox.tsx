import { useEffect, useMemo, useState } from 'react';
import { Card, Form, TreeSelect, Button } from 'antd';
import type { TreeSelectProps } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { Category } from '@/lib/types';
import { sanitizeCategoryTree } from '@/utils/taxonomy/sanitizeTaxonomy';
import { message } from '@/lib/antdApp';

type TreeNode = Required<TreeSelectProps['treeData']>[number];

const mapToTreeData = (nodes: Category[]): TreeNode[] =>
  nodes.map((node) => ({
    title: node.name,
    value: node.term_id,
    key: `${node.term_id}`,
    children:
      node.children && node.children.length ? mapToTreeData(node.children) : undefined,
  }));

const ProductCategoriesBox = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.taxonomies.categories.tree({});
      setCategories(sanitizeCategoryTree(res));
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load categories';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const treeData = useMemo(() => mapToTreeData(categories), [categories]);

  return (
    <Card
      title="Categories"
      size="small"
      className="shadow-sm"
      extra={
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading} />
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => navigate('/admin/categories')}>
            Manage
          </Button>
        </div>
      }
    >
      <Form.Item name="category_ids" className="mb-0">
        <TreeSelect
          treeData={treeData}
          placeholder="Select categories"
          treeCheckable
          showCheckedStrategy={TreeSelect.SHOW_PARENT}
          maxTagCount={4}
          allowClear
          loading={loading}
        />
      </Form.Item>
    </Card>
  );
};

export default ProductCategoriesBox;
