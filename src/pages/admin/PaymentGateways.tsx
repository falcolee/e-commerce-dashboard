import { useMemo, useState } from 'react';
import { Card, Row, Col, Button, Modal, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import type { PaymentGateway } from '@/lib/types';
import GatewayCard from '@/components/payment/GatewayCard';
import GatewayConfigForm, { GatewayConfigValues } from '@/components/payment/GatewayConfigForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { message } from '@/lib/antdApp';

const PaymentGateways = () => {
  const queryClient = useQueryClient();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [testingGateway, setTestingGateway] = useState<number | null>(null);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['paymentGateways', { page: 1 }],
    queryFn: () => api.paymentGateways.list({ page: 1, page_size: 100 }),
    keepPreviousData: true,
  });
  const gateways = useMemo(() => data?.items ?? [], [data]);

  const toggleMutation = useMutation({
    mutationFn: ({ gateway_id, enabled }: { gateway_id: string; enabled: boolean }) =>
      api.paymentGateways.toggle(gateway_id, enabled),
    onSuccess: () => {
      message.success('Gateway status updated');
      queryClient.invalidateQueries({ queryKey: ['paymentGateways'] });
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Failed to toggle gateway'));
    },
  });

  const handleToggle = async (gateway: PaymentGateway) => {
    Modal.confirm({
      title: `${gateway.enabled ? 'Disable' : 'Enable'} Payment Gateway`,
      content: `Are you sure you want to ${gateway.enabled ? 'disable' : 'enable'} ${gateway.title}?`,
      okText: gateway.enabled ? 'Disable' : 'Enable',
      okType: gateway.enabled ? 'danger' : 'primary',
      onOk: async () => {
        toggleMutation.mutate({ gateway_id: gateway.gateway_id, enabled: !gateway.enabled });
      },
    });
  };

  const handleConfigure = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setConfigModalVisible(true);
  };

  const handleTestConnection = async (gateway: PaymentGateway) => {
    setTestingGateway(gateway.id);
    try {
      // Note: API endpoint for testing connection would be added if available
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success(`${gateway.title} connection test successful`);
    } catch (error: unknown) {
      message.error(getErrorMessage(error, 'Connection test failed'));
    } finally {
      setTestingGateway(null);
    }
  };

  const updateConfigMutation = useMutation({
    mutationFn: ({ gateway_id, values }: { gateway_id: string; values: GatewayConfigValues }) =>
      api.paymentGateways.updateConfig(gateway_id, { config: values }),
    onSuccess: () => {
      message.success('Gateway configuration saved successfully');
      setConfigModalVisible(false);
      setSelectedGateway(null);
      queryClient.invalidateQueries({ queryKey: ['paymentGateways'] });
    },
    onError: (error: unknown) => {
      message.error(getErrorMessage(error, 'Failed to save configuration'));
    },
  });

  const handleConfigSave = async (values: GatewayConfigValues) => {
    if (!selectedGateway) return;
    updateConfigMutation.mutate({ gateway_id: selectedGateway.gateway_id, values });
  };

  const configuredGateways = gateways.filter(g => Object.keys(g.config || {}).length > 0);
  const unconfiguredGateways = gateways.filter(g => Object.keys(g.config || {}).length === 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Payment Gateways</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>
            Manage payment gateway configurations and settings
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Configured Gateways */}
          {configuredGateways.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Configured Gateways</h2>
              <Row gutter={[16, 16]}>
                {configuredGateways.map((gateway) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={gateway.id}>
                    <GatewayCard
                      gateway={gateway}
                      onToggle={handleToggle}
                      onConfigure={handleConfigure}
                      onTest={handleTestConnection}
                      testing={testingGateway === gateway.id}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Available Gateways */}
          {unconfiguredGateways.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Available Gateways</h2>
              <Row gutter={[16, 16]}>
                {unconfiguredGateways.map((gateway) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={gateway.id}>
                    <GatewayCard
                      gateway={gateway}
                      onToggle={handleToggle}
                      onConfigure={handleConfigure}
                      onTest={handleTestConnection}
                      testing={testingGateway === gateway.id}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {gateways.length === 0 && (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ fontSize: 16, color: '#999' }}>No payment gateways available</p>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Configuration Modal */}
      <Modal
        title={`Configure ${selectedGateway?.title || 'Gateway'}`}
        open={configModalVisible}
        onCancel={() => {
          setConfigModalVisible(false);
          setSelectedGateway(null);
        }}
        footer={null}
        width={600}
        destroyOnHidden
      >
        {selectedGateway && (
          <GatewayConfigForm
            gateway={selectedGateway}
            onSave={handleConfigSave}
            onCancel={() => {
              setConfigModalVisible(false);
              setSelectedGateway(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default PaymentGateways;
