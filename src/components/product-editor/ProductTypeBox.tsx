import { Card, Radio, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface Props {
  value: 'simple' | 'variable';
  onChange: (value: 'simple' | 'variable') => void;
  disabled?: boolean;
}

const ProductTypeBox = ({ value, onChange, disabled }: Props) => {
  return (
    <Card title="Product Type" size="small" className="shadow-sm">
      <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} className="w-full">
        <Space direction="vertical" className="w-full">
          <Radio value="simple">
            <Space>
              Simple Product
              <Tooltip title="A standalone product with no variations">
                <InfoCircleOutlined className="text-muted-foreground" />
              </Tooltip>
            </Space>
          </Radio>
          <Radio value="variable" disabled={disabled}>
            <Space>
              Variable Product
              <Tooltip title="A product with multiple variations (e.g., different CPU/RAM configurations)">
                <InfoCircleOutlined className="text-muted-foreground" />
              </Tooltip>
            </Space>
          </Radio>
        </Space>
      </Radio.Group>
      {disabled && (
        <div className="mt-2 text-xs text-muted-foreground">
          Cannot switch type while variations exist
        </div>
      )}
    </Card>
  );
};

export default ProductTypeBox;
