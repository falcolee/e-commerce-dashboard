import { useEffect, useState } from 'react';
import { Card, Form, Select, Button } from 'antd';
import type { SelectProps } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type { Tag } from '@/lib/types';
import { sanitizeTags } from '@/utils/taxonomy/sanitizeTaxonomy';
import { message } from '@/lib/antdApp';

const ProductTagsBox = () => {
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await api.taxonomies.tags.list({});
      const tagOptions = sanitizeTags(res?.items).map((tag: Tag) => ({
        label: tag.name,
        value: tag.term_id,
      }));
      setOptions(tagOptions);
    } catch (err) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load tags';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <Card
      title="Tags"
      size="small"
      className="shadow-sm"
      extra={
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<ReloadOutlined />} onClick={fetchTags} loading={loading} />
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => navigate('/admin/tags')}>
            Manage
          </Button>
        </div>
      }
    >
      <Form.Item name="tag_ids" className="mb-0">
        <Select
          mode="multiple"
          placeholder="Select tags"
          options={options}
          loading={loading}
          optionFilterProp="label"
          allowClear
          maxTagCount={5}
        />
      </Form.Item>
    </Card>
  );
};

export default ProductTagsBox;
