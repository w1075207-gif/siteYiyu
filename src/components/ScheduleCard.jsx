import { useState } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Popconfirm, message, Spin, Space } from 'antd';
import { createSchedule, updateSchedule, deleteSchedule } from '../api/schedule';

const { Text } = Typography;

const cardStyle = {
  borderRadius: 24,
  background: 'rgba(10, 12, 22, 0.76)',
  boxShadow: '0 35px 65px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto auto',
  alignItems: 'center',
  gap: 12,
  padding: '14px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  minHeight: 52,
};

const rowContentStyle = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr 90px',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

export default function ScheduleCard({ schedule = [], onScheduleChange, refreshing = false }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form] = Form.useForm();

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 480;
  const busy = submitting || deletingId;

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    form.setFieldsValue({ date: item.date, title: item.title, note: item.note || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingId) {
        await updateSchedule(editingId, values);
        message.success({ content: '已保存', duration: 2 });
        setModalOpen(false);
        const refresh = onScheduleChange?.();
        if (refresh && typeof refresh.then === 'function') {
          refresh.catch(() => message.warning({ content: '已保存，列表未更新，请刷新页面', duration: 4 }));
        }
      } else {
        await createSchedule(values);
        message.success({ content: '已添加', duration: 2 });
        setModalOpen(false);
        const refresh = onScheduleChange?.();
        if (refresh && typeof refresh.then === 'function') {
          refresh.catch(() => message.warning({ content: '已添加，列表未更新，请刷新页面', duration: 4 }));
        }
      }
    } catch (e) {
      if (e.errorFields) return; // form validation, no toast
      message.error({ content: e.message || '保存失败，请重试', duration: 3 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteSchedule(id);
      message.success({ content: '已删除', duration: 2 });
      const refresh = onScheduleChange?.();
      if (refresh && typeof refresh.then === 'function') {
        refresh.catch(() => {
          message.warning({ content: '已删除，列表未更新，请刷新页面', duration: 4 });
        });
      }
    } catch (e) {
      message.error({ content: e.message || '删除失败，请重试', duration: 3 });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card
        className="component-card schedule-card"
        title={
          <Space>
            <span>未来几日计划</span>
            {refreshing && (
              <Spin size="small" />
            )}
          </Space>
        }
        style={cardStyle}
        styles={{ body: { padding: 24, position: 'relative' } }}
        extra={
          <Button
            type="primary"
            onClick={openAdd}
            loading={refreshing}
            disabled={busy}
            size="large"
            style={{
              minHeight: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3898ff, #4fd2ff)',
              border: 'none',
              color: '#03030b',
              fontWeight: 600,
            }}
          >
            添加
          </Button>
        }
      >
        {refreshing && schedule?.length > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10,12,22,0.6)',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <Spin size="large" tip="刷新中..." />
          </div>
        )}
        {!schedule?.length && !refreshing ? (
          <Text type="secondary" style={{ display: 'block', padding: '12px 0' }}>
            暂无计划，点击右上角「添加」创建
          </Text>
        ) : !schedule?.length && refreshing ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Spin tip="加载中..." />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {schedule.map((item) => {
              const isDeleting = deletingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    ...rowStyle,
                    opacity: isDeleting ? 0.6 : 1,
                    pointerEvents: isDeleting ? 'none' : undefined,
                  }}
                  className={`schedule-row${item.highlight ? " schedule-row-highlight" : ""}`}
                >
                  <div style={rowContentStyle} className="schedule-row-content">
                    <Text strong style={{ color: '#7dd3ff', fontSize: 16 }}>
                      {item.date}{item.label && (
                        <span className="schedule-label">{item.label}</span>
                      )}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: 500 }} ellipsis>
                      {item.title}
                    </Text>
                    <Text className="schedule-note" style={{ textAlign: 'right', color: '#c7d6ff' }}>
                      {item.note}
                    </Text>
                  </div>
                  <div className="schedule-row-actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Button
                      type="text"
                      onClick={() => openEdit(item)}
                      disabled={busy}
                      style={{ color: '#9bb2ff', minWidth: 44, minHeight: 44 }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确定删除这条计划？"
                      onConfirm={() => handleDelete(item.id)}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true, loading: isDeleting }}
                    >
                      <Button
                        type="text"
                        danger
                        loading={isDeleting}
                        disabled={busy && !isDeleting}
                        style={{ minWidth: 44, minHeight: 44 }}
                      >
                        {isDeleting ? '删除中' : '删除'}
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        className="component-modal"
        title={editingId ? '编辑计划' : '添加计划'}
        open={modalOpen}
        onCancel={() => !submitting && setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnClose
        width={isMobile() ? 'calc(100vw - 32px)' : 420}
        style={{ top: isMobile() ? 24 : undefined }}
        okText={submitting ? '保存中...' : '保存'}
        cancelText="取消"
        closable={!submitting}
        maskClosable={!submitting}
        keyboard={!submitting}
        styles={{
          body: { paddingTop: 24 },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input type="date" size="large" style={{ minHeight: 44 }} />
          </Form.Item>
          <Form.Item
            name="title"
            label="事项"
            rules={[{ required: true, message: '请输入事项' }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input placeholder="例如：取 jacket" size="large" style={{ minHeight: 44 }} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input placeholder="例如：08:00 CET" size="large" style={{ minHeight: 44 }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
