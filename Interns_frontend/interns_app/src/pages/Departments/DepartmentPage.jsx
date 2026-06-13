import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepartmentPage() {
  const [depts,    setDepts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModal,setShowModal]= useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name: '', code: '', description: '' });

  const fetchDepts = async () => {
    setLoading(true);
    const res = await api.get('/departments');
    setDepts(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchDepts(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setShowModal(true); };
  const openEdit   = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description ?? '' }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.put(`/departments/${editing.id}`, form);
        toast.success('Department updated!');
      } else {
        await api.post('/departments', form);
        toast.success('Department created!');
      }
      setShowModal(false);
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete department?')) return;
    await api.delete(`/departments/${id}`);
    toast.success('Deleted');
    fetchDepts();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Departments</h2>
          <p className="text-sm text-gray-500">Manage company departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center h-40"><Spinner /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map(dept => (
            <div key={dept.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{dept.code}</span>
                  </div>
                </div>
                <Badge variant={dept.is_active ? 'success' : 'danger'}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {dept.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{dept.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex gap-3 text-xs text-gray-500">
                  <span><strong className="text-gray-700">{dept.employees_count ?? 0}</strong> Employees</span>
                  <span><strong className="text-gray-700">{dept.interns_count ?? 0}</strong> Interns</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(dept.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Department' : 'New Department'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code (e.g. ENG)</label>
            <input className="input-field uppercase" value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="btn-primary">{editing ? 'Save Changes' : 'Create'}</button>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}