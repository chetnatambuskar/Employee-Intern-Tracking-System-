import { useEffect, useState } from 'react';
import api from '../api/axios';
import Spinner from '../components/ui/Spinner';
import { Users, GraduationCap, ClipboardList, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="card flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!stats)  return <p className="text-gray-500 text-center mt-20">Failed to load dashboard.</p>;

  const taskPieData = [
    { name: 'Pending',     value: stats.task_summary.pending,     color: '#f59e0b' },
    { name: 'In Progress', value: stats.task_summary.in_progress, color: '#3b82f6' },
    { name: 'Completed',   value: stats.task_summary.completed,   color: '#10b981' },
    { name: 'Overdue',     value: stats.task_summary.overdue,     color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees"  value={stats.overview.total_employees}  icon={Users}         color="bg-blue-500"   sub={`${stats.overview.active_employees} active`} />
        <StatCard title="Total Interns"    value={stats.overview.total_interns}    icon={GraduationCap} color="bg-purple-500" sub={`${stats.overview.active_interns} active`} />
        <StatCard title="Placed Interns"   value={stats.overview.total_placements} icon={TrendingUp}    color="bg-green-500"  sub={`${stats.placement_stats.avg_package} LPA avg`} />
        <StatCard title="Pending Tasks"    value={stats.overview.pending_tasks}    icon={ClipboardList} color="bg-orange-500" />
      </div>

      {/* Attendance Today */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Today's Attendance</h3>
        <div className="flex gap-6">
          {[
            { label: 'Present', val: stats.attendance_today.present, color: 'text-green-600 bg-green-50' },
            { label: 'Absent',  val: stats.attendance_today.absent,  color: 'text-red-600 bg-red-50'   },
            { label: 'On Leave',val: stats.attendance_today.leave,   color: 'text-yellow-600 bg-yellow-50' },
          ].map(a => (
            <div key={a.label} className={`flex-1 rounded-xl p-4 ${a.color.split(' ')[1]} text-center`}>
              <p className={`text-2xl font-bold ${a.color.split(' ')[0]}`}>{a.val}</p>
              <p className="text-sm text-gray-600 mt-1">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.monthly_attendance}>
              <defs>
                <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.split('-')[2]} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="present" stroke="#3b82f6" fill="url(#present)" name="Present" />
              <Area type="monotone" dataKey="absent"  stroke="#ef4444" fill="none"           name="Absent"  />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Pie */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Task Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {taskPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {stats.recent_tasks?.length === 0 && <p className="text-sm text-gray-400">No recent tasks.</p>}
            {stats.recent_tasks?.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.priority === 'urgent' ? 'bg-red-500' :
                  task.priority === 'high'   ? 'bg-orange-500' : 'bg-green-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">Assigned to {task.assignee?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Performing Interns</h3>
          <div className="space-y-3">
            {stats.intern_performance?.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
            {stats.intern_performance?.map((intern, i) => (
              <div key={intern.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{intern.user?.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${intern.performance_score}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{intern.performance_score}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}