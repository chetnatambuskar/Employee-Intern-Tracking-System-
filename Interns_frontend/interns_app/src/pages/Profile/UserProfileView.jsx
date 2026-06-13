import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

var TABS = [
  { id: 'basic',        label: 'Basic Details'      },
  { id: 'education',    label: 'Education'          },
  { id: 'experience',   label: 'Experience'         },
  { id: 'skills',       label: 'Skills & Languages' },
  { id: 'projects',     label: 'Projects'           },
  { id: 'achievements', label: 'Achievements'       },
];

var ROLE_COLORS = { admin: 'danger', manager: 'warning', employee: 'info', intern: 'purple' };

function Row(props) {
  if (!props.value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 w-36 flex-shrink-0 pt-0.5">{props.label}</span>
      <span className="text-sm text-gray-800">{props.value}</span>
    </div>
  );
}

export default function UserProfileView() {
  var params   = useParams();
  var navigate = useNavigate();
  var userId   = params.id;

  var ls = useState(true);
  var loading = ls[0]; var setLoading = ls[1];

  var ds = useState(null);
  var data = ds[0]; var setData = ds[1];

  var ts = useState('basic');
  var activeTab = ts[0]; var setActiveTab = ts[1];

  useEffect(function() {
    if (!userId) { navigate(-1); return; }
    setLoading(true);
    api.get('/admin/user-profile/' + userId)
      .then(function(r) { setData(r.data); })
      .catch(function() {
        toast.error('Failed to load profile');
        navigate(-1);
      })
      .finally(function() { setLoading(false); });
  }, [userId]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!data)   return <div className="card text-center py-16 text-gray-400">Profile not found.</div>;

  var initials = data.name ? data.name.charAt(0).toUpperCase() : 'U';
  var edu  = Array.isArray(data.education)    ? data.education    : [];
  var exp  = Array.isArray(data.experience)   ? data.experience   : [];
  var sks  = Array.isArray(data.skills)       ? data.skills       : [];
  var lgs  = Array.isArray(data.languages)    ? data.languages    : [];
  var prjs = Array.isArray(data.projects)     ? data.projects     : [];
  var achs = Array.isArray(data.achievements) ? data.achievements : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={function() { navigate(-1); }}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 text-sm font-medium flex items-center gap-1">
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Viewing Profile</h2>
          <p className="text-sm text-gray-500">{data.name} — {data.role}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">

          <div className="card text-center py-6">
            {data.avatar ? (
              <img src={'http://localhost:8000/storage/' + data.avatar} alt={data.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-white shadow-lg mb-3" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-lg mb-3">
                {initials}
              </div>
            )}
            <h3 className="font-bold text-gray-900">{data.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{data.email}</p>
            {data.phone && <p className="text-xs text-gray-400 mt-0.5">{data.phone}</p>}
            <div className="mt-3 flex justify-center">
              <Badge variant={ROLE_COLORS[data.role] || 'default'}>{data.role}</Badge>
            </div>
            {data.linkedin && (
              <a href={data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1 mt-3 text-xs text-blue-600 hover:underline">
                🔗 LinkedIn Profile
              </a>
            )}
            {data.github && (
              <a href={data.github.startsWith('http') ? data.github : 'https://' + data.github}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-600 hover:underline">
                🐙 GitHub Profile
              </a>
            )}
          </div>

          {data.bio && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 mb-2">About</p>
              <p className="text-xs text-gray-600 leading-relaxed">{data.bio}</p>
            </div>
          )}

          <div className="card p-2 space-y-0.5">
            {TABS.map(function(tab) {
              var active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={function() { setActiveTab(tab.id); }}
                  className={'w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ' +
                    (active ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100')}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="card space-y-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">Quick Stats</p>
            {[
              { label: 'Education',    count: edu.length  },
              { label: 'Experience',   count: exp.length  },
              { label: 'Skills',       count: sks.length  },
              { label: 'Projects',     count: prjs.length },
              { label: 'Achievements', count: achs.length },
            ].map(function(s) {
              return (
                <div key={s.label} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{s.label}</span>
                  <span className={'font-semibold px-2 py-0.5 rounded-full text-xs ' +
                    (s.count > 0 ? 'bg-primary-50 text-primary-700' : 'text-gray-400')}>
                    {s.count > 0 ? s.count + ' record' + (s.count > 1 ? 's' : '') : 'None'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {activeTab === 'basic' && (
            <div className="card space-y-1">
              <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-2">Basic Details</h3>
              <Row label="Full Name"     value={data.name} />
              <Row label="Email"         value={data.email} />
              <Row label="Phone"         value={data.phone} />
              <Row label="Role"          value={data.role} />
              <Row label="Date of Birth" value={data.date_of_birth} />
              <Row label="Gender"        value={data.gender} />
              <Row label="Address"       value={data.address} />
              {!data.date_of_birth && !data.gender && !data.address && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-2xl mb-2">📝</p>
                  <p className="text-sm">This user has not filled basic details yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Education</h3>
              {edu.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🎓</p>
                  <p className="text-sm">No education records added.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {edu.map(function(e, i) {
                    return (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.degree || '—'}</p>
                            <p className="text-sm text-gray-600 mt-0.5">{e.institution || '—'}</p>
                          </div>
                          {(e.year_from || e.year_to) && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                              {e.year_from || ''}{e.year_from && e.year_to ? ' – ' : ''}{e.year_to || ''}
                            </span>
                          )}
                        </div>
                        {e.percentage && (
                          <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {e.percentage}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Work Experience</h3>
              {exp.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">💼</p>
                  <p className="text-sm">No experience records added.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exp.map(function(e, i) {
                    return (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{e.role || '—'}</p>
                            <p className="text-sm text-gray-600">{e.company || '—'}</p>
                          </div>
                          {(e.from || e.to) && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                              {e.from || ''}{e.from && e.to ? ' – ' : ''}{e.to || ''}
                            </span>
                          )}
                        </div>
                        {e.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{e.description}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Technical Skills</h3>
                {sks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No skills added.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sks.map(function(s) {
                      return (
                        <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">{s}</span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="card">
                <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Languages Known</h3>
                {lgs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">No languages added.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {lgs.map(function(l) {
                      return (
                        <span key={l} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium">{l}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Projects</h3>
              {prjs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🚀</p>
                  <p className="text-sm">No projects added.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prjs.map(function(p, i) {
                    return (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-gray-900 text-sm">{p.title || '—'}</p>
                          {p.link && (
                            <a href={p.link.startsWith('http') ? p.link : 'https://' + p.link}
                              target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded-lg">View →</a>
                          )}
                        </div>
                        {p.tech && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {p.tech.split(',').map(function(t) {
                              return (
                                <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{t.trim()}</span>
                              );
                            })}
                          </div>
                        )}
                        {p.description && <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 pb-3 border-b border-gray-100 mb-4">Achievements & Certifications</h3>
              {achs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="text-sm">No achievements added.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achs.map(function(a, i) {
                    return (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{a.title || '—'}</p>
                          {a.year && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">{a.year}</span>
                          )}
                        </div>
                        {a.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.description}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
