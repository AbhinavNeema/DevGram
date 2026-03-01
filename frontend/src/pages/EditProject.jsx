import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
import {
  ArrowLeft,
  Save,
  Github,
  ExternalLink,
  X,
  Loader2
} from "lucide-react";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mentions, setMentions] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const res = await api.get(`/projects/${id}`);
      const p = res.data;

      setTitle(p.title);
      setDescription(p.description);
      setMentions(p.mentions || []);
      setTechStack(p.techStack || []);
      setGithub(p.githubLink || "");
      setDemo(p.liveDemoLink || "");
    };

    fetchProject();
  }, [id]);

  const addTag = (tag) => {
    if (techStack.includes(tag)) return;
    if (techStack.length >= 8) return;

    setTechStack([...techStack, tag]);
    setTagSearch("");
  };

  const removeTag = (tag) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const filteredTags = TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !techStack.includes(tag)
  );

  const saveChanges = async () => {
    if (!title || !description) return;

    setLoading(true);

    await api.put(`/projects/${id}`, {
      title,
      description,
      mentions: mentions.map((m) => m._id),
      techStack,
      githubLink: github,
      liveDemoLink: demo
    });

    setLoading(false);
    navigate("/");
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
          Edit Project
        </h2>
      </div>

      <div className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Project Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter project title"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Description
          </label>

          <div className="border border-gray-200 rounded-xl">
            <MentionInput
              value={description}
              onChange={setDescription}
              onMentionsChange={setMentions}
              rows={5}
            />
          </div>
        </div>

        {/* TECH STACK */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">
            Tech Stack
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {techStack.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
              >
                {tag}

                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <input
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder="Search technology..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm"
          />

          {tagSearch && (
            <div className="border border-gray-100 rounded-xl mt-2 bg-white shadow">
              {filteredTags.slice(0, 6).map((tag) => (
                <div
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LINKS */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Github className="w-4 h-4 text-slate-500" />
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub repository"
              className="flex-1 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <input
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              placeholder="Live demo"
              className="flex-1 outline-none text-sm"
            />
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={saveChanges}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default EditProject;