import { Card, Button } from 'antd';

const cardStyle = {
  borderRadius: 24,
  background: 'rgba(10, 12, 22, 0.76)',
  boxShadow: '0 35px 65px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const avatarStyle = {
  width: 96,
  height: 96,
  borderRadius: 26,
  border: '2px solid rgba(255, 255, 255, 0.4)',
  objectFit: 'cover',
  backgroundColor: '#0c0f20',
};

export default function HeroCard({ profile, onRefresh }) {
  return (
    <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <img
          src="/avatar.png"
          alt="Yiyu 的头像"
          style={avatarStyle}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 22, marginBottom: 8, color: '#f7f9ff', fontWeight: 600 }}>
            {profile.name}
          </h2>
          <p style={{ color: '#9bb2ff', marginBottom: 16 }}>{profile.tagline}</p>
          <Button
            type="primary"
            onClick={onRefresh}
            block
            style={{
              height: 44,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #3898ff, #4fd2ff)',
              border: 'none',
              color: '#03030b',
              fontWeight: 600,
            }}
          >
            刷新页面
          </Button>
        </div>
      </div>
    </Card>
  );
}
