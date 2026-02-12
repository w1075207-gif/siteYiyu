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
  const [scheduleRefreshing, setScheduleRefreshing] = useState(false);

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

  const { profile, schedule = [] } = data;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming = schedule
    .map((item) => {
      const dateValue = new Date(`${item.date}T00:00:00`);
      const diffDays = Math.floor((dateValue.getTime() - startOfDay.getTime()) / 86400000);
      return {
        ...item,
        label: diffDays === 0 ? '今天' : diffDays === 1 ? '明天' : '',
        highlight: diffDays >= 0 && diffDays <= 1,
        dateValue,
      };
    })
    .filter((item) => item.dateValue >= startOfDay)
    .sort((a, b) => a.dateValue - b.dateValue);

  const refreshSchedule = () => {
    setScheduleRefreshing(true);
    return fetchProfile()
      .then(setData)
      .finally(() => setScheduleRefreshing(false));
  };

  return (
    <>
      <div className="hero-wrap">
        <HeroCard profile={profile} onRefresh={handleRefresh} />
      </div>
      <div className="schedule-wrap">
        <ScheduleCard
          schedule={upcoming}
          onScheduleChange={refreshSchedule}
          refreshing={scheduleRefreshing}
        />
      </div>
      <div className="status-footer" style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
        数据加载完成
      </div>
    </>
  );
}
