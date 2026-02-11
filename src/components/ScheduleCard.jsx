import { Card, Typography } from 'antd';

const { Text } = Typography;

const cardStyle = {
  borderRadius: 24,
  background: 'rgba(10, 12, 22, 0.76)',
  boxShadow: '0 35px 65px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 90px',
  alignItems: 'center',
  gap: 10,
  padding: '12px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
};

export default function ScheduleCard({ schedule }) {
  if (!schedule?.length) {
    return (
      <Card title="未来几日计划" style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Text type="secondary">暂无计划</Text>
      </Card>
    );
  }

  return (
    <Card title="未来几日计划" style={cardStyle} styles={{ body: { padding: 24 } }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {schedule.map((item, i) => (
          <div
            key={`${item.date}-${i}`}
            style={rowStyle}
            className="schedule-row"
          >
            <Text strong style={{ color: '#7dd3ff', fontSize: 16 }}>
              {item.date}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 500 }}>{item.title}</Text>
            <Text className="schedule-note" style={{ textAlign: 'right', color: '#c7d6ff' }}>{item.note}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
}
