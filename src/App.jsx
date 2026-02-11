import { useState, useEffect } from 'react';
import { Spin, message } from 'antd';
import HeroCard from './components/HeroCard';
import ScheduleCard from './components/ScheduleCard';
import { fetchProfile } from './api/profile';

const SITE_VERSION = '20260211-react';

function handleRefresh() {
  try {
    localStorage.removeItem('siteVersion');
  } catch (_) {}
  window.location.reload();
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        setData(res);
        try {
          localStorage.setItem('siteVersion', SITE_VERSION);
        } catch (_) {}
      })
      .catch(() => {
        setError(true);
        message.error('无法获取配置，请稍后再试。');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#9bb2ff' }}>初始化中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#c7d6ff' }}>
        无法获取配置，请稍后再试。
      </div>
    );
  }

  const { profile, schedule } = data;
  const [scheduleRefreshing, setScheduleRefreshing] = useState(false);

  const refreshSchedule = () => {
    setScheduleRefreshing(true);
    return fetchProfile()
      .then(setData)
      .finally(() => setScheduleRefreshing(false));
  };

  return (
    <>
      <HeroCard profile={profile} onRefresh={handleRefresh} />
      <ScheduleCard
        schedule={schedule}
        onScheduleChange={refreshSchedule}
        refreshing={scheduleRefreshing}
      />
      <div style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
        数据加载完成
      </div>
    </>
  );
}
