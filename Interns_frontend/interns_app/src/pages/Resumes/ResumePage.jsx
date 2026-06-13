import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { CloudUpload, FileText, Trash2, Download, Star, File } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { user } = useAuth();
  const fileRef = useRef();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);

  const isAdmin = ['admin', 'manager'].includes(user?.role);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const params = isAdmin && userId ? { user_id: userId } : {};
      const res = await api.get('/resumes', { params });
      setResumes(res.data);
    } catch (e) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      api.get('/employees').then(function(r) {
        setUsers(r.data.data || []);
      });
    }
    fetchResumes();
  }, [userId]);

  const handleUpload = async (file) => {
    if (!file) return;
    var allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, DOC, DOCX files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setUploading(true);
    var form = new FormData();
    form.append('resume', file);
    form.append('is_primary', resumes.length === 0 ? '1' : '0');
    try {
      await api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded!');
      fetchResumes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete('/resumes/' + id);
      toast.success('Resume deleted');
      fetchResumes();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await api.put('/resumes/' + id + '/primary');
      toast.success('Set as primary resume');
      fetchResumes();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    var file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIconInfo = (type) => {
    if (type && type.includes('pdf')) {
      return { bg: 'bg-red-50', color: 'text-red-600', label: 'PDF' };
    }
    if (type && (type.includes('word') || type.includes('document'))) {
      return { bg: 'bg-blue-50', color: 'text-blue-600', label: 'DOC' };
    }
    return { bg: 'bg-gray-50', color: 'text-gray-500', label: 'FILE' };
  };

  const getUploadDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStorageUrl = (filePath) => {
    return 'http://localhost:8000/storage/' + filePath;
  };

  const getDropZoneClass = () => {
    var base = 'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ';
    if (dragging) return base + 'border-primary-500 bg-primary-50';
    return base + 'border-gray-200 hover:border-primary-400 hover:bg-gray-50';
  };

  const getCardClass = (isPrimary) => {
    var base = 'card flex items-center gap-4 transition-all ';
    if (isPrimary) return base + 'border-primary-200 bg-primary-50/30';
    return base;
  };

  const renderUploadContent = () => {
    if (uploading) {
      return (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Uploading...</p>
        </div>
      );
    }
    return (
      <div>
        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CloudUpload size={26} className="text-primary-600" />
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1">
          {dragging ? 'Drop it here!' : 'Drag and drop your resume'}
        </p>
        <p className="text-xs text-gray-500">
          or click to browse — PDF, DOC, DOCX — Max 5MB
        </p>
      </div>
    );
  };

  const renderResumeItem = (r) => {
    var icon = getIconInfo(r.file_type);
    return (
      <div key={r.id} className={getCardClass(r.is_primary)}>
        <div className={'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ' + icon.bg}>
          <FileText size={20} className={icon.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 truncate">{r.file_name}</p>
            {r.is_primary && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                Primary
              </span>
            )}
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-mono">
              {icon.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatSize(r.file_size)} — Uploaded {getUploadDate(r.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!r.is_primary && (
            <button
              onClick={() => handleSetPrimary(r.id)}
              title="Set as primary"
              className="p-2 hover:bg-yellow-50 text-gray-400 hover:text-yellow-500 rounded-lg transition-colors"
            >
              <Star size={15} />
            </button>
          )}
          {r.is_primary && (
            <div className="p-2 text-yellow-500">
              <Star size={15} className="fill-yellow-400" />
            </div>
          )}
          <a
            href={getStorageUrl(r.file_path)}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
            title="Download"
          >
            <Download size={15} />
          </a>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  const renderList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      );
    }
    if (resumes.length === 0) {
      return (
        <div className="card text-center py-12">
          <File size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No resumes uploaded yet.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {resumes.map(renderResumeItem)}
      </div>
    );
  };

  return (
    <div className="max-w-3xl space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Resume Manager</h2>
          <p className="text-sm text-gray-500">Upload, manage and set your primary resume</p>
        </div>
        {isAdmin && (
          <select
            className="input-field w-52"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          >
            <option value="">My Resumes</option>
            {users.map(function(u) {
              return (
                <option key={u.id} value={u.user?.id}>{u.user?.name}</option>
              );
            })}
          </select>
        )}
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={getDropZoneClass()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={e => handleUpload(e.target.files[0])}
        />
        {renderUploadContent()}
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Uploaded Resumes
          <span className="ml-2 text-xs font-normal text-gray-400">({resumes.length})</span>
        </p>
        {renderList()}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-800 mb-1">Tips</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Set your most recent resume as Primary so managers see it first.</li>
          <li>Keep your resume under 2MB for fastest loading.</li>
          <li>Use PDF format for best compatibility.</li>
        </ul>
      </div>

    </div>
  );
}
