import { Card, Typography, Space } from 'antd';

const { Text } = Typography;

const cardStyle = {
  borderRadius: 32,
  border: 0,
  background: 'rgba(6, 10, 20, 0.95)',
  boxShadow: '0 40px 90px rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(26px)',
};

const rowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '20px 26px',
  borderRadius: 32,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(18, 24, 50, 0.75)',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.03)',
};

const rowContentStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 18,
  width: '100%',
};

const labelStyle = {
  fontSize: 14,
  color: '#8cd6ff',
  letterSpacing: 0.18,
  textTransform: 'uppercase',
};

const valueStyle = {
  fontSize: 18,
  color: '#f8fbff',
  fontWeight: 600,
};

const noteStyle = {
  fontSize: 16,
  color: '#62c4ff',
};

export default function ScheduleCard({ schedule = [], refreshing = false }) {
  return (
    <Card
      className="component-card schedule-card"
      title={
        <Space>
          <span>未来几日计划</span>
          {refreshing && <span className="tag">同步中...</span>}
        </Space>
      }
      style={cardStyle}
      bodyStyle={{ padding: 24 }}
    >
      {!schedule?.length ? (
        <Text type="secondary" style={{ display: 'block', padding: '12px 0' }}>
          暂无可展示的计划，稍后自动同步
        </Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedule.map((item) => (
            <div
              key={item.id}
              style={rowStyle}
              className={`schedule-row${item.highlight ? ' schedule-row-highlight' : ''}`}
            >
              <div style={rowContentStyle}>
                <div>
                  <Text style={labelStyle}>{item.label || item.date}</Text>
                  <p style={valueStyle}>{item.title}</p>
                </div>
                <Text style={noteStyle}>{item.time || item.note || '—'}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
