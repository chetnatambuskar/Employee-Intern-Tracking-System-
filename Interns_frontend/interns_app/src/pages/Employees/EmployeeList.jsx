import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

var STATUS_VARIANT = {
  active:     'success',
  inactive:   'warning',
  terminated: 'danger',
  on_leave:   'info',
};

export default function EmployeeList() {
  var s1 = useState([]);
  var employees = s1[0]; var setEmployees = s1[1];

  var s2 = useState(true);
  var loading = s2[0]; var setLoading = s2[1];

  var s3 = useState('');
  var search = s3[0]; var setSearch = s3[1];

  var s4 = useState('');
  var filterStatus = s4[0]; var setFilterStatus = s4[1];

  var s5 = useState('');
  var filterDept = s5[0]; var setFilterDept = s5[1];

  var s6 = useState([]);
  var depts = s6[0]; var setDepts = s6[1];

  var s7 = useState(null);
  var deleteId = s7[0]; var setDeleteId = s7[1];

  function fetchEmployees() {
    setLoading(true);
    var params = {};
    if (search)       params.search      = search;
    if (filterStatus) params.status      = filterStatus;
    if (filterDept)   params.department_id = filterDept;

    api.get('/employees', { params: params })
      .then(function(res) {
        setEmployees(res.data.data || []);
      })
      .catch(function() {
        toast.error('Failed to load employees');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  useEffect(function() {
    fetchEmployees();
    api.get('/departments').then(function(r) { setDepts(r.data || []); });
  }, [filterStatus, filterDept]);

  function handleSearch(e) {
    e.preventDefault();
    fetchEmployees();
  }

  function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    api.delete('/employees/' + id)
      .then(function() {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      })
      .catch(function() {
        toast.error('Failed to delete employee');
      });
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Employees</h2>
          <p className="text-sm text-gray-500">Manage your workforce</p>
        </div>
        <Link to="/employees/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Employee
        </Link>
      </div>

      <div className="card p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={function(e) { setSearch(e.target.value); }}
            />
          </div>
          <button type="submit" className="btn-secondary text-sm">Search</button>
          <button type="button" onClick={function() { setSearch(''); setFilterStatus(''); setFilterDept(''); }}
            className="btn-secondary text-sm">Clear</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          <select className="input-field w-40" value={filterStatus}
            onChange={function(e) { setFilterStatus(e.target.value); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
          </select>
          <select className="input-field w-44" value={filterDept}
            onChange={function(e) { setFilterDept(e.target.value); }}>
            <option value="">All Departments</option>
            {depts.map(function(d) {
              return <option key={d.id} value={d.id}>{d.name}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Designation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <p className="text-2xl mb-2">👥</p>
                      <p className="text-sm">No employees found.</p>
                    </td>
                  </tr>
                )}
                {employees.map(function(emp) {
                  var name   = emp.user ? emp.user.name  : '—';
                  var email  = emp.user ? emp.user.email : '';
                  var userId = emp.user ? emp.user.id    : null;
                  var dept   = emp.department ? emp.department.name : '—';
                  var status = emp.status || 'active';
                  var empType = emp.employment_type ? emp.employment_type.replace(/_/g, ' ') : '—';

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
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
                          {emp.employee_id}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dept}</td>

                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{emp.designation || '—'}</td>

                      <td className="px-4 py-3">
                        <Badge variant="info">{empType}</Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[status] || 'default'}>
                          {status.replace(/_/g, ' ')}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">

                          {userId && (
                            <Link
                              to={'/user-profile/' + userId}
                              className="p-1.5 hover:bg-green-50 text-green-600 hover:text-green-700 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye size={15} />
                            </Link>
                          )}

                          <Link
                            to={'/employees/' + emp.id}
                            className="p-1.5 hover:bg-blue-50 text-blue-500 hover:text-blue-700 rounded-lg transition-colors"
                            title="Edit Employee"
                          >
                            <Edit size={15} />
                          </Link>

                          <button
                            onClick={function() { handleDelete(emp.id); }}
                            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 size={15} />
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
