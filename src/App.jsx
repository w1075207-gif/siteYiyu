import { useState, useEffect } from 'react';
import { Spin, message, Space } from 'antd';
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

  return (
    <div className="page-shell">
      <div className="toolbar">
        <button className="menu-button" aria-label="Menu">☰</button>
        <div className="toolbar-title">工具栏</div>
        <span className="toolbar-note">未来拓展 · 快速入口</span>
      </div>
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
        <div className="note-panel">
          <p className="note-label">当前提醒笔记</p>
          {nextReminder ? (
            <>
              <h3 className="note-title">{nextReminder.title}</h3>
              {nextReminder.time && <p className="note-time">{nextReminder.time}</p>}
              {nextReminder.note && <p className="note-text">{nextReminder.note}</p>}
              <p className="note-date">{nextReminder.date}</p>
            </>
          ) : (
            <p className="note-text">暂无待办提醒，等待同步。</p>
          )}
        </div>
      </div>
      <div className="status-footer">
        数据加载完成 · {scheduleRefreshing ? '正在同步...' : '同步正常'}
      </div>
    </div>
  );
}
