import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";

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
    <div className="max-w-5xl mx-auto px-4">

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white border rounded-xl p-6 flex gap-6 items-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-[#0a66c2]">
          {user.name?.[0]}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-500">@{user.username}</p>

          {!isEditing ? (
            <p className="text-sm mt-2">{user.bio || "Add a bio"}</p>
          ) : (
            <input
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="border px-2 py-1 rounded text-sm w-full mt-2"
            />
          )}

          <div className="flex gap-6 mt-3 text-sm text-gray-600">
            <span><b>{user.followers.length}</b> followers</span>
            <span><b>{user.following.length}</b> following</span>
            <span><b>{projects.length}</b> projects</span>
          </div>
        </div>

        {isOwner ? (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        ) : (
          <button
            onClick={toggleFollow}
            className="border px-4 py-1 rounded-full"
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {/* ================= ABOUT ================= */}
      <div className="bg-white border rounded-xl p-6 mt-5">
        <h3 className="font-semibold mb-2">About</h3>

        {!isEditing ? (
          <p className="text-sm text-gray-700">
            {user.about || "Add something about yourself"}
          </p>
        ) : (
          <textarea
            value={about}
            onChange={e => setAbout(e.target.value)}
            className="border rounded w-full p-2 text-sm"
            rows={4}
          />
        )}
      </div>

      {/* ================= SKILLS ================= */}
      <div className="bg-white border rounded-xl p-6 mt-5">
        <h3 className="font-semibold mb-3">Skills</h3>

        {!isEditing ? (
          <div className="flex flex-wrap gap-2">
            {skills.length ? skills.map(skill => (
              <span
                key={skill}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            )) : (
              <p className="text-sm text-gray-500">No skills added</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)}>×</button>
                </span>
              ))}
            </div>

            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Type a skill and press Enter"
              className="border px-3 py-1 rounded w-full text-sm"
            />
          </>
        )}
      </div>

      {isEditing && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={saveProfile}
            className="bg-[#0a66c2] text-white px-4 py-2 rounded text-sm"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* ================= TABS ================= */}
      <div className="flex gap-6 border-b mt-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("projects")}
          className={
            activeTab === "projects"
              ? "border-b-2 border-blue-600"
              : ""
          }
        >
          Projects
        </button>

        <button
          onClick={() => setActiveTab("blogs")}
          className={
            activeTab === "blogs"
              ? "border-b-2 border-blue-600"
              : ""
          }
        >
          Blogs
        </button>
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="mt-5 space-y-4">
        {activeTab === "projects" && (
          projects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects yet</p>
          ) : (
            projects.map(p => (
              <ProjectCard key={p._id} project={p} />
            ))
          )
        )}

        {activeTab === "blogs" && (
          blogs.length === 0 ? (
            <p className="text-sm text-gray-500">No blogs written yet</p>
          ) : (
            blogs.map(b => (
              <BlogCard key={b._id} blog={b} />
            ))
          )
        )}
      </div>
    </div>
  );
};

export default UserProfile;