import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import {
  Share2,
  MessageSquare,
  Settings,
  Edit3,
  X,
  Cpu,
  Terminal,
  Rocket
} from "lucide-react";

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [isFollowing, setIsFollowing] = useState(false);
  const [toast, setToast] = useState("");

  const token = localStorage.getItem("token");

  let currentUserId = null;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload?.id || payload?._id || payload?.sub || null;
    }
  } catch {}

  useEffect(() => {
    const fetchProfile = async () => {
      const url = username ? `/users/username/${username}` : `/users/${id}`;
      const res = await api.get(url);

      setData(res.data);

      if (currentUserId) {
        setIsFollowing(
          res.data.user.followers.some(
            f => String(f._id) === String(currentUserId)
          )
        );
      }
    };

    fetchProfile();
  }, [id, username]);

  useEffect(() => {
    if (activeTab !== "blogs" || !data?.user?._id) return;

    api.get(`/blogs/user/${data.user._id}`).then(res => {
      setBlogs(res.data);
    });
  }, [activeTab, data]);

  const toggleFollow = async () => {
    const res = await api.put(`/users/${data.user._id}/follow`);

    setIsFollowing(res.data.following);

    setData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        followers: res.data.followers
      }
    }));
  };

  const startDM = async () => {
    const res = await api.get(`/messages/start/${data.user._id}`);
    navigate(`/dm/${res.data._id}`);
  };

  if (!data) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  const { user, projects } = data;
  const isOwner =
    currentUserId && String(currentUserId) === String(user._id);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 pt-10 bg-gray-50 min-h-screen">

      {/* ================= HERO HEADER ================= */}

      <div className="relative mb-12">

        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="relative bg-white border border-gray-200 rounded-[40px] p-10 shadow-xl">

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

            {/* Avatar */}

            <div className="w-28 h-28 rounded-3xl overflow-hidden border border-gray-200 shadow-lg bg-gray-100 flex items-center justify-center">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white">
                  {user.name?.[0]}
                </div>
              )}
            </div>

            {/* Identity */}

            <div className="flex-1 text-center md:text-left">

              <div className="flex flex-col md:flex-row md:items-center gap-3">

                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {user.name}
                </h1>

                <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  @{user.username}
                </span>

              </div>

              <p className="text-gray-600 mt-3 max-w-xl text-sm">
                {user.bio || "Developer building things on DevGram."}
              </p>

              {/* Stats */}

              <div className="flex justify-center md:justify-start gap-10 mt-6">

                <div className="text-center md:text-left">
                  <p className="text-gray-900 text-xl font-black">{projects.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Projects</p>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-gray-900 text-xl font-black">{user.followers.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Followers</p>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-gray-900 text-xl font-black">{user.following.length}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500">Following</p>
                </div>

              </div>

            </div>

            {/* Actions */}

            <div className="flex gap-3">

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setToast("Profile link copied");
                  setTimeout(() => setToast(""), 2000);
                }}
                className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 transition"
              >
                <Share2 size={18}/>
              </button>

              {!isOwner && (
                <>
                  <button
                    onClick={toggleFollow}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition ${
                      isFollowing
                        ? "bg-white/5 border border-white/10 text-slate-300"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                    onClick={startDM}
                    className="p-3 rounded-xl bg-white/5 hover:bg-indigo-600 border border-white/10 transition"
                  >
                    <MessageSquare size={18}/>
                  </button>
                </>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/edit-profile/${user._id}`)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-black text-xs uppercase tracking-widest shadow-sm"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200"
                  >
                    <Settings size={18}/>
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      </div>


      {/* ================= MAIN GRID ================= */}

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">

        {/* SIDEBAR */}

        <div className="space-y-8">

          {/* About */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Terminal size={16}/>
              <span className="text-[10px] font-black uppercase tracking-widest">
                About
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              {user.about || "No description available."}
            </p>

          </div>

          {/* Tech stack */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Cpu size={16}/>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Tech Stack
              </span>
            </div>

            <div className="flex flex-wrap gap-2">

              {user.techStack?.length ? (
                user.techStack.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">
                  No technologies listed
                </span>
              )}

            </div>

          </div>

        </div>


        {/* FEED */}

        <div>

          {/* Tabs */}

          <div className="flex gap-8 border-b border-gray-200 mb-8">

            {["projects", "blogs"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-black uppercase tracking-widest transition ${
                  activeTab === tab
                    ? "text-indigo-400 border-b-2 border-indigo-500"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}

          </div>


          {/* Feed Content */}

          <div className="space-y-8">

            {activeTab === "projects" ? (
              projects.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
                  <Rocket className="mx-auto mb-4 opacity-40"/>
                  <p className="text-gray-500 text-sm">No projects published</p>
                </div>
              ) : (
                projects.map(p => (
                  <ProjectCard key={p._id} project={p} showOwnerActions />
                ))
              )
            ) : (
              blogs.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl">
                  <Terminal className="mx-auto mb-4 opacity-40"/>
                  <p className="text-gray-500 text-sm">No blogs published</p>
                </div>
              ) : (
                blogs.map(b => (
                  <BlogCard key={b._id} blog={b} showOwnerActions />
                ))
              )
            )}

          </div>

        </div>

      </div>


      {/* Toast */}

      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-800 shadow-lg">
          {toast}
        </div>
      )}

    </div>
  );
};

export default UserProfile;