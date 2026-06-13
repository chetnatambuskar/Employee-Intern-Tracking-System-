import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Plus, Search, Edit, Trash2, Star, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

var STATUS_VARIANT = {
  active:    'success',
  completed: 'info',
  terminated:'danger',
  placed:    'purple',
};

function formatDate(val) {
  if (!val) return null;
  try {
    var s     = String(val).split('T')[0];
    var parts = s.split('-');
    if (parts.length !== 3) return val;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parts[2] + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
  } catch (e) { return val; }
}

function calcDuration(start, end) {
  if (!start || !end) return null;
  try {
    var s = new Date(String(start).split('T')[0]);
    var e = new Date(String(end).split('T')[0]);
    var diffMs    = e - s;
    var diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var months    = Math.floor(diffDays / 30);
    var days      = diffDays % 30;
    if (months === 0) return diffDays + 'd';
    if (days === 0)   return months + ' mo';
    return months + ' mo ' + days + 'd';
  } catch (e) { return null; }
}

function isActive(start, end) {
  if (!start || !end) return false;
  try {
    var now   = new Date();
    var s     = new Date(String(start).split('T')[0]);
    var e     = new Date(String(end).split('T')[0]);
    return now >= s && now <= e;
  } catch (e) { return false; }
}

function DurationCell(props) {
  var start    = props.start;
  var end      = props.end;
  var startFmt = formatDate(start);
  var endFmt   = formatDate(end);
  var duration = calcDuration(start, end);
  var active   = isActive(start, end);

  if (!startFmt || !endFmt) return <span className="text-gray-400 text-xs">—</span>;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Calendar size={11} className="text-gray-400 flex-shrink-0" />
        <span className="font-medium">{startFmt}</span>
        <span className="text-gray-300">→</span>
        <span className="font-medium">{endFmt}</span>
      </div>
      {duration && (
        <div className="flex items-center gap-1.5">
          <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ' +
            (active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
            {duration}
            {active && <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>}
          </span>
        </div>
      )}
    </div>
  );
}

export default function InternList() {
  var ts = useState([]);
  var interns    = ts[0];
  var setInterns = ts[1];

  var ls = useState(true);
  var loading    = ls[0];
  var setLoading = ls[1];

  var ss = useState('');
  var search    = ss[0];
  var setSearch = ss[1];

  var fs = useState('');
  var filterStatus    = fs[0];
  var setFilterStatus = fs[1];

  var fetchInterns = async function() {
    setLoading(true);
    try {
      var params = {};
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      var res = await api.get('/interns', { params: params });
      setInterns(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load interns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() { fetchInterns(); }, [filterStatus]);

  var handleDelete = async function(id) {
    if (!confirm('Delete this intern?')) return;
    try {
      await api.delete('/interns/' + id);
      toast.success('Intern deleted');
      fetchInterns();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  var handleSearch = function(e) {
    e.preventDefault();
    fetchInterns();
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Interns</h2>
          <p className="text-sm text-gray-500">Manage your intern program</p>
        </div>
        <Link to="/interns/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Intern
        </Link>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search interns by name..."
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
            />
          </div>
          <button type="submit" className="btn-secondary text-sm">Search</button>
        </form>
        <select
          className="input-field w-36"
          value={filterStatus}
          onChange={function(e) { setFilterStatus(e.target.value); }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="placed">Placed</option>
          <option value="terminated">Terminated</option>
        </select>
        <button
          onClick={function() { setSearch(''); setFilterStatus(''); }}
          className="btn-secondary text-sm"
        >
          Clear
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Intern','ID','College','Course','Department','Duration','Score','Status','Actions'].map(function(h) {
                    return (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {interns.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      No interns found.
                    </td>
                  </tr>
                )}
                {interns.map(function(intern) {
                  var name   = intern.user ? intern.user.name  : '—';
                  var email  = intern.user ? intern.user.email : '';
                  var dept   = intern.department ? intern.department.name : '—';
                  var status = intern.status || 'active';

                  return (
                    <tr key={intern.id} className="hover:bg-gray-50 transition-colors">

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 whitespace-nowrap">{name}</p>
                            <p className="text-xs text-gray-400">{email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {intern.intern_id}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600 text-xs max-w-32">
                        <p className="truncate" title={intern.college_name}>{intern.college_name || '—'}</p>
                      </td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{intern.course || '—'}</td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dept}</td>

                      <td className="px-4 py-3">
                        <DurationCell
                          start={intern.internship_start}
                          end={intern.internship_end}
                        />
                      </td>

                      <td className="px-4 py-3">
                        {intern.performance_score != null ? (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-semibold text-gray-700">{intern.performance_score}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[status] || 'default'}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={'/interns/' + intern.id}
                            className="p-1.5 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={function() { handleDelete(intern.id); }}
                            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
