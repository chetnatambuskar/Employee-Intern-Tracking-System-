import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

var TABS = [
  { id: 'basic',        label: 'Basic Details'        },
  { id: 'education',    label: 'Education Details'    },
  { id: 'experience',   label: 'Work Experience'      },
  { id: 'skills',       label: 'Skills & Languages'   },
  { id: 'projects',     label: 'Projects'             },
  { id: 'achievements', label: 'Achievements'         },
  { id: 'resume',       label: 'Resume & Docs'        },
];

export default function ProfilePage() {
  var ctx  = useAuth();
  var user = ctx.user;

  var s1 = useState('basic');
  var activeTab = s1[0]; var setActiveTab = s1[1];

  var s2 = useState(true);
  var loading = s2[0]; var setLoading = s2[1];

  var s3 = useState(false);
  var saving = s3[0]; var setSaving = s3[1];

  var s4 = useState(false);
  var avLoading = s4[0]; var setAvLoading = s4[1];

  var s5 = useState('');
  var avPreview = s5[0]; var setAvPreview = s5[1];

  var s6 = useState(false);
  var saved = s6[0]; var setSaved = s6[1];

  var fileRef = useRef(null);

  var b1 = useState({ name: '', phone: '', address: '', bio: '', date_of_birth: '', gender: '', linkedin: '', github: '' });
  var basic = b1[0]; var setBasic = b1[1];

  var e1 = useState([]);
  var education = e1[0]; var setEducation = e1[1];

  var e2 = useState([]);
  var experience = e2[0]; var setExperience = e2[1];

  var e3 = useState([]);
  var skills = e3[0]; var setSkills = e3[1];

  var e4 = useState([]);
  var languages = e4[0]; var setLanguages = e4[1];

  var e5 = useState([]);
  var projects = e5[0]; var setProjects = e5[1];

  var e6 = useState([]);
  var achievements = e6[0]; var setAchievements = e6[1];

  var n1 = useState('');
  var newSkill = n1[0]; var setNewSkill = n1[1];

  var n2 = useState('');
  var newLang = n2[0]; var setNewLang = n2[1];

  useEffect(function() { loadProfile(); }, []);

  function loadProfile() {
    setLoading(true);
    api.get('/profile')
      .then(function(r) {
        var d = r.data;
        setBasic({
          name:          d.name          || (user ? user.name  : '') || '',
          phone:         d.phone         || (user ? user.phone : '') || '',
          address:       d.address       || '',
          bio:           d.bio           || '',
          date_of_birth: d.date_of_birth || '',
          gender:        d.gender        || '',
          linkedin:      d.linkedin      || '',
          github:        d.github        || '',
        });
        setEducation(Array.isArray(d.education)    ? d.education    : []);
        setExperience(Array.isArray(d.experience)  ? d.experience   : []);
        setSkills(Array.isArray(d.skills)          ? d.skills       : []);
        setLanguages(Array.isArray(d.languages)    ? d.languages    : []);
        setProjects(Array.isArray(d.projects)      ? d.projects     : []);
        setAchievements(Array.isArray(d.achievements) ? d.achievements : []);
        if (d.avatar) setAvPreview('http://localhost:8000/storage/' + d.avatar);
      })
      .catch(function() {
        if (user) setBasic(function(p) { return Object.assign({}, p, { name: user.name || '', phone: user.phone || '' }); });
      })
      .finally(function() { setLoading(false); });
  }

  function saveProfile() {
    setSaving(true);
    var payload = {
      name:          basic.name          || '',
      phone:         basic.phone         || '',
      address:       basic.address       || '',
      bio:           basic.bio           || '',
      date_of_birth: basic.date_of_birth || '',
      gender:        basic.gender        || '',
      linkedin:      basic.linkedin      || '',
      github:        basic.github        || '',
      education:     education,
      experience:    experience,
      skills:        skills,
      languages:     languages,
      projects:      projects,
      achievements:  achievements,
    };
    api.post('/profile/update', payload)
      .then(function(r) {
        toast.success('Profile saved successfully!');
        setSaved(true);
        setTimeout(function() { setSaved(false); }, 4000);
        if (r.data && r.data.profile) {
          var d = r.data.profile;
          setBasic({ name: d.name || '', phone: d.phone || '', address: d.address || '', bio: d.bio || '', date_of_birth: d.date_of_birth || '', gender: d.gender || '', linkedin: d.linkedin || '', github: d.github || '' });
          setEducation(Array.isArray(d.education)    ? d.education    : []);
          setExperience(Array.isArray(d.experience)  ? d.experience   : []);
          setSkills(Array.isArray(d.skills)          ? d.skills       : []);
          setLanguages(Array.isArray(d.languages)    ? d.languages    : []);
          setProjects(Array.isArray(d.projects)      ? d.projects     : []);
          setAchievements(Array.isArray(d.achievements) ? d.achievements : []);
        }
      })
      .catch(function(err) {
        var msg = 'Failed to save profile';
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
        toast.error(msg);
      })
      .finally(function() { setSaving(false); });
  }

  function handleAvatar(e) {
    var file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    var reader = new FileReader();
    reader.onload = function(ev) { setAvPreview(ev.target.result); };
    reader.readAsDataURL(file);
    setAvLoading(true);
    var form = new FormData();
    form.append('avatar', file);
    api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(function() { toast.success('Photo updated!'); })
      .catch(function() { toast.error('Failed to upload photo'); })
      .finally(function() { setAvLoading(false); });
  }

  function setB(k, v) { setBasic(function(p) { var n = Object.assign({}, p); n[k] = v; return n; }); }

  function listAdd(setter, tpl) { setter(function(p) { return p.concat([Object.assign({}, tpl)]); }); }
  function listRemove(setter, i) { setter(function(p) { return p.filter(function(_, idx) { return idx !== i; }); }); }
  function listSet(setter, i, k, v) {
    setter(function(p) {
      return p.map(function(item, idx) {
        if (idx !== i) return item;
        var n = Object.assign({}, item); n[k] = v; return n;
      });
    });
  }

  function addSkill() {
    var s = newSkill.trim();
    if (!s) return;
    if (skills.indexOf(s) !== -1) { toast.error('Already added'); return; }
    setSkills(function(p) { return p.concat([s]); });
    setNewSkill('');
  }
  function addLang() {
    var s = newLang.trim();
    if (!s) return;
    setLanguages(function(p) { return p.concat([s]); });
    setNewLang('');
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  var initials = (basic.name || (user && user.name) || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto">
      {saved && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✓ Profile saved successfully! All data has been stored.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <div className="w-full lg:w-60 flex-shrink-0 space-y-4">
          <div className="card text-center py-5">
            <div className="relative inline-block mb-3">
              {avPreview ? (
                <img src={avPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center mx-auto text-white text-2xl font-bold shadow-md">{initials}</div>
              )}
              <button onClick={function() { if (fileRef.current) fileRef.current.click(); }}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow text-sm transition-colors">
                {avLoading ? '…' : '📷'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
            <p className="font-bold text-gray-900 text-sm">{basic.name || (user && user.name)}</p>
            <p className="text-xs text-gray-500 capitalize">{user && user.role}</p>
            <p className="text-xs text-gray-400 mt-0.5 px-2 truncate">{user && user.email}</p>
          </div>

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

          <button onClick={saveProfile} disabled={saving}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-3">
            {saving ? <Spinner size="sm" /> : '💾'}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <p className="text-xs text-gray-400 text-center -mt-2">All fields are optional</p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* BASIC */}
          {activeTab === 'basic' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-900">Basic Details</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All fields optional</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input type="text" className="input-field" value={basic.name} placeholder="Your full name (optional)"
                    onChange={function(e) { setB('name', e.target.value); }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                  <input type="text" className="input-field" value={basic.phone} placeholder="+91 9999999999 (optional)"
                    onChange={function(e) { setB('phone', e.target.value); }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                  <input type="date" className="input-field" value={basic.date_of_birth}
                    onChange={function(e) { setB('date_of_birth', e.target.value); }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                  <select className="input-field" value={basic.gender} onChange={function(e) { setB('gender', e.target.value); }}>
                    <option value="">Select (optional)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                  <input type="text" className="input-field" value={basic.linkedin} placeholder="linkedin.com/in/yourname (optional)"
                    onChange={function(e) { setB('linkedin', e.target.value); }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">GitHub URL</label>
                  <input type="text" className="input-field" value={basic.github} placeholder="github.com/yourname (optional)"
                    onChange={function(e) { setB('github', e.target.value); }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <textarea className="input-field resize-none" rows={2} value={basic.address} placeholder="Your address (optional)"
                  onChange={function(e) { setB('address', e.target.value); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bio / About Me</label>
                <textarea className="input-field resize-none" rows={4} value={basic.bio}
                  placeholder="Write something about yourself... (optional)"
                  onChange={function(e) { setB('bio', e.target.value); }} />
              </div>
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Basic Details'}
              </button>
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === 'education' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Education Details</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Add as many or as few as you want</p>
                </div>
                <button onClick={function() { listAdd(setEducation, { degree: '', institution: '', year_from: '', year_to: '', percentage: '' }); }}
                  className="btn-primary text-xs py-1.5 px-3">+ Add Education</button>
              </div>
              {education.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-3xl mb-2">🎓</p>
                  <p className="text-sm text-gray-500 font-medium">No education added yet</p>
                  <p className="text-xs text-gray-400 mt-1">This section is completely optional</p>
                  <button onClick={function() { listAdd(setEducation, { degree: '', institution: '', year_from: '', year_to: '', percentage: '' }); }}
                    className="mt-3 text-primary-600 text-xs hover:underline">+ Add your education</button>
                </div>
              )}
              {education.map(function(edu, i) {
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">#{i + 1}</span>
                      <button onClick={function() { listRemove(setEducation, i); }}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Degree / Class</label>
                        <input type="text" className="input-field" value={edu.degree || ''} placeholder="e.g. B.Tech CSE, 12th, MBA"
                          onChange={function(e) { listSet(setEducation, i, 'degree', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Institution / College</label>
                        <input type="text" className="input-field" value={edu.institution || ''} placeholder="College or School name"
                          onChange={function(e) { listSet(setEducation, i, 'institution', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From Year</label>
                        <input type="text" className="input-field" value={edu.year_from || ''} placeholder="2020"
                          onChange={function(e) { listSet(setEducation, i, 'year_from', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To Year</label>
                        <input type="text" className="input-field" value={edu.year_to || ''} placeholder="2024"
                          onChange={function(e) { listSet(setEducation, i, 'year_to', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Percentage / CGPA</label>
                        <input type="text" className="input-field" value={edu.percentage || ''} placeholder="85% or 8.5 CGPA"
                          onChange={function(e) { listSet(setEducation, i, 'percentage', e.target.value); }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Education'}
              </button>
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Work Experience</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Internships, jobs, freelance work</p>
                </div>
                <button onClick={function() { listAdd(setExperience, { company: '', role: '', from: '', to: '', description: '' }); }}
                  className="btn-primary text-xs py-1.5 px-3">+ Add Experience</button>
              </div>
              {experience.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-3xl mb-2">💼</p>
                  <p className="text-sm text-gray-500 font-medium">No experience added yet</p>
                  <p className="text-xs text-gray-400 mt-1">This section is completely optional</p>
                  <button onClick={function() { listAdd(setExperience, { company: '', role: '', from: '', to: '', description: '' }); }}
                    className="mt-3 text-primary-600 text-xs hover:underline">+ Add experience</button>
                </div>
              )}
              {experience.map(function(exp, i) {
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">#{i + 1}</span>
                      <button onClick={function() { listRemove(setExperience, i); }}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                        <input type="text" className="input-field" value={exp.company || ''} placeholder="Company name"
                          onChange={function(e) { listSet(setExperience, i, 'company', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role / Position</label>
                        <input type="text" className="input-field" value={exp.role || ''} placeholder="e.g. Software Intern"
                          onChange={function(e) { listSet(setExperience, i, 'role', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                        <input type="date" className="input-field" value={exp.from || ''}
                          onChange={function(e) { listSet(setExperience, i, 'from', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                        <input type="date" className="input-field" value={exp.to || ''}
                          onChange={function(e) { listSet(setExperience, i, 'to', e.target.value); }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea className="input-field resize-none" rows={2} value={exp.description || ''} placeholder="What did you work on? (optional)"
                        onChange={function(e) { listSet(setExperience, i, 'description', e.target.value); }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Experience'}
              </button>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="card space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-semibold text-gray-900">Technical Skills</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Type a skill and press Add or Enter key</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" className="input-field flex-1" value={newSkill}
                    placeholder="e.g. React, Python, MySQL, Laravel..."
                    onChange={function(e) { setNewSkill(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                  <button onClick={addSkill} className="btn-primary px-4">Add</button>
                </div>
                {skills.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">No skills added yet — completely optional</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map(function(s) {
                      return (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
                          {s}
                          <button onClick={function() { setSkills(function(p) { return p.filter(function(x) { return x !== s; }); }); }}
                            className="hover:text-red-500 transition-colors ml-0.5">✕</button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Skills'}
                </button>
              </div>

              <div className="card space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-semibold text-gray-900">Languages Known</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Type a language and press Add</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" className="input-field flex-1" value={newLang}
                    placeholder="e.g. English, Hindi, Marathi..."
                    onChange={function(e) { setNewLang(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === 'Enter') { e.preventDefault(); addLang(); } }} />
                  <button onClick={addLang} className="btn-primary px-4">Add</button>
                </div>
                {languages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl">No languages added yet — completely optional</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {languages.map(function(l) {
                      return (
                        <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium">
                          {l}
                          <button onClick={function() { setLanguages(function(p) { return p.filter(function(x) { return x !== l; }); }); }}
                            className="hover:text-red-500 transition-colors ml-0.5">✕</button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                  {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Languages'}
                </button>
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Add your personal or college projects — completely optional</p>
                </div>
                <button onClick={function() { listAdd(setProjects, { title: '', description: '', tech: '', link: '' }); }}
                  className="btn-primary text-xs py-1.5 px-3">+ Add Project</button>
              </div>
              {projects.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-3xl mb-2">🚀</p>
                  <p className="text-sm text-gray-500 font-medium">No projects added yet</p>
                  <p className="text-xs text-gray-400 mt-1">This section is completely optional — skip if not needed</p>
                  <button onClick={function() { listAdd(setProjects, { title: '', description: '', tech: '', link: '' }); }}
                    className="mt-3 text-primary-600 text-xs hover:underline">+ Add a project</button>
                </div>
              )}
              {projects.map(function(proj, i) {
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">Project #{i + 1}</span>
                      <button onClick={function() { listRemove(setProjects, i); }}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Project Title</label>
                        <input type="text" className="input-field" value={proj.title || ''} placeholder="Project name (optional)"
                          onChange={function(e) { listSet(setProjects, i, 'title', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Technologies Used</label>
                        <input type="text" className="input-field" value={proj.tech || ''} placeholder="React, Laravel, MySQL (optional)"
                          onChange={function(e) { listSet(setProjects, i, 'tech', e.target.value); }} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">GitHub / Live Link</label>
                        <input type="text" className="input-field" value={proj.link || ''} placeholder="https://github.com/... (optional)"
                          onChange={function(e) { listSet(setProjects, i, 'link', e.target.value); }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea className="input-field resize-none" rows={3} value={proj.description || ''}
                        placeholder="Describe your project... what problem it solves, how you built it (optional)"
                        onChange={function(e) { listSet(setProjects, i, 'description', e.target.value); }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Projects'}
              </button>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Achievements & Certifications</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Awards, certificates, recognitions — all optional</p>
                </div>
                <button onClick={function() { listAdd(setAchievements, { title: '', description: '', year: '' }); }}
                  className="btn-primary text-xs py-1.5 px-3">+ Add</button>
              </div>
              {achievements.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="text-sm text-gray-500 font-medium">No achievements added yet</p>
                  <p className="text-xs text-gray-400 mt-1">This section is completely optional — skip if not needed</p>
                  <button onClick={function() { listAdd(setAchievements, { title: '', description: '', year: '' }); }}
                    className="mt-3 text-primary-600 text-xs hover:underline">+ Add achievement</button>
                </div>
              )}
              {achievements.map(function(ach, i) {
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-lg border border-gray-200">#{i + 1}</span>
                      <button onClick={function() { listRemove(setAchievements, i); }}
                        className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Title / Certificate Name</label>
                        <input type="text" className="input-field" value={ach.title || ''} placeholder="e.g. AWS Certificate (optional)"
                          onChange={function(e) { listSet(setAchievements, i, 'title', e.target.value); }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                        <input type="text" className="input-field" value={ach.year || ''} placeholder="2024 (optional)"
                          onChange={function(e) { listSet(setAchievements, i, 'year', e.target.value); }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea className="input-field resize-none" rows={2} value={ach.description || ''}
                        placeholder="Brief description... (optional)"
                        onChange={function(e) { listSet(setAchievements, i, 'description', e.target.value); }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                {saving ? <Spinner size="sm" /> : '💾'} {saving ? 'Saving...' : 'Save Achievements'}
              </button>
            </div>
          )}

          {/* RESUME */}
          {activeTab === 'resume' && (
            <div className="card text-center py-12">
              <p className="text-5xl mb-4">📄</p>
              <h3 className="font-semibold text-gray-900 mb-2">Resume & Documents</h3>
              <p className="text-sm text-gray-500 mb-6">Upload and manage your CV and certificates</p>
              <a href="/resumes" className="btn-primary inline-flex items-center gap-2">Go to Resume Manager →</a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
