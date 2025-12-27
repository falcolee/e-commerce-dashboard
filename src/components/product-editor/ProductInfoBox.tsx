import { Card, Descriptions, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { Product } from '@/lib/types';
import dayjs from 'dayjs';
import { message } from '@/lib/antdApp';

interface Props {
  product: Product | null;
}

const ProductInfoBox = ({ product }: Props) => {
  if (!product) return null;

  const copyPermalink = () => {
    const permalink = `${window.location.origin}/product/${product.slug}`;
    navigator.clipboard.writeText(permalink);
    message.success('Permalink copied to clipboard');
  };

  return (
    <Card title="Product Info" size="small" className="shadow-sm">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="ID">{product.id}</Descriptions.Item>
        <Descriptions.Item label="Created">
          {dayjs(product.created_at).format('MMM D, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Updated">
          {dayjs(product.updated_at).format('MMM D, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Permalink">
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={copyPermalink}
            className="p-0 h-auto"
          >
            Copy URL
          </Button>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProductInfoBox;
