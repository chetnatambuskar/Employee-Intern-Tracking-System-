import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const priorityVariant = { low: 'default', medium: 'info', high: 'warning', urgent: 'danger' };
const statusVariant   = { pending: 'default', in_progress: 'info', review: 'warning', completed: 'success', cancelled: 'danger' };

export default function TaskList() {
  const { user }   = useAuth();
  const isManager  = ['admin', 'manager'].includes(user?.role);
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal,setShowModal]= useState(false);
  const [form,     setForm]     = useState({ title: '', description: '', assigned_to: '', priority: 'medium', category: 'other', due_date: '', status: 'pending' });

  const fetchTasks = async () => {
    setLoading(true);
    const res = await api.get('/tasks');
    setTasks(res.data.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    if (isManager) api.get('/employees').then(r => setUsers(r.data.data ?? []));
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/tasks', form);
      toast.success('Task created!');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed');
    }
  };

  const handleStatusUpdate = async (task, status) => {
    await api.put(`/tasks/${task.id}/status`, { status });
    toast.success('Status updated');
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete task?')) return;
    await api.delete(`/tasks/${id}`);
    toast.success('Deleted');
    fetchTasks();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-gray-500">
            {isManager ? 'Assign and manage tasks' : 'Your assigned tasks'}
          </p>
        </div>
        {isManager && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? <div className="flex items-center justify-center h-40"><Spinner /></div> : (
          <>
            {tasks.length === 0 && (
              <div className="card text-center py-12 text-gray-400">No tasks yet.</div>
            )}
            {tasks.map(task => (
              <div key={task.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                      <Badge variant={statusVariant[task.status]}>{task.status.replace('_', ' ')}</Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Assigned to: <strong className="text-gray-600">{task.assignee?.name}</strong></span>
                      {task.due_date && <span>Due: {task.due_date}</span>}
                      <span className="capitalize">{task.category}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-primary-500 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isManager && task.status !== 'completed' && (
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                        value={task.status}
                        onChange={e => handleStatusUpdate(task, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                    {isManager && (
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Task" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select className="input-field" value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Select Employee</option>
                {users.map(u => <option key={u.id} value={u.user?.id}>{u.user?.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}>
                {['development','design','qa','management','other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input-field" value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} className="btn-primary">Create Task</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}