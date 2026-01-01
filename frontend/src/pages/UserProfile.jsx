import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";

const UserProfile = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
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

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 animate-pulse">
        <div className="bg-white border rounded-xl p-6 h-32" />
      </div>
    );
  }

  const { user, projects } = data;

  const isOwner = String(currentUserId) === String(user._id);

  const toggleFollow = async () => {
    try {
      const res = await api.put(`/users/${user._id}/follow`);

      setIsFollowing(res.data.following);

      setData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.followers,
        },
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const saveProfile = async () => {
    try {
      await api.put(`/users/${user._id}`, {
        bio,
        about,
        techStack: skills,
      });

      setData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          bio,
          about,
          techStack: skills,
        },
      }));

      setIsEditing(false);
    } catch (err) {
      console.error("Save profile failed:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">

      <div className="bg-white border rounded-xl p-6 flex gap-6 items-center">

        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-[#0a66c2]">
          {user.name?.[0]}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-[#191919]">
            {user.name}
          </h2>

          <p className="text-sm text-[#666] mt-1">
            @{user.username}
          </p>

          {!isEditing ? (
            <p className="text-sm text-gray-600 mt-2">
              {user.bio || "Add a bio"}
            </p>
          ) : (
            <input
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="border px-2 py-1 rounded text-sm w-full mt-2"
              placeholder="Short bio"
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
            className="text-sm text-[#0a66c2] hover:underline"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        ) : (
          <button
            onClick={toggleFollow}
            className={`px-4 py-1.5 rounded-full text-sm border ${
              isFollowing
                ? "text-gray-600 border-gray-300"
                : "text-[#0a66c2] border-[#0a66c2]"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

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

      <div className="mt-5 space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="text-sm font-medium text-[#191919]">
              No projects yet
            </p>

            {isOwner && (
              <button
                onClick={() => navigate("/create")}
                className="mt-3 text-sm text-[#0a66c2] hover:underline"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          projects.map(p => (
            <ProjectCard key={p._id} project={p} />
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;