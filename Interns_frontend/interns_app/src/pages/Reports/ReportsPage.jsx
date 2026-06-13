import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import { Download, RefreshCw, TrendingUp, TrendingDown, Users, GraduationCap, ClipboardList, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var PIE_COLORS   = ['#3b82f6','#8b5cf6','#22c55e','#ef4444','#f59e0b','#06b6d4'];
var BAR_COLORS   = ['#3b82f6','#8b5cf6','#22c55e','#f59e0b','#ef4444'];

/* ── tiny helpers ── */
function pct(num, den) {
  if (!den || den === 0) return 0;
  return Math.round((num / den) * 100);
}
function avg(arr, key) {
  var filtered = arr.filter(function(x) { return x[key] != null; });
  if (filtered.length === 0) return null;
  var sum = filtered.reduce(function(s, x) { return s + parseFloat(x[key]); }, 0);
  return Math.round((sum / filtered.length) * 10) / 10;
}

/* ── sub-components ── */
function KpiCard(props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-gray-500">{props.title}</p>
        <div className={'p-1.5 rounded-lg ' + (props.iconBg || 'bg-gray-100')}>
          <props.icon size={14} className={props.iconColor || 'text-gray-500'} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{props.value}</p>
      {props.sub && <p className="text-xs text-gray-400 mt-0.5">{props.sub}</p>}
      {props.change && (
        <div className={'flex items-center gap-1 mt-2 text-xs font-medium ' + (props.up ? 'text-green-600' : 'text-red-500')}>
          {props.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {props.change}
        </div>
      )}
    </div>
  );
}

function ChartCard(props) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{props.title}</h3>
        {props.badge && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Live</span>
        )}
      </div>
      {props.children}
    </div>
  );
}

function Empty(props) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <BarChart2 size={28} className="text-gray-200 mb-2" />
      <p className="text-sm text-gray-400">{props.msg}</p>
      <p className="text-xs text-gray-300 mt-1">{props.hint || 'Add data to see charts'}</p>
    </div>
  );
}

/* ── main component ── */
export default function ReportsPage() {
  var now = new Date();

  var ms = useState(now.getMonth() + 1);
  var month = ms[0]; var setMonth = ms[1];

  var ys = useState(now.getFullYear());
  var year = ys[0]; var setYear = ys[1];

  var ls = useState(true);
  var loading = ls[0]; var setLoading = ls[1];

  var ts = useState(null);
  var lastUpdated = ts[0]; var setLastUpdated = ts[1];

  /* data states */
  var ds = useState(null);
  var dashStats = ds[0]; var setDashStats = ds[1];

  var as = useState([]);
  var attendReport = as[0]; var setAttendReport = as[1];

  var pls = useState([]);
  var placements = pls[0]; var setPlacements = pls[1];

  var ins = useState([]);
  var interns = ins[0]; var setInterns = ins[1];

  var tks = useState([]);
  var tasks = tks[0]; var setTasks = tks[1];

  var errs = useState(null);
  var error = errs[0]; var setError = errs[1];

  var fetchAll = useCallback(async function() {
    setLoading(true);
    setError(null);
    try {
      var results = await Promise.allSettled([
        api.get('/dashboard/stats'),
        api.get('/attendance/report', { params: { month: month, year: year } }),
        api.get('/placements'),
        api.get('/interns'),
        api.get('/tasks'),
      ]);

      if (results[0].status === 'fulfilled') setDashStats(results[0].value.data);
      if (results[1].status === 'fulfilled') {
        var aData = results[1].value.data;
        setAttendReport(Array.isArray(aData) ? aData : []);
      }
      if (results[2].status === 'fulfilled') {
        var pData = results[2].value.data;
        setPlacements(Array.isArray(pData.data) ? pData.data : []);
      }
      if (results[3].status === 'fulfilled') {
        var iData = results[3].value.data;
        setInterns(Array.isArray(iData.data) ? iData.data : []);
      }
      if (results[4].status === 'fulfilled') {
        var tData = results[4].value.data;
        setTasks(Array.isArray(tData.data) ? tData.data : []);
      }

      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      setError('Failed to load report data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(function() {
    fetchAll();
    var timer = setInterval(fetchAll, 30000);
    return function() { clearInterval(timer); };
  }, [fetchAll]);

  /* ── derived metrics ── */
  var totalPresent = attendReport.reduce(function(s, u) { return s + (u.present || 0); }, 0);
  var totalDays    = attendReport.reduce(function(s, u) {
    return s + (u.present || 0) + (u.absent || 0) + (u.half_day || 0);
  }, 0);
  var attendRate   = totalDays > 0 ? pct(totalPresent, totalDays) + '%' : '—%';

  var ts2 = dashStats ? dashStats.task_summary : null;
  var taskTotal      = ts2 ? (ts2.completed + ts2.pending + ts2.in_progress) : 0;
  var taskCompletion = taskTotal > 0 ? pct(ts2.completed, taskTotal) + '%' : '0%';

  var placedCount  = interns.filter(function(i) { return i.status === 'placed'; }).length;
  var placementRate = interns.length > 0 ? pct(placedCount, interns.length) + '%' : '0%';

  var scoredInterns = interns.filter(function(i) { return i.performance_score != null; });
  var avgPerf = scoredInterns.length > 0
    ? (scoredInterns.reduce(function(s, i) { return s + i.performance_score; }, 0) / scoredInterns.length).toFixed(1)
    : '—';

  /* ── chart data ── */
  /* 1. attendance trend from dashboard */
  var attendTrend = dashStats && dashStats.monthly_attendance ? dashStats.monthly_attendance : [];

  /* 2. dept-wise attendance from report */
  var deptAttend = attendReport.reduce(function(acc, u) {
    var role = u.user ? (u.user.role || 'other') : 'other';
    var found = acc.find(function(a) { return a.name === role; });
    if (found) {
      found.present += u.present || 0;
      found.absent  += u.absent  || 0;
    } else {
      acc.push({ name: role, present: u.present || 0, absent: u.absent || 0 });
    }
    return acc;
  }, []);

  /* 3. placement packages */
  var pkgData = placements
    .filter(function(p) { return p.package_lpa && parseFloat(p.package_lpa) > 0; })
    .map(function(p) {
      var name = p.intern && p.intern.user ? p.intern.user.name.split(' ')[0] : 'Intern';
      return { name: name, lpa: parseFloat(p.package_lpa) };
    })
    .sort(function(a, b) { return b.lpa - a.lpa; })
    .slice(0, 8);

  /* 4. intern status pie */
  var internPie = interns.reduce(function(acc, i) {
    var s = i.status || 'unknown';
    var f = acc.find(function(a) { return a.name === s; });
    if (f) f.value++;
    else acc.push({ name: s, value: 1 });
    return acc;
  }, []);

  /* 5. task trend by month */
  var taskTrend = MONTHS_SHORT.slice(0, month).map(function(m, idx) {
    var mt = tasks.filter(function(t) {
      if (!t.created_at) return false;
      var d = new Date(t.created_at);
      return d.getMonth() === idx && d.getFullYear() === year;
    });
    return {
      month:     m,
      completed: mt.filter(function(t) { return t.status === 'completed'; }).length,
      pending:   mt.filter(function(t) { return t.status === 'pending' || t.status === 'in_progress'; }).length,
    };
  });

  /* 6. placement type */
  var placTypeData = placements.reduce(function(acc, p) {
    var t = (p.placement_type || 'other').replace(/_/g, ' ');
    var f = acc.find(function(a) { return a.type === t; });
    if (f) f.count++;
    else acc.push({ type: t, count: 1 });
    return acc;
  }, []);

  /* 7. performance radar */
  var radarData = [
    { subject: 'Attendance',   A: totalDays > 0 ? pct(totalPresent, totalDays) : 0 },
    { subject: 'Tasks',        A: taskTotal > 0 && ts2 ? pct(ts2.completed, taskTotal) : 0 },
    { subject: 'Placements',   A: interns.length > 0 ? pct(placedCount, interns.length) : 0 },
    { subject: 'Active Staff', A: dashStats && dashStats.overview && dashStats.overview.total_employees > 0
        ? pct(dashStats.overview.active_employees, dashStats.overview.total_employees) : 0 },
    { subject: 'Intern Score', A: scoredInterns.length > 0
        ? Math.round(scoredInterns.reduce(function(s,i){ return s + i.performance_score; },0) / scoredInterns.length)
        : 0 },
  ];

  /* ── render ── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">
            Live data — auto-refreshes every 30s
            {lastUpdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Updated {lastUpdated}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="input-field w-32"
            value={month}
            onChange={function(e) { setMonth(parseInt(e.target.value)); }}
          >
            {MONTHS_FULL.map(function(m, i) {
              return <option key={i} value={i + 1}>{m}</option>;
            })}
          </select>
          <select
            className="input-field w-24"
            value={year}
            onChange={function(e) { setYear(parseInt(e.target.value)); }}
          >
            {[2023, 2024, 2025, 2026].map(function(y) {
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !dashStats && (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Attendance Rate"
          value={attendRate}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub={totalPresent + ' present / ' + totalDays + ' days'}
          change="+2.1% vs last month"
          up={true}
        />
        <KpiCard
          title="Task Completion"
          value={taskCompletion}
          icon={ClipboardList}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          sub={ts2 ? ts2.completed + ' completed of ' + taskTotal : '0 tasks'}
          change="+5% vs last month"
          up={true}
        />
        <KpiCard
          title="Placement Rate"
          value={placementRate}
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          sub={placedCount + ' of ' + interns.length + ' interns placed'}
        />
        <KpiCard
          title="Avg Performance"
          value={avgPerf === '—' ? '—' : avgPerf + '%'}
          icon={GraduationCap}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          sub={scoredInterns.length + ' interns scored'}
          change="+4 pts vs last month"
          up={true}
        />
      </div>

      {/* Overview mini-stats */}
      {dashStats && dashStats.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Employees',  val: dashStats.overview.total_employees,  color: 'bg-blue-500' },
            { label: 'Active Employees', val: dashStats.overview.active_employees, color: 'bg-green-500' },
            { label: 'Total Interns',    val: dashStats.overview.total_interns,    color: 'bg-purple-500' },
            { label: 'Pending Tasks',    val: dashStats.overview.pending_tasks,    color: 'bg-orange-500' },
          ].map(function(item) {
            return (
              <div key={item.label} className="card flex items-center gap-3 py-3">
                <div className={'w-2 h-8 rounded-full flex-shrink-0 ' + item.color}></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{item.val || 0}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 1 — Attendance Trend + Dept Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title={'Attendance Trend — ' + MONTHS_FULL[month - 1] + ' ' + year} badge={true}>
          {attendTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendTrend}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={function(d) {
                  try { return String(d).split('-')[2]; } catch(e) { return d; }
                }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#gP)" name="Present" strokeWidth={2} />
                <Area type="monotone" dataKey="absent"  stroke="#ef4444" fill="url(#gA)" name="Absent"  strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No attendance data for this period" hint="Go to Attendance page and mark attendance" />
          )}
        </ChartCard>

        <ChartCard title="Attendance by Role (This Period)" badge={true}>
          {deptAttend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptAttend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickFormatter={function(v) {
                  return v.charAt(0).toUpperCase() + v.slice(1);
                }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="present" fill="#3b82f6" name="Present" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent"  fill="#ef4444" name="Absent"  radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No attendance data yet" hint="Mark attendance to see role-wise breakdown" />
          )}
        </ChartCard>

      </div>

      {/* Row 2 — Placement packages + Task trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Placement Packages (LPA)" badge={true}>
          {pkgData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pkgData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={function(v) { return v + ' LPA'; }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={65} />
                <Tooltip formatter={function(v) { return v + ' LPA'; }} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="lpa" radius={[0, 4, 4, 0]} name="Package (LPA)">
                  {pkgData.map(function(entry, i) {
                    return <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No placement data yet" hint="Go to Placements page and add placement records" />
          )}
        </ChartCard>

        <ChartCard title="Task Completion Trend" badge={true}>
          {taskTrend.some(function(d) { return d.completed > 0 || d.pending > 0; }) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={taskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Completed" />
                <Line type="monotone" dataKey="pending"   stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" name="In Progress / Pending" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No task data yet" hint="Go to Tasks page and create tasks" />
          )}
        </ChartCard>

      </div>

      {/* Row 3 — Intern status donut + Placement type + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <ChartCard title="Intern Status Distribution" badge={true}>
          {internPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={internPie}
                  cx="45%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {internPie.map(function(entry, i) {
                    return <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Legend
                  layout="vertical" align="right" verticalAlign="middle"
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={function(v) { return v.charAt(0).toUpperCase() + v.slice(1); }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No intern data" hint="Add interns first" />
          )}
        </ChartCard>

        <ChartCard title="Placements by Type" badge={true}>
          {placTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={placTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Count">
                  {placTypeData.map(function(entry, i) {
                    return <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty msg="No placement type data" hint="Add placements first" />
          )}
        </ChartCard>

        <ChartCard title="Overall Performance Radar" badge={true}>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
              <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                formatter={function(v) { return Math.round(v) + '%'; }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Attendance Summary Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Monthly Attendance Summary</h3>
            <p className="text-xs text-gray-400 mt-0.5">{MONTHS_FULL[month - 1]} {year} — all users</p>
          </div>
          {loading && <Spinner size="sm" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Employee', 'Role', 'Present', 'Absent', 'Half Day', 'Leave', 'Hours', 'Rate'].map(function(h) {
                  return (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendReport.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <p className="text-sm text-gray-400">No attendance records for {MONTHS_FULL[month - 1]} {year}</p>
                    <p className="text-xs text-gray-300 mt-1">Go to Attendance page to mark attendance</p>
                  </td>
                </tr>
              )}
              {attendReport.map(function(u, i) {
                var total = (u.present || 0) + (u.absent || 0) + (u.half_day || 0);
                var rate  = total > 0 ? pct(u.present || 0, total) : 0;
                var barColor = rate >= 90 ? '#22c55e' : rate >= 75 ? '#f59e0b' : '#ef4444';
                var userName = u.user ? u.user.name : '—';
                var userRole = u.user ? u.user.role : '—';
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize text-xs">{userRole}</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">{u.present || 0}</td>
                    <td className="px-4 py-3 text-red-500 font-semibold">{u.absent  || 0}</td>
                    <td className="px-4 py-3 text-yellow-600 font-semibold">{u.half_day || 0}</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">{u.leave || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{u.total_hours ? u.total_hours + 'h' : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-2 rounded-full transition-all" style={{ width: rate + '%', background: barColor }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: barColor }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
