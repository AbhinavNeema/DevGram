import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import toast from 'react-hot-toast';
import {
  Share2,
  MessageSquare,
  Edit3,
  Cpu,
  Terminal,
  Rocket,
  UserX,
  Loader2,
  Check,
  BookOpen,
  Calendar,
} from 'lucide-react';

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const [data, setData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'blogs'
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(false);
        const url = username
          ? `/users/username/${encodeURIComponent(username)}`
          : `/users/${id}`;
        const res = await api.get(url);
        setData(res.data);

        if (currentUserId && res.data?.user?.followers) {
          setIsFollowing(
            res.data.user.followers.some(
              (f) => String(f._id || f) === String(currentUserId)
            )
          );
        }
      } catch (err) {
        console.error('Profile fetch failed', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id || username) {
      fetchProfile();
    }
  }, [id, username, currentUserId]);

  useEffect(() => {
    if (activeTab !== 'blogs' || !data?.user?._id) return;

    api
      .get(`/blogs/user/${data.user._id}`)
      .then((res) => {
        setBlogs(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error('Fetch user blogs failed', err);
      });
  }, [activeTab, data]);

  const toggleFollow = async () => {
    if (!data?.user?._id || followingLoading) return;
    setFollowingLoading(true);
    try {
      const res = await api.put(`/users/${data.user._id}/follow`);
      setIsFollowing(res.data.following);
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.followers,
        },
      }));
      toast.success(res.data.following ? 'Followed user' : 'Unfollowed user');
    } catch (err) {
      console.error('Follow toggle failed', err);
      toast.error('Failed to update follow status');
    } finally {
      setFollowingLoading(false);
    }
  };

  const startDM = async () => {
    if (!data?.user?._id) return;
    try {
      const res = await api.get(`/messages/start/${data.user._id}`);
      navigate(`/dm/${res.data._id}`);
    } catch (err) {
      console.error('Start DM failed', err);
      toast.error('Could not open direct message');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Profile link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <span className="text-slate-400 text-sm font-medium">Loading developer profile...</span>
      </div>
    );
  }

  if (error || !data?.user) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-400 mx-auto mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Developer Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The profile you are looking for does not exist or may have been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            Explore Feed
          </button>
        </div>
      </div>
    );
  }

  const { user, projects = [] } = data;
  const isOwner = currentUserId && String(currentUserId) === String(user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-6">
      {/* ================= HERO HEADER ================= */}
      <div className="relative mb-8">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] pointer-events-none" />

        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>

            {/* Identity & Bio */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold self-center md:self-auto">
                  @{user.username}
                </span>
              </div>

              <p className="text-slate-300 mt-2.5 max-w-2xl text-sm leading-relaxed">
                {user.bio || 'Building software and exploring architectures on DevGram.'}
              </p>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mt-5">
                <div className="text-center md:text-left">
                  <p className="text-white text-lg font-bold">{projects.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Projects
                  </p>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-white text-lg font-bold">
                    {user.followers?.length || 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Followers
                  </p>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-white text-lg font-bold">
                    {user.following?.length || 0}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                    Following
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 shrink-0 self-center md:self-start">
              <button
                onClick={handleShare}
                aria-label="Share profile"
                className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] transition-all hover:scale-105"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {!isOwner && (
                <>
                  <button
                    onClick={toggleFollow}
                    disabled={followingLoading}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                      isFollowing
                        ? 'bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1]'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-indigo-500/25'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>

                  <button
                    onClick={startDM}
                    aria-label="Direct message"
                    className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] hover:text-white transition-all hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              )}

              {isOwner && (
                <button
                  onClick={() => navigate(`/edit-profile/${user._id}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl px-5 py-2.5 transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Terminal className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                About Developer
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {user.about || 'No detailed background provided yet.'}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Cpu className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Tech Stack & Tools
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {user.techStack?.length ? (
                user.techStack.map((skill) => (
                  <span
                    key={skill}
                    className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-xs">
                  No technologies listed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FEED / CONTENT TABS */}
        <div>
          {/* Tabs bar */}
          <div className="flex gap-6 border-b border-white/[0.06] mb-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Projects ({projects.length})
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'blogs'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Articles
            </button>
          </div>

          {/* Content Lists */}
          <div className="space-y-6">
            {activeTab === 'projects' ? (
              projects.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
                  <Rocket className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No projects published yet</p>
                </div>
              ) : (
                projects.map((p) => (
                  <ProjectCard
                    key={p._id}
                    project={p}
                    showOwnerActions={isOwner}
                    onDelete={() => {
                      setData((prev) => ({
                        ...prev,
                        projects: prev.projects.filter((item) => item._id !== p._id),
                      }));
                    }}
                  />
                ))
              )
            ) : blogs.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl">
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No articles published yet</p>
              </div>
            ) : (
              blogs.map((b) => (
                <BlogCard
                  key={b._id}
                  blog={b}
                  showOwnerActions={isOwner}
                  onDelete={() => {
                    setBlogs((prev) => prev.filter((item) => item._id !== b._id));
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;