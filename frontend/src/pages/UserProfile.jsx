import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import { 
  User, 
  Settings, 
  MessageSquare, 
  Share2, 
  Rocket, 
  Terminal, 
  Cpu, 
  Check, 
  X,
  Plus,
  ShieldCheck
} from "lucide-react";

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState("projects");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [toast, setToast] = useState("");
  const toastTimeout = useRef(null);

  const token = localStorage.getItem("token");
  let currentUserId = null;
  try { if (token) currentUserId = JSON.parse(atob(token.split(".")[1])).id; } catch {}

  const startDM = async () => {
    try {
      const res = await api.get(`/messages/start/${data.user._id}`);
      navigate(`/dm/${res.data._id}`);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = username ? `/users/username/${username}` : `/users/${id}`;
        const res = await api.get(url);
        const u = res.data.user;
        setData(res.data);
        setBio(u.bio || "");
        setAbout(u.about || "");
        setSkills(u.techStack || []);
        if (currentUserId) setIsFollowing(u.followers.some(f => String(f._id) === String(currentUserId)));
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, [id, username, currentUserId]);

  useEffect(() => {
    if (activeTab !== "blogs" || !data?.user?._id) return;
    api.get(`/blogs/user/${data.user._id}`).then(res => setBlogs(res.data));
  }, [activeTab, data]);

  const toggleFollow = async () => {
    const res = await api.put(`/users/${data.user._id}/follow`);
    setIsFollowing(res.data.following);
    setData(prev => ({ ...prev, user: { ...prev.user, followers: res.data.followers } }));
  };

  const saveProfile = async () => {
    await api.put(`/users/${data.user._id}`, { bio, about, techStack: skills });
    setData(prev => ({ ...prev, user: { ...prev.user, bio, about, techStack: skills } }));
    setIsEditing(false);
  };

  if (!data) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Profile Data...</p>
    </div>
  );

  const { user, projects } = data;
  const isOwner = String(currentUserId) === String(user._id);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 pt-10">
      
      {/* ================= IDENTITY MODULE (PROFILE CARD) ================= */}
      <div className="bg-[#0F111A] border border-white/10 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative w-28 h-28 rounded-[2rem] bg-[#161925] border-2 border-white/10 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {user.name?.[0].toUpperCase()}
            </div>
          </div>

          {/* Info Block */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white tracking-tighter">{user.name}</h2>
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  @{user.username}
                </div>
              </div>
              
              {!isEditing ? (
                <p className="text-slate-400 font-bold mt-2 text-sm max-w-lg">
                  {user.bio || "Identity verified. No bio data transmitted."}
                </p>
              ) : (
                <input
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-indigo-500 outline-none transition-all mt-3"
                  placeholder="Update system bio..."
                />
              )}
            </div>

            <div className="flex gap-8 items-center pt-2">
              <div className="text-center md:text-left">
                <p className="text-xl font-black text-white">{user.followers.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Followers</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xl font-black text-white">{user.following.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Following</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-xl font-black text-white">{projects.length}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployments</p>
              </div>
            </div>
          </div>

          {/* Action Systems */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setToast("Link Copied");
                setTimeout(() => setToast(""), 2000);
              }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"
              title="Share Profile"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* OWNER ONLY ACTIONS */}
            {isOwner && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {isEditing ? <><X className="w-4 h-4"/> Abort</> : <><Settings className="w-4 h-4"/> Configure</>}
              </button>
            )}

            {/* VISITOR ONLY ACTIONS */}
            {!isOwner && (
              <>
                <button
                  onClick={toggleFollow}
                  className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                    isFollowing ? "bg-white/5 border border-white/10 text-slate-400" : "bg-indigo-600 text-white shadow-indigo-600/20"
                  }`}
                >
                  {isFollowing ? "Unlink" : "Follow"}
                </button>
                <button
                  onClick={startDM}
                  className="p-3 bg-[#1A1D26] border border-white/10 rounded-2xl text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all"
                  title="Direct Message"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* ================= LEFT COLUMN: META DATA ================= */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-[#0F111A] border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Documentation</h3>
            </div>
            {!isEditing ? (
              <p className="text-sm font-medium text-slate-400 leading-relaxed">
                {user.about || "Operator has not provided detailed documentation."}
              </p>
            ) : (
              <textarea
                value={about}
                onChange={e => setAbout(e.target.value)}
                className="w-full bg-black/40 border-2 border-white/5 rounded-xl p-4 text-sm text-white font-medium focus:border-indigo-500 outline-none resize-none transition-all"
                rows={6}
              />
            )}
          </section>

          <section className="bg-[#0F111A] border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Tech Stack</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {skills.map(skill => (
                <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  {skill}
                  {isEditing && (
                    <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="text-rose-500 hover:text-rose-400">
                      <X className="w-3 h-3 stroke-[4px]" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="relative group">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && skillInput.trim()) {
                      e.preventDefault();
                      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
                      setSkillInput("");
                    }
                  }}
                  placeholder="Add technology..."
                  className="w-full bg-black/40 border-2 border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white font-bold outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            )}
          </section>

          {isEditing && (
            <button
              onClick={saveProfile}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              Commit Changes
            </button>
          )}
        </div>

        {/* ================= RIGHT COLUMN: CONTENT FEED ================= */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex gap-1 bg-[#0F111A] p-1.5 rounded-2xl border border-white/10 w-fit">
            {["projects", "blogs"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === "projects" ? (
              projects.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                   <Rocket className="w-10 h-10 text-slate-700 mx-auto mb-4 opacity-20" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No project logs found</p>
                </div>
              ) : (
                projects.map(p => <ProjectCard key={p._id} project={p} showOwnerActions />)
              )
            ) : (
              blogs.length === 0 ? (
                <div className="py-20 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                   <Terminal className="w-10 h-10 text-slate-700 mx-auto mb-4 opacity-20" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No intelligence reports found</p>
                </div>
              ) : (
                blogs.map(b => <BlogCard key={b._id} blog={b} showOwnerActions />)
              )
            )}
          </div>
        </div>
      </div>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-[#161925] border border-white/10 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default UserProfile;