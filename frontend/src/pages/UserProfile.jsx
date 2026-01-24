import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import { useRef } from "react";

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  const startDM = async () => {
  try {
    const res = await api.get(`/messages/start/${user._id}`);
    console.log("Conversation:", res.data);
    navigate(`/dm/${res.data._id}`);
  } catch (err) {
    console.error("Failed to start DM", err);
  }
};
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

  try {
    if (token) {
      currentUserId = JSON.parse(atob(token.split(".")[1])).id;
    }
  } catch {}

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = username
          ? `/users/username/${username}`
          : `/users/${id}`;

        const res = await api.get(url);
        const u = res.data.user;

        setData(res.data);
        setBio(u.bio || "");
        setAbout(u.about || "");
        setSkills(u.techStack || []);

        if (currentUserId) {
          setIsFollowing(
            u.followers.some(f => String(f._id) === String(currentUserId))
          );
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [id, username, currentUserId]);

  /* ================= FETCH BLOGS (FIXED) ================= */
  useEffect(() => {
    if (activeTab !== "blogs" || !data?.user?._id) return;

    api
      .get(`/blogs/user/${data.user._id}`)
      .then(res => setBlogs(res.data))
      .catch(err => console.error("Blogs fetch error:", err));
  }, [activeTab, data]);

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 animate-pulse">
        <div className="bg-white border rounded-xl p-6 h-32" />
      </div>
    );
  }

  const { user, projects } = data;
  const isOwner = String(currentUserId) === String(user._id);

  /* ================= FOLLOW ================= */
  const toggleFollow = async () => {
    const res = await api.put(`/users/${user._id}/follow`);
    setIsFollowing(res.data.following);

    setData(prev => ({
      ...prev,
      user: { ...prev.user, followers: res.data.followers },
    }));
  };

  /* ================= SKILLS ================= */
  const addSkill = e => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = skill =>
    setSkills(skills.filter(s => s !== skill));

  /* ================= SAVE PROFILE ================= */
  const saveProfile = async () => {
    await api.put(`/users/${user._id}`, {
      bio,
      about,
      techStack: skills,
    });

    setData(prev => ({
      ...prev,
      user: { ...prev.user, bio, about, techStack: skills },
    }));

    setIsEditing(false);
  };

  return (
  <div className="max-w-5xl mx-auto px-4 pb-20">

    {/* ================= PROFILE CARD ================= */}
    <div className="bg-white border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center
                    shadow-sm hover:shadow-md transition-all">

      {/* Avatar */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                        flex items-center justify-center text-2xl font-bold text-white shadow">
          {user.name?.[0]}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 w-full">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
          <span className="text-sm text-gray-500">@{user.username}</span>
        </div>

        {!isEditing ? (
          <p className="text-sm mt-2 text-gray-700">
            {user.bio || <span className="text-gray-400">Add a bio</span>}
          </p>
        ) : (
          <input
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm w-full mt-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="flex gap-6 mt-4 text-sm text-gray-600">
          <span><b className="text-gray-900">{user.followers.length}</b> followers</span>
          <span><b className="text-gray-900">{user.following.length}</b> following</span>
          <span><b className="text-gray-900">{projects.length}</b> projects</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={async () => {
            const link = `${window.location.origin}/user/${user._id}`;
            await navigator.clipboard.writeText(link);
            setToast("Profile link copied!");
            clearTimeout(toastTimeout.current);
            toastTimeout.current = setTimeout(() => setToast(""), 1500);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Share
        </button>

        {isOwner ? (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        ) : (
          <button
            onClick={toggleFollow}
            className={`px-4 py-1 rounded-full text-sm border transition
              ${isFollowing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}

        {!isOwner && (
          <button
            onClick={() => startDM(user._id)}
            className="border px-4 py-1 rounded-full text-sm
                       hover:bg-gray-100 transition"
          >
            Message
          </button>
        )}
      </div>
    </div>

    {/* ================= ABOUT ================= */}
    <div className="bg-white border rounded-2xl p-6 mt-6 shadow-sm">
      <h3 className="font-semibold mb-2 text-gray-900">About</h3>

      {!isEditing ? (
        <p className="text-sm text-gray-700">
          {user.about || <span className="text-gray-400">Add something about yourself</span>}
        </p>
      ) : (
        <textarea
          value={about}
          onChange={e => setAbout(e.target.value)}
          className="border rounded-lg w-full p-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      )}
    </div>

    {/* ================= SKILLS ================= */}
    <div className="bg-white border rounded-2xl p-6 mt-6 shadow-sm">
      <h3 className="font-semibold mb-3 text-gray-900">Skills</h3>

      {!isEditing ? (
        <div className="flex flex-wrap gap-2">
          {skills.length ? skills.map(skill => (
            <span
              key={skill}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          )) : (
            <p className="text-sm text-gray-400">No skills added</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(skill => (
              <span
                key={skill}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <input
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={addSkill}
            placeholder="Type a skill and press Enter"
            className="border px-3 py-2 rounded-lg w-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </>
      )}
    </div>

    {isEditing && (
      <div className="mt-5 flex justify-end">
        <button
          onClick={saveProfile}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm
                     hover:bg-blue-700 transition shadow"
        >
          Save Changes
        </button>
      </div>
    )}

    {/* ================= TABS ================= */}
    <div className="flex gap-8 border-b mt-8 text-sm font-medium">
      {["projects", "blogs"].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-3 transition relative
            ${activeTab === tab
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"}`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
          {activeTab === tab && (
            <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-blue-600 rounded" />
          )}
        </button>
      ))}
    </div>

    {/* ================= TAB CONTENT ================= */}
    <div className="mt-6 space-y-4">
      {activeTab === "projects" && (
        projects.length === 0 ? (
          <p className="text-sm text-gray-400">No projects yet</p>
        ) : (
          projects.map(p => (
            <ProjectCard key={p._id} project={p} showOwnerActions />
          ))
        )
      )}

      {activeTab === "blogs" && (
        blogs.length === 0 ? (
          <p className="text-sm text-gray-400">No blogs written yet</p>
        ) : (
          blogs.map(b => (
            <BlogCard key={b._id} blog={b} showOwnerActions />
          ))
        )
      )}
    </div>

    {/* ================= TOAST ================= */}
    {toast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2
                      bg-black text-white px-4 py-2 rounded-full text-sm
                      shadow-lg animate-fadeIn z-50">
        {toast}
      </div>
    )}
  </div>
);

};

export default UserProfile;