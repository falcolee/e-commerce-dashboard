import { Timeline, Card, Tag, Empty } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  CarOutlined,
  HomeOutlined
} from '@ant-design/icons';
import type { OrderShipment } from '@/lib/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface TrackingTimelineProps {
  shipment: OrderShipment;
}

interface TimelineEvent {
  status: string;
  timestamp: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

const TrackingTimeline = ({ shipment }: TrackingTimelineProps) => {
  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined />,
      shipped: <RocketOutlined />,
      in_transit: <CarOutlined />,
      delivered: <HomeOutlined />,
      cancelled: <CloseCircleOutlined />,
    };
    return icons[status] || <CheckCircleOutlined />;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'gray',
      shipped: 'blue',
      in_transit: 'orange',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  const getStatusDescription = (status: string): string => {
    const descriptions: Record<string, string> = {
      pending: 'Shipment created and awaiting pickup',
      shipped: 'Package has been picked up by carrier',
      in_transit: 'Package is in transit to destination',
      delivered: 'Package has been delivered successfully',
      cancelled: 'Shipment has been cancelled',
    };
    return descriptions[status] || 'Status updated';
  };

  // Build timeline events from shipment data
  const buildTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Created event
    events.push({
      status: 'created',
      timestamp: shipment.created_at,
      description: 'Shipment created',
      icon: <ClockCircleOutlined />,
      color: 'gray',
    });

    // Shipped event
    if (shipment.shipped_at) {
      events.push({
        status: 'shipped',
        timestamp: shipment.shipped_at,
        description: getStatusDescription('shipped'),
        icon: getStatusIcon('shipped'),
        color: getStatusColor('shipped'),
      });
    }

    // Current status event (if different from shipped/delivered)
    if (shipment.status !== 'pending' && shipment.status !== 'shipped' && !shipment.delivered_at) {
      events.push({
        status: shipment.status,
        timestamp: shipment.updated_at,
        description: getStatusDescription(shipment.status),
        icon: getStatusIcon(shipment.status),
        color: getStatusColor(shipment.status),
      });
    }

    // Delivered event
    if (shipment.delivered_at) {
      events.push({
        status: 'delivered',
        timestamp: shipment.delivered_at,
        description: getStatusDescription('delivered'),
        icon: getStatusIcon('delivered'),
        color: getStatusColor('delivered'),
      });
    }

    // Sort by timestamp (newest first)
    return events.sort((a, b) =>
      dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
    );
  };

  const timelineEvents = buildTimelineEvents();

  if (timelineEvents.length === 0) {
    return (
      <Empty
        description="No tracking information available"
        style={{ padding: '40px 0' }}
      />
    );
  }

  return (
    <div>
      {/* Shipment Info Card */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Order ID</div>
            <div style={{ fontWeight: 500 }}>#{shipment.order_id}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Tracking Number</div>
            <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{shipment.tracking_number}</div>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Carrier</div>
            <Tag color="blue">{shipment.carrier}</Tag>
          </div>
          <div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>Current Status</div>
            <Tag color={getStatusColor(shipment.status)}>
              {shipment.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card title="Tracking History">
        <Timeline
          items={timelineEvents.map((event) => ({
            dot: event.icon,
            color: event.color,
            children: (
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  {event.description}
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <div style={{ color: '#999', fontSize: 11, marginTop: 4 }}>
                  {dayjs(event.timestamp).fromNow()}
                </div>
              </div>
            ),
          }))}
        />
      </Card>

      {/* Estimated Delivery */}
      {shipment.status === 'in_transit' && !shipment.delivered_at && (
        <Card style={{ marginTop: 16, background: '#f0f9ff', borderColor: '#91caff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CarOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 500, color: '#1890ff' }}>Package in Transit</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Your package is on its way to the destination
              </div>
            </div>
          </div>
        </Card>
      )}

      {shipment.status === 'delivered' && shipment.delivered_at && (
        <Card style={{ marginTop: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
            <div>
              <div style={{ fontWeight: 500, color: '#52c41a' }}>Package Delivered</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Delivered on {dayjs(shipment.delivered_at).format('YYYY-MM-DD HH:mm')}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TrackingTimeline;
