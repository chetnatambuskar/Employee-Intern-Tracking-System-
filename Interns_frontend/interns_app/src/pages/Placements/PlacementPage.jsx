import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { Plus, TrendingUp, Award, Briefcase, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

var STATUS_COLORS = {
  offered:  'info',
  accepted: 'success',
  rejected: 'danger',
  joined:   'purple',
};

function StatCard(props) {
  return (
    <div className="card flex items-center gap-3">
      <div className={'p-2.5 rounded-xl ' + props.bg}>
        <props.icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{props.value}</p>
        <p className="text-xs text-gray-500">{props.label}</p>
      </div>
    </div>
  );
}

function niceDate(val) {
  if (!val) return '—';
  try {
    var s = String(val).split('T')[0];
    var parts = s.split('-');
    if (parts.length !== 3) return val;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parts[2] + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
  } catch (e) { return val; }
}

export default function PlacementPage() {
  var ps = useState([]);
  var placements    = ps[0];
  var setPlacements = ps[1];

  var is = useState([]);
  var interns    = is[0];
  var setInterns = is[1];

  var sts = useState(null);
  var stats    = sts[0];
  var setStats = sts[1];

  var ls = useState(true);
  var loading    = ls[0];
  var setLoading = ls[1];

  var ms = useState(false);
  var showModal    = ms[0];
  var setShowModal = ms[1];

  var saving_s = useState(false);
  var saving    = saving_s[0];
  var setSaving = saving_s[1];

  var fs = useState({
    intern_id:      '',
    company_name:   '',
    job_role:       '',
    package_lpa:    '',
    offer_date:     '',
    joining_date:   '',
    placement_type: 'full_time',
    status:         'offered',
    notes:          '',
  });
  var form    = fs[0];
  var setForm = fs[1];

  var setField = function(field, val) {
    setForm(function(prev) {
      var next = Object.assign({}, prev);
      next[field] = val;
      return next;
    });
  };

  var fetchAll = async function() {
    setLoading(true);
    try {
      var pr = await api.get('/placements');
      setPlacements(pr.data.data || []);

      var sr = await api.get('/placements/stats').catch(function() { return { data: null }; });
      if (sr.data) setStats(sr.data);

      var ir = await api.get('/interns');
      setInterns(ir.data.data || []);
    } catch (e) {
      toast.error('Failed to load placements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() { fetchAll(); }, []);

  var resetForm = function() {
    setForm({
      intern_id: '', company_name: '', job_role: '',
      package_lpa: '', offer_date: '', joining_date: '',
      placement_type: 'full_time', status: 'offered', notes: '',
    });
  };

  var handleSave = async function() {
    if (!form.intern_id)    { toast.error('Please select an intern');      return; }
    if (!form.company_name) { toast.error('Please enter company name');    return; }
    if (!form.job_role)     { toast.error('Please enter job role');        return; }
    if (!form.offer_date)   { toast.error('Please select offer date');     return; }

    setSaving(true);
    try {
      var payload = {
        intern_id:      form.intern_id,
        company_name:   form.company_name,
        job_role:       form.job_role,
        offer_date:     form.offer_date,
        placement_type: form.placement_type,
        status:         form.status,
        notes:          form.notes || null,
        joining_date:   form.joining_date || null,
        package_lpa:    form.package_lpa ? parseFloat(form.package_lpa) : null,
      };
      await api.post('/placements', payload);
      toast.success('Placement recorded successfully!');
      setShowModal(false);
      resetForm();
      fetchAll();
    } catch (err) {
      var msg = 'Failed to save placement';
      if (err.response && err.response.data) {
        if (err.response.data.message) msg = err.response.data.message;
        if (err.response.data.errors) {
          var errs = err.response.data.errors;
          var keys = Object.keys(errs);
          if (keys.length > 0) msg = errs[keys[0]][0];
        }
      }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  var handleDelete = async function(id) {
    if (!confirm('Delete this placement?')) return;
    try {
      await api.delete('/placements/' + id);
      toast.success('Deleted');
      fetchAll();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  var handleStatusChange = async function(id, newStatus) {
    try {
      await api.put('/placements/' + id, { status: newStatus });
      toast.success('Status updated!');
      fetchAll();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Placement Tracking</h2>
          <p className="text-sm text-gray-500">Track intern offers and joining</p>
        </div>
        <button
          onClick={function() { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Placement
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Briefcase}   bg="bg-blue-500"   label="Total Offers"  value={stats.total || 0} />
          <StatCard icon={Award}       bg="bg-green-500"  label="Accepted"      value={stats.accepted || 0} />
          <StatCard icon={TrendingUp}  bg="bg-purple-500" label="Joined"        value={stats.joined || 0} />
          <StatCard icon={TrendingUp}  bg="bg-orange-500" label="Avg Package"
            value={stats.avg_package ? stats.avg_package + ' LPA' : '—'} />
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Intern','Company','Role','Package','Type','Offer Date','Status','Actions'].map(function(h) {
                    return (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {placements.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No placements yet. Click Add Placement to record one.
                    </td>
                  </tr>
                )}
                {placements.map(function(p) {
                  var internName = p.intern && p.intern.user ? p.intern.user.name : '—';
                  var pkg = p.package_lpa ? 'Rs.' + parseFloat(p.package_lpa).toFixed(2) + ' LPA' : '—';
                  var ptype = p.placement_type ? p.placement_type.replace(/_/g, ' ') : '—';
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                            {internName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{internName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.company_name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.job_role}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{pkg}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{ptype}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{niceDate(p.offer_date)}</td>
                      <td className="px-4 py-3">
                        <select
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white"
                          value={p.status}
                          onChange={function(e) { handleStatusChange(p.id, e.target.value); }}
                        >
                          <option value="offered">Offered</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="joined">Joined</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={function() { handleDelete(p.id); }}
                          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={function() { setShowModal(false); }} title="Record Placement" size="lg">
        <div className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intern *</label>
              <select
                className="input-field"
                value={form.intern_id}
                onChange={function(e) { setField('intern_id', e.target.value); }}
              >
                <option value="">Select Intern</option>
                {interns.map(function(i) {
                  var name = i.user ? i.user.name : 'Intern ' + i.id;
                  return <option key={i.id} value={i.id}>{name}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                className="input-field"
                value={form.company_name}
                placeholder="e.g. Google India"
                onChange={function(e) { setField('company_name', e.target.value); }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role *</label>
              <input
                type="text"
                className="input-field"
                value={form.job_role}
                placeholder="e.g. Software Engineer"
                onChange={function(e) { setField('job_role', e.target.value); }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input-field"
                value={form.package_lpa}
                placeholder="e.g. 12.5"
                onChange={function(e) { setField('package_lpa', e.target.value); }}
              />
              <p className="text-xs text-gray-400 mt-0.5">Enter in LPA (e.g. 12.5 for 12.5 LPA)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.offer_date}
                onChange={function(e) { setField('offer_date', e.target.value); }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
              <input
                type="date"
                className="input-field"
                value={form.joining_date}
                onChange={function(e) { setField('joining_date', e.target.value); }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placement Type</label>
              <select
                className="input-field"
                value={form.placement_type}
                onChange={function(e) { setField('placement_type', e.target.value); }}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="ppo">PPO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="input-field"
                value={form.status}
                onChange={function(e) { setField('status', e.target.value); }}
              >
                <option value="offered">Offered</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="joined">Joined</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              value={form.notes}
              placeholder="Any additional notes..."
              onChange={function(e) { setField('notes', e.target.value); }}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Spinner size="sm" /> : null}
              {saving ? 'Saving...' : 'Save Placement'}
            </button>
            <button
              onClick={function() { setShowModal(false); }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}
