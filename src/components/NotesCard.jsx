import { Card, Typography, Divider, Space } from 'antd';

const { Title, Text } = Typography;

export default function NotesCard({ notes = { sections: [] }, loading = false }) {
  const sections = notes.sections || [];

  return (
    <Card
      className="component-card notes-card"
      title="Notes"
      loading={loading}
      style={{ marginTop: 24 }}
    >
      {sections.length === 0 && !loading ? (
        <Text type="secondary">暂无记录，稍后会自动更新</Text>
      ) : (
        sections.map((section) => (
          <div key={section.title} className="notes-section">
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Title level={4} style={{ margin: 0 }}>
                {section.title}
              </Title>
              {(section.items || []).map((item, idx) => (
                <Text key={`${section.title}-${idx}`} style={{ display: 'block' }}>
                  • {item}
                </Text>
              ))}
            </Space>
            {section !== sections[sections.length - 1] && <Divider />}
          </div>
        ))
      )}
    </Card>
  );
}
