import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Loader2, X, Camera, User, Code2, Info, MapPin, Github } from "lucide-react";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/users/${id}`);
        const u = res.data.user;

        setName(u.name || "");
        setUsername(u.username || "");
        setBio(u.bio || "");
        setAbout(u.about || "");
        setTechStack(u.techStack || []);
        setPreview(u.profilePhoto || "");
        setLocation(u.location || "");
        setGithub(u.github || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        toast.error("Failed to load profile");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const addTech = () => {
    const tech = techInput.trim();
    if (!tech || techStack.includes(tech)) return;
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
      formData.append("location", location);
      formData.append("github", github);
      formData.append("techStack", JSON.stringify(techStack));

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      await api.put(`/users/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully!");
      navigate(`/user/${id}`);
    } catch (err) {
      console.error("Profile update failed", err);
      const message = err.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent animate-ping opacity-20" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <span className="text-sm text-slate-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
        {/* Gradient header */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-primary via-accent to-accent-2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative px-6 sm:px-8 pb-8 -mt-16">
          {/* Avatar */}
          <div className="flex items-end gap-6 mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white">
                {preview ? (
                  <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group-hover:scale-110">
                <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="pb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h2>
              <p className="text-slate-500">@{username}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bio */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary/70" />
                Bio
              </label>
              <input
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about yourself"
                maxLength={150}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{bio.length}/150</p>
            </div>

            {/* About */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary/70" />
                About
              </label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us more about yourself"
                rows={4}
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Location & GitHub */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Github className="w-4 h-4 text-slate-400" />
                  GitHub
                </label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary/70" />
                Tech Stack
                <span className="text-xs text-slate-400 font-normal">({techStack.length}/15)</span>
              </label>

              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary dark:from-primary/20 dark:to-accent/20 dark:text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/20"
                    >
                      {tech}
                      <button
                        onClick={() => removeTech(tech)}
                        className="hover:bg-primary/10 rounded-full p-0.5 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  placeholder="Add a technology (e.g., React)"
                  className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  onClick={addTech}
                  disabled={!techInput.trim() || techStack.length >= 15}
                  className="px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-primary via-accent to-accent-2 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;