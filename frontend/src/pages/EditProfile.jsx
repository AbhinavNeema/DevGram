import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Camera,
  Plus,
  User,
  AtSign,
  FileText,
  Cpu,
} from 'lucide-react';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [about, setAbout] = useState('');
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState('');

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState('');

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/users/${id}`);
        const u = res.data?.user || res.data;

        setName(u.name || '');
        setUsername(u.username || '');
        setBio(u.bio || '');
        setAbout(u.about || '');
        setTechStack(u.techStack || []);
        setPreview(u.profilePhoto || '');
      } catch (err) {
        console.error('Failed to load profile for editing', err);
        toast.error('Failed to load profile details');
      } finally {
        setFetching(false);
      }
    };

    if (id) loadProfile();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const addTech = () => {
    const tech = techInput.trim();
    if (!tech) return;
    if (techStack.includes(tech)) {
      toast.error('Technology already added');
      return;
    }
    if (techStack.length >= 15) {
      toast.error('Maximum 15 skills allowed');
      return;
    }

    setTechStack([...techStack, tech]);
    setTechInput('');
  };

  const removeTech = (tech) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  // Safe resolver for profile photo URL to avoid prepending backend URL to absolute http/blob links
  const getAvatarUrl = () => {
    if (!preview) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff`;
    }
    if (
      preview.startsWith('http://') ||
      preview.startsWith('https://') ||
      preview.startsWith('blob:') ||
      preview.startsWith('data:')
    ) {
      return preview;
    }
    const backend = import.meta.env.VITE_BACKEND_URL || '';
    return `${backend}${preview.startsWith('/') ? '' : '/'}${preview}`;
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('bio', bio.trim());
      formData.append('about', about.trim());
      formData.append('techStack', JSON.stringify(techStack));

      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      await api.put(`/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully!');
      navigate(`/user/${id}`);
    } catch (err) {
      console.error('Profile update failed', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save profile changes. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <span className="text-slate-400 text-sm font-medium">Loading profile details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Main Glass Form Card */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.06]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Edit Developer Profile
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Customize your bio, background, skills, and avatar
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] text-xs font-semibold transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Cancel</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* PROFILE PHOTO AVATAR */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group/avatar">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <label className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 p-2.5 rounded-full cursor-pointer shadow-lg shadow-indigo-500/30 transition-all hover:scale-110 border border-white/20">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-xs text-slate-400 mt-3">
              Click the camera icon to upload a new profile image (max 5MB)
            </span>
          </div>

          {/* NAME (READ ONLY) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                value={name}
                disabled
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* USERNAME (READ ONLY) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Username Handle
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                value={username}
                disabled
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* BIO */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Short Headline / Bio
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Distributed systems enthusiast & full-stack builder"
              maxLength={160}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
            <span className="text-[10px] text-slate-500 mt-1 block text-right">
              {bio.length}/160
            </span>
          </div>

          {/* ABOUT */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              About & Experience
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              placeholder="Tell other developers about your engineering journey, technologies you are currently mastering, or projects you want to collaborate on..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none leading-relaxed"
            />
          </div>

          {/* TECH STACK */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
              Skills & Tech Stack
            </label>

            {/* Selected tech pills */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="hover:text-red-400 transition-colors"
                      aria-label={`Remove skill ${tech}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="e.g. Go, PostgreSQL, Kubernetes..."
                className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />

              <button
                type="button"
                onClick={addTech}
                className="bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            type="button"
            onClick={saveProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-6 py-3.5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-4 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;