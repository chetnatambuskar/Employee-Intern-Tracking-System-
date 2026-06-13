import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeForm() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isEdit      = !!id;
  const [depts,  setDepts]  = useState([]);
  const [loading,setLoading]= useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/departments').then(r => setDepts(r.data));
    if (isEdit) {
      api.get(`/employees/${id}`).then(r => {
        const e = r.data;
        reset({
          name:             e.user?.name,
          email:            e.user?.email,
          phone:            e.user?.phone,
          department_id:    e.department_id,
          designation:      e.designation,
          joining_date:     e.joining_date,
          salary:           e.salary,
          employment_type:  e.employment_type,
          status:           e.status,
          gender:           e.gender,
          date_of_birth:    e.date_of_birth,
          address:          e.address,
          emergency_contact:e.emergency_contact,
        });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, data);
        toast.success('Employee updated!');
      } else {
        await api.post('/employees', data);
        toast.success('Employee created!');
      }
      navigate('/employees');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required, children, ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children ?? (
        <input {...register(name, { required })} type={type} className="input-field" {...rest} />
      )}
      {errors[name] && <p className="text-xs text-red-500 mt-0.5">{errors[name]?.message || 'Required'}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/employees')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
          <p className="text-sm text-gray-500">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name"  name="name"  required="Name is required" />
            <Field label="Email"      name="email" type="email" required="Email required" />
            <Field label="Phone"      name="phone" />
            {!isEdit && <Field label="Password" name="password" type="password" required="Password required" />}
          </div>
        </div>

        {/* Employment */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Employment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department" name="department_id" required>
              <select {...register('department_id', { required: true })} className="input-field">
                <option value="">Select Department</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <Field label="Designation" name="designation" required="Required" />
            <Field label="Joining Date" name="joining_date" type="date" required="Required" />
            <Field label="Salary (₹)" name="salary" type="number" />
            <Field label="Employment Type" name="employment_type">
              <select {...register('employment_type')} className="input-field">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </Field>
            {isEdit && (
              <Field label="Status" name="status">
                <select {...register('status')} className="input-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </Field>
            )}
          </div>
        </div>

        {/* Personal */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Personal Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gender" name="gender">
              <select {...register('gender')} className="input-field">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth" name="date_of_birth" type="date" />
            <Field label="Emergency Contact" name="emergency_contact" />
          </div>
          <Field label="Address" name="address">
            <textarea {...register('address')} rows={2} className="input-field resize-none" />
          </Field>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size="sm" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
          <button type="button" onClick={() => navigate('/employees')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}