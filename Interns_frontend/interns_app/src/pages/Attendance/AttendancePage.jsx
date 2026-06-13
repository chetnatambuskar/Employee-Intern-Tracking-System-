import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, Calendar, Save } from 'lucide-react';

const STATUS_COLORS = {
  present:  'success',
  absent:   'danger',
  half_day: 'warning',
  leave:    'info',
  holiday:  'default',
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function niceDate(val) {
  if (!val) return '—';
  try {
    var s = String(val).split('T')[0];
    var parts = s.split('-');
    if (parts.length !== 3) return val;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parts[2] + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
  } catch (e) {
    return val;
  }
}

function niceTime(val) {
  if (!val) return null;
  try {
    var clean = String(val).trim();
    var parts = clean.split(':');
    var h = parseInt(parts[0]);
    var m = parts[1] || '00';
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + m + ' ' + ampm;
  } catch (e) {
    return val;
  }
}

function SummaryCard(props) {
  return (
    <div className="card flex items-center gap-3">
      <props.icon size={22} className={props.color + ' flex-shrink-0'} />
      <div>
        <p className={'text-2xl font-bold ' + props.color}>{props.value}</p>
        <p className="text-xs text-gray-500">{props.label}</p>
      </div>
    </div>
  );
}

function TimeCell(props) {
  var t = niceTime(props.value);
  if (!t) return <span className="text-gray-400">—</span>;
  return (
    <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ' + props.bg + ' ' + props.fg}>
      <Clock size={11} />
      {t}
    </span>
  );
}

export default function AttendancePage() {
  var auth   = useAuth();
  var user   = auth.user;
  var isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  var todayStr = new Date().toISOString().split('T')[0];

  var monthNow = new Date().getMonth() + 1;
  var yearNow  = new Date().getFullYear();

  var rs = useState([]);
  var records   = rs[0];
  var setRecords = rs[1];

  var es = useState([]);
  var empList   = es[0];
  var setEmpList = es[1];

  var ss = useState(null);
  var summary   = ss[0];
  var setSummary = ss[1];

  var ls = useState(true);
  var loading   = ls[0];
  var setLoading = ls[1];

  var ms = useState(false);
  var marking   = ms[0];
  var setMarking = ms[1];

  var mos = useState(monthNow);
  var month   = mos[0];
  var setMonth = mos[1];

  var ys = useState(yearNow);
  var yr   = ys[0];
  var setYr = ys[1];

  var uid = useState('');
  var selUser   = uid[0];
  var setSelUser = uid[1];

  var ds = useState(todayStr);
  var selDate   = ds[0];
  var setSelDate = ds[1];

  var sts = useState('present');
  var selStatus   = sts[0];
  var setSelStatus = sts[1];

  var cis = useState('');
  var checkIn   = cis[0];
  var setCheckIn = cis[1];

  var cos = useState('');
  var checkOut   = cos[0];
  var setCheckOut = cos[1];

  var ns = useState('');
  var notes   = ns[0];
  var setNotes = ns[1];

  var fetchData = async function() {
    setLoading(true);
    try {
      if (isAdmin) {
        var eRes = await api.get('/employees');
        var eData = eRes.data.data;
        if (Array.isArray(eData)) setEmpList(eData);
        var aRes = await api.get('/attendance', { params: { month: month, year: yr } });
        var aData = aRes.data.data;
        if (Array.isArray(aData)) setRecords(aData);
      } else {
        var mRes = await api.get('/attendance/my', { params: { month: month, year: yr } });
        if (Array.isArray(mRes.data.records)) setRecords(mRes.data.records);
        if (mRes.data.summary) setSummary(mRes.data.summary);
      }
    } catch (e) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() {
    fetchData();
  }, [month, yr]);

  var handleMark = async function() {
    if (isAdmin && !selUser) {
      toast.error('Please select an employee');
      return;
    }
    if (!selDate) {
      toast.error('Please select a date');
      return;
    }
    setMarking(true);
    try {
      var userId = isAdmin ? selUser : String(user.id);
      var payload = {
        user_id:   userId,
        date:      selDate,
        status:    selStatus,
        check_in:  checkIn  || null,
        check_out: checkOut || null,
        notes:     notes    || null,
      };
      await api.post('/attendance/mark', payload);
      toast.success('Attendance marked successfully!');
      setSelUser('');
      setSelDate(todayStr);
      setSelStatus('present');
      setCheckIn('');
      setCheckOut('');
      setNotes('');
      fetchData();
    } catch (err) {
      var msg = 'Failed to mark attendance';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Mark and manage team attendance' : 'Your attendance record'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="input-field w-32"
            value={month}
            onChange={function(e) { setMonth(parseInt(e.target.value)); }}
          >
            {MONTHS.map(function(m, i) {
              return <option key={i} value={i + 1}>{m}</option>;
            })}
          </select>
          <select
            className="input-field w-24"
            value={yr}
            onChange={function(e) { setYr(parseInt(e.target.value)); }}
          >
            {[2023, 2024, 2025, 2026].map(function(y) {
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard icon={CheckCircle} color="text-green-600" value={summary.present}  label="Present"  />
          <SummaryCard icon={XCircle}     color="text-red-500"   value={summary.absent}   label="Absent"   />
          <SummaryCard icon={Clock}       color="text-yellow-600" value={summary.half_day} label="Half Day" />
          <SummaryCard icon={Calendar}    color="text-blue-600"  value={summary.leave}    label="On Leave" />
        </div>
      )}

      {isAdmin && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-2 border-b border-gray-100">
            Mark Attendance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Employee *</label>
              <select
                className="input-field"
                value={selUser}
                onChange={function(e) { setSelUser(e.target.value); }}
              >
                <option value="">Select Employee</option>
                {empList.map(function(emp) {
                  var empUserId = emp.user ? emp.user.id : '';
                  var empName   = emp.user ? emp.user.name : 'Unknown';
                  var deptName  = emp.department ? emp.department.name : '';
                  return (
                    <option key={emp.id} value={empUserId}>
                      {empName + (deptName ? ' — ' + deptName : '')}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                className="input-field"
                value={selDate}
                onChange={function(e) { setSelDate(e.target.value); }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status *</label>
              <select
                className="input-field"
                value={selStatus}
                onChange={function(e) { setSelStatus(e.target.value); }}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check In Time</label>
              <input
                type="time"
                className="input-field"
                value={checkIn}
                onChange={function(e) { setCheckIn(e.target.value); }}
              />
              <p className="text-xs text-gray-400 mt-1">e.g. 09:00 for 9 AM</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check Out Time</label>
              <input
                type="time"
                className="input-field"
                value={checkOut}
                onChange={function(e) { setCheckOut(e.target.value); }}
              />
              <p className="text-xs text-gray-400 mt-1">e.g. 18:00 for 6 PM</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes / Reason</label>
              <input
                type="text"
                className="input-field"
                value={notes}
                placeholder="e.g. WFH, Sick leave, Medical..."
                onChange={function(e) { setNotes(e.target.value); }}
              />
              <p className="text-xs text-gray-400 mt-1">Optional</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={handleMark}
              disabled={marking}
              className="btn-primary flex items-center gap-2"
            >
              {marking ? <Spinner size="sm" /> : <Save size={15} />}
              {marking ? 'Saving...' : 'Mark Attendance'}
            </button>
            <p className="text-xs text-gray-400">
              Working hours are auto-calculated from check-in and check-out times.
            </p>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Attendance Records</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {(isAdmin ? ['Employee'] : []).concat([
                    'Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Notes'
                  ]).map(function(h) {
                    return (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-gray-400">
                      No attendance records for this period.
                    </td>
                  </tr>
                )}
                {records.map(function(r) {
                  var statusVariant = STATUS_COLORS[r.status] || 'default';
                  var statusLabel   = r.status ? r.status.replace('_', ' ') : '—';
                  var hours         = r.working_hours ? r.working_hours + 'h' : '—';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                              {r.user && r.user.name ? r.user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="font-medium text-gray-900 whitespace-nowrap">
                              {r.user ? r.user.name : '—'}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {niceDate(r.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TimeCell value={r.check_in}  bg="bg-green-50" fg="text-green-700" />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <TimeCell value={r.check_out} bg="bg-blue-50"  fg="text-blue-700"  />
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {hours}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.notes ? (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {r.notes}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
