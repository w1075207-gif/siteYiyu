import { useState, useEffect } from 'react';
import { Spin, message, Divider, Space } from 'antd';
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

function InsightItem({ label, value, accent }) {
  return (
    <div className="insight-item">
      <span className="insight-label" style={{ color: accent || '#4dd6ff' }}>
        {label}
      </span>
      <p className="insight-value">{value}</p>
    </div>
  );
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
      <div className="page-loading">
        <Spin size="large" />
        <p className="loading-text">初始化中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-loading">
        <p className="loading-text">无法获取配置，请稍后再试。</p>
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

  const nextReminder = upcoming[0];
  const insightItems = [
    {
      label: '下一条提醒',
      value: nextReminder
        ? `${nextReminder.date} · ${nextReminder.title}${nextReminder.note ? ` (${nextReminder.note})` : ''}`
        : '暂无提醒',
      accent: '#ffd166',
    },
    {
      label: '心跳状态',
      value: scheduleRefreshing ? '正在同步...' : '已同步（刷新可重跑）',
      accent: '#4dd6ff',
    },
    {
      label: '设计方向',
      value: '冷峻科技 · Flow-driven',
      accent: '#9dd0ff',
    },
  ];

  return (
    <div className="page-shell">
      <div className="hero-wrap">
        <HeroCard profile={profile} onRefresh={handleRefresh} />
      </div>
      <div className="main-grid">
        <div className="schedule-col">
          <ScheduleCard
            schedule={upcoming}
            onScheduleChange={refreshSchedule}
            refreshing={scheduleRefreshing}
          />
        </div>
        <div className="insight-col">
          <div className="insight-card">
            <p className="insight-heading">Flow Status</p>
            <h3 className="insight-title">提醒流动线索</h3>
            <Divider className="insight-divider" />
            <div className="insight-list">
              {insightItems.map((item) => (
                <InsightItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  accent={item.accent}
                />
              ))}
            </div>
            <div className="insight-footer">
              <span>智能提醒 · 线性流程 · 霓虹动效</span>
            </div>
          </div>
        </div>
      </div>
      <div className="status-footer">
        数据加载完成 · {scheduleRefreshing ? '正在同步...' : '同步正常'}
      </div>
    </div>
  );
}
