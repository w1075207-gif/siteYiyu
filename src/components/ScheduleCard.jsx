import { useState } from 'react';
import { Card, Typography, Button, Modal, Form, Input, Popconfirm, message } from 'antd';
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

export default function ScheduleCard({ schedule = [], onScheduleChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 480;

  const openAdd = () => {
    setEditingId(null);
    form.setFieldsValue({ date: '', title: '', note: '' });
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
      setLoading(true);
      if (editingId) {
        await updateSchedule(editingId, values);
        message.success('已更新');
      } else {
        await createSchedule(values);
        message.success('已添加');
      }
      setModalOpen(false);
      onScheduleChange?.();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await deleteSchedule(id);
      message.success('已删除');
      onScheduleChange?.();
    } catch (e) {
      message.error(e.message || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title="未来几日计划"
        style={cardStyle}
        styles={{ body: { padding: 24 } }}
        extra={
          <Button
            type="primary"
            onClick={openAdd}
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
        {!schedule?.length ? (
          <Text type="secondary" style={{ display: 'block', padding: '12px 0' }}>
            暂无计划，点击右上角「添加」创建
          </Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {schedule.map((item) => (
              <div key={item.id} style={rowStyle} className="schedule-row">
                <div style={rowContentStyle} className="schedule-row-content">
                  <Text strong style={{ color: '#7dd3ff', fontSize: 16 }}>
                    {item.date}
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
                    style={{ color: '#9bb2ff', minWidth: 44, minHeight: 44 }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定删除这条计划？"
                    onConfirm={() => handleDelete(item.id)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      danger
                      loading={loading}
                      style={{ minWidth: 44, minHeight: 44 }}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        title={editingId ? '编辑计划' : '添加计划'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={loading}
        destroyOnClose
        width={isMobile() ? 'calc(100vw - 32px)' : 420}
        style={{ top: isMobile() ? 24 : undefined }}
        okText="保存"
        cancelText="取消"
        styles={{
          body: { paddingTop: 24 },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <Input type="date" size="large" style={{ minHeight: 44 }} />
          </Form.Item>
          <Form.Item
            name="title"
            label="事项"
            rules={[{ required: true, message: '请输入事项' }]}
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
