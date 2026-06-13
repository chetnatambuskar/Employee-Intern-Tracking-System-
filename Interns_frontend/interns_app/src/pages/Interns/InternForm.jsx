import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InternForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isEdit      = !!id;
  const [depts,  setDepts]  = useState([]);
  const [loading,setLoading]= useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/departments').then(r => setDepts(r.data));
    if (isEdit) {
      api.get(`/interns/${id}`).then(r => {
        const intern = r.data;
        reset({
          name:             intern.user?.name,
          email:            intern.user?.email,
          phone:            intern.user?.phone,
          department_id:    intern.department_id,
          college_name:     intern.college_name,
          course:           intern.course,
          specialization:   intern.specialization,
          internship_start: intern.internship_start,
          internship_end:   intern.internship_end,
          stipend:          intern.stipend,
          status:           intern.status,
          performance_score:intern.performance_score,
          mentor_notes:     intern.mentor_notes,
        });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/interns/${id}`, data);
        toast.success('Intern updated!');
      } else {
        await api.post('/interns', data);
        toast.success('Intern created!');
      }
      navigate('/interns');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/interns')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Intern' : 'Add New Intern'}</h2>
          <p className="text-sm text-gray-500">Fill in internship details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Personal Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register('name', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email', { required: true })} type="email" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} className="input-field" />
            </div>
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input {...register('password', { required: !isEdit })} type="password" className="input-field" />
              </div>
            )}
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Internship Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select {...register('department_id', { required: true })} className="input-field">
                <option value="">Select</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
              <input {...register('college_name', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input {...register('course', { required: true })} className="input-field" placeholder="e.g. B.Tech CSE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input {...register('specialization')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input {...register('internship_start', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input {...register('internship_end', { required: true })} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stipend (₹/month)</label>
              <input {...register('stipend')} type="number" className="input-field" />
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                  <option value="placed">Placed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {isEdit && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Score (0–100)</label>
                <input {...register('performance_score')} type="number" min="0" max="100" className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Notes</label>
              <textarea {...register('mentor_notes')} rows={3} className="input-field resize-none" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Create Intern'}
          </button>
          <button type="button" onClick={() => navigate('/interns')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}