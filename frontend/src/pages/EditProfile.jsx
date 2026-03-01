import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft, Save, Loader2, X, Camera } from "lucide-react";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [about, setAbout] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        const u = res.data.user;

        setName(u.name || "");
        setUsername(u.username || "");
        setBio(u.bio || "");
        setAbout(u.about || "");
        setTechStack(u.techStack || []);
        setPreview(u.profilePhoto || "");
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    loadProfile();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const addTech = () => {
    const tech = techInput.trim();

    if (!tech) return;
    if (techStack.includes(tech)) return;

    setTechStack([...techStack, tech]);
    setTechInput("");
  };

  const removeTech = (tech) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("bio", bio);
      formData.append("about", about);
      formData.append("techStack", JSON.stringify(techStack));

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      await api.put(`/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/user/${id}`);
    } catch (err) {
      console.error("Profile update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-lg">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h2 className="text-xl font-bold text-slate-900">
          Edit Profile
        </h2>
      </div>

      <div className="space-y-6">

        {/* PROFILE PHOTO */}
        <div className="flex flex-col items-center gap-4">

          <div className="relative">

            <img
              src={
                preview
                  ? preview.startsWith("blob:")
                    ? preview
                    : `${import.meta.env.VITE_BACKEND_URL || ""}${preview}`
                  : `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`
              }
              alt="profile"
              className="w-28 h-28 rounded-full object-cover border border-gray-200"
            />

            <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer shadow hover:bg-indigo-500 transition">

              <Camera className="w-4 h-4 text-white" />

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

            </label>

          </div>

        </div>

        {/* NAME (NOT EDITABLE) */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Name
          </label>

          <input
            value={name}
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500"
          />
        </div>

        {/* USERNAME (NOT EDITABLE) */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Username
          </label>

          <input
            value={username}
            disabled
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500"
          />
        </div>

        {/* BIO */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Bio
          </label>

          <input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Short bio"
          />
        </div>

        {/* ABOUT */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            About
          </label>

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Tell people about yourself"
          />
        </div>

        {/* TECH STACK */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Tech Stack
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
              >
                {tech}

                <button onClick={() => removeTech(tech)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Add technology"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />

            <button
              onClick={addTech}
              className="bg-indigo-600 text-white px-4 rounded-xl text-sm hover:bg-indigo-500 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveProfile}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default EditProfile;