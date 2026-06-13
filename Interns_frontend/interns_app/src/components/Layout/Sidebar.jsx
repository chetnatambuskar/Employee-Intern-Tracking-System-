import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Building2,
  TrendingUp,
  LogOut,
  ChevronRight,
  FileText,
  BarChart2
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   roles: ['admin','manager','employee','intern'] },
  { to: '/employees',   icon: Users,            label: 'Employees',   roles: ['admin','manager'] },
  { to: '/interns',     icon: GraduationCap,    label: 'Interns',     roles: ['admin','manager'] },
  { to: '/attendance',  icon: CalendarCheck,    label: 'Attendance',  roles: ['admin','manager','employee','intern'] },
  { to: '/tasks',       icon: ClipboardList,    label: 'Tasks',       roles: ['admin','manager','employee','intern'] },
  { to: '/departments', icon: Building2,        label: 'Departments', roles: ['admin','manager'] },
  { to: '/placements',  icon: TrendingUp,       label: 'Placements',  roles: ['admin','manager'] },
  { to: '/resumes',     icon: FileText,         label: 'Resumes',     roles: ['admin','manager','employee','intern'] },
  { to: '/reports',     icon: BarChart2,        label: 'Reports',     roles: ['admin','manager'] },
  { to: '/profile', icon: Users, label: 'My Profile', roles: ['admin','manager','employee','intern'] },
  
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">EITMS</p>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-primary-600/20 rounded-full flex items-center justify-center">
            <span className="text-primary-400 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}