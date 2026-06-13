/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Bell, Check, CheckCheck, Trash2, Briefcase, ClipboardList, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

var TYPE_ICONS = {
  task:      ClipboardList,
  placement: Briefcase,
  info:      Info,
  success:   Check,
  warning:   Info,
};

var TYPE_COLORS = {
  task:      'bg-blue-100 text-blue-600',
  placement: 'bg-green-100 text-green-600',
  info:      'bg-gray-100 text-gray-500',
  success:   'bg-green-100 text-green-600',
  warning:   'bg-yellow-100 text-yellow-600',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    var now  = new Date();
    var then = new Date(dateStr);
    var diff = Math.floor((now - then) / 1000);
    if (diff < 60)   return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  } catch(e) { return ''; }
}

export default function Header(props) {
  var title = props.title;
  var auth  = useAuth();
  var user  = auth.user;
  var nav   = useNavigate();

  var os = useState(false);
  var open    = os[0];
  var setOpen = os[1];

  var ns = useState([]);
  var notifs    = ns[0];
  var setNotifs = ns[1];

  var cs = useState(0);
  var count    = cs[0];
  var setCount = cs[1];

  var ref = useRef(null);

  var fetchNotifs = async function() {
    try {
      var res = await api.get('/notifications');
      setNotifs(res.data.notifications || []);
      setCount(res.data.unread_count  || 0);
    // eslint-disable-next-line no-unused-vars
    } catch(e) {}
  };

  useEffect(function() {
    fetchNotifs();
    var interval = setInterval(fetchNotifs, 15000);
    return function() { clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(function() {
    var handler = function(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return function() { document.removeEventListener('mousedown', handler); };
  }, []);

  var handleMarkRead = async function(id) {
    try {
      await api.put('/notifications/' + id + '/read');
      fetchNotifs();
    // eslint-disable-next-line no-empty, no-unused-vars
    } catch(e) {}
  };

  var handleMarkAll = async function() {
    try {
      await api.post('/notifications/read-all');
      fetchNotifs();
    } catch(e) {}
  };

  var handleDelete = async function(id, e) {
    e.stopPropagation();
    try {
      await api.delete('/notifications/' + id);
      fetchNotifs();
    // eslint-disable-next-line no-empty
    } catch(e) {}
  };

  var handleClick = function(n) {
    handleMarkRead(n.id);
    if (n.link) {
      nav(n.link);
      setOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">

        <div className="relative" ref={ref}>
          <button
            onClick={function() { setOpen(function(v) { return !v; }); if (!open) fetchNotifs(); }}
            className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden">

              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  {count > 0 && (
                    <p className="text-xs text-gray-400">{count} unread</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {count > 0 && (
                    <button
                      onClick={handleMarkAll}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 px-2 py-1 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck size={13} /> All read
                    </button>
                  )}
                  <button onClick={function() { setOpen(false); }} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifs.length === 0 && (
                  <div className="text-center py-10">
                    <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-300 mt-1">Tasks and placements will appear here</p>
                  </div>
                )}

                {notifs.map(function(n) {
                  var IconComp = TYPE_ICONS[n.type] || Info;
                  var iconCls  = TYPE_COLORS[n.type] || TYPE_COLORS.info;
                  var isUnread = !n.is_read;

                  return (
                    <div
                      key={n.id}
                      onClick={function() { handleClick(n); }}
                      className={'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-50 ' + (isUnread ? 'bg-blue-50/40' : '')}
                    >
                      <div className={'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ' + iconCls}>
                        <IconComp size={14} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={'text-xs font-semibold ' + (isUnread ? 'text-gray-900' : 'text-gray-600')}>
                            {n.title}
                          </p>
                          <button
                            onClick={function(e) { handleDelete(n.id, e); }}
                            className="p-0.5 hover:bg-red-50 text-gray-300 hover:text-red-400 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">{timeAgo(n.created_at)}</p>
                          {isUnread && (
                            <button
                              onClick={function(e) { e.stopPropagation(); handleMarkRead(n.id); }}
                              className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-0.5"
                            >
                              <Check size={10} /> Read
                            </button>
                          )}
                        </div>
                      </div>

                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>

              {notifs.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">Updates every 15 seconds automatically</p>
                </div>
              )}

            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
