import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import {
  Share2,
  MessageSquare,
  Edit3,
  Cpu,
  Terminal,
  Rocket,
  UserPlus,
  UserCheck,
  Loader2,
  Github,
  MapPin,
  Calendar,
  Code2,
  FileText,
} from "lucide-react";

/* Get current user from token */
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload?.sub || payload?.id || null,
      name: payload?.name || null,
    };
  } catch {
    return null;
  }
};

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  /* Fetch profile data */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const url = username
          ? `/users/username/${username}`
          : id
          ? `/users/${id}`
          : null;

        if (!url) {
          navigate("/");
          return;
        }

        const res = await api.get(url);
        setData(res.data);

        if (currentUserId && res.data?.user?.followers) {
          const isFollowing = res.data.user.followers.some(
            (f) => String(f._id || f) === String(currentUserId)
          );
          setFollowing(isFollowing);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, username, currentUserId, navigate]);

  /* Fetch blogs when tab changes */
  useEffect(() => {
    if (activeTab !== "blogs" || !data?.user?._id) return;

    const fetchBlogs = async () => {
      try {
        const res = await api.get(`/blogs/user/${data.user._id}`);
        setBlogs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      }
    };

    fetchBlogs();
  }, [activeTab, data]);

  /* Toggle follow */
  const handleToggleFollow = async () => {
    if (!data?.user?._id || followLoading) return;

    try {
      setFollowLoading(true);
      const res = await api.put(`/users/${data.user._id}/follow`);
      setFollowing(res.data.following);

      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.followers,
        },
      }));

      toast.success(res.data.following ? "Followed!" : "Unfollowed");
    } catch (err) {
      console.error("Follow error:", err);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  /* Start DM */
  const handleStartDM = async () => {
    if (!data?.user?._id) return;

    try {
      const res = await api.get(`/messages/start/${data.user._id}`);
      navigate(`/dm/${res.data._id}`);
    } catch (err) {
      console.error("Start DM error:", err);
      toast.error("Failed to start conversation");
    }
  };

  /* Copy profile link */
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-ping opacity-20" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  /* No data */
  if (!data?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <UserCheck className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">User not found</h2>
        <button
          onClick={() => navigate("/")}
          className="text-primary hover:underline font-medium"
        >
          Go back home
        </button>
      </div>
    );
  }

  const { user, projects = [] } = data;
  const isOwner = currentUserId && String(currentUserId) === String(user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-8">
      {/* Hero Header */}
      <div className="relative mb-10">
        {/* Background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-primary/20 via-accent/10 to-accent-2/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
          {/* Gradient banner */}
          <div className="h-32 sm:h-40 bg-gradient-to-br from-primary via-accent to-accent-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            </div>
          </div>

          <div className="relative px-6 sm:px-8 pb-8 -mt-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase()
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-lg" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {user.name}
                  </h1>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5 self-center md:self-auto">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    @{user.username}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl text-sm">
                  {user.bio || "Developer building things on DevGram."}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 justify-center md:justify-start">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.location}
                    </span>
                  )}
                  {user.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 transition text-slate-600 dark:text-slate-400 hover:text-primary backdrop-blur-sm"
                  title="Share profile"
                >
                  <Share2 size={18} />
                </button>

                {!isOwner && (
                  <>
                    <button
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg ${
                        following
                          ? "bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 backdrop-blur-sm"
                          : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-indigo-500/25"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : following ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleStartDM}
                      className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 transition text-primary backdrop-blur-sm"
                      title="Message"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </>
                )}

                {isOwner && (
                  <button
                    onClick={() => navigate(`/edit-profile/${user._id}`)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-indigo-500/25 font-semibold text-sm transition-all"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projects.length}
                </p>
                <p className="text-xs text-slate-500 font-medium">Projects</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {blogs.length || user.blogs?.length || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium">Blogs</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.followers?.length || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium">Followers</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user.following?.length || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                About
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {user.about || "No description available."}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tech Stack
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.techStack?.length ? (
                user.techStack.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-sm">
                  No technologies listed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Tabs */}
          <div className="flex gap-6 mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/50 dark:border-slate-700/50">
            {[
              { key: "projects", label: "Projects", icon: Rocket },
              { key: "blogs", label: "Blogs", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "projects" ? (
              projects.length === 0 ? (
                <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No projects published</p>
                  {isOwner && (
                    <button
                      onClick={() => navigate("/create")}
                      className="mt-4 text-primary hover:underline text-sm font-semibold"
                    >
                      Create your first project
                    </button>
                  )}
                </div>
              ) : (
                projects.map((p) => (
                  <ProjectCard key={p._id} project={p} showOwnerActions={isOwner} />
                ))
              )
            ) : blogs.length === 0 ? (
              <div className="text-center py-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-accent/10 to-secondary/10 flex items-center justify-center">
                  <Terminal className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No blogs published</p>
                {isOwner && (
                  <button
                    onClick={() => navigate("/create")}
                    className="mt-4 text-accent hover:underline text-sm font-semibold"
                  >
                    Write your first blog
                  </button>
                )}
              </div>
            ) : (
              blogs.map((b) => (
                <BlogCard key={b._id} blog={b} showOwnerActions={isOwner} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;