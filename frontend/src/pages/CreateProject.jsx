import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
import {
  Rocket,
  BookOpen,
  Code2,
  Image as ImageIcon,
  Github,
  ExternalLink,
  X,
  Plus,
  Loader2
} from "lucide-react";

const CreateProject = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState("project");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const submit = async () => {
    if (!title || !content) return;

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("mentions", JSON.stringify(mentions.map((m) => m._id)));
      formData.append("techStack", JSON.stringify(techStack));

      if (mode === "project") {
        formData.append("description", content);
        if (github) formData.append("githubLink", github);
        if (demo) formData.append("liveDemoLink", demo);
      } else {
        formData.append("content", content);
      }

      images.forEach((img) => formData.append("images", img));

      await api.post(mode === "project" ? "/projects" : "/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-lg">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "project" ? "Create Project" : "Write Blog"}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === "project"
              ? "Share your latest build"
              : "Share knowledge with the community"}
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode("project")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "project"
                ? "bg-indigo-600 text-white"
                : "text-slate-600"
            }`}
          >
            <Rocket className="w-4 h-4" />
            Project
          </button>

          <button
            onClick={() => setMode("blog")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              mode === "blog"
                ? "bg-indigo-600 text-white"
                : "text-slate-600"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Blog
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* CONTENT */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">
            Description
          </label>

          <div className="border border-gray-200 rounded-xl">
            <MentionInput
              value={content}
              onChange={setContent}
              onMentionsChange={setMentions}
              placeholder="Write something..."
              rows={mode === "project" ? 5 : 8}
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
            placeholder="Search technologies..."
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

        {/* IMAGE UPLOAD */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <ImageIcon className="w-4 h-4" />
            Images
          </label>

          <input type="file" multiple onChange={handleImages} />

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="rounded-lg object-cover w-full h-24"
                />
              ))}
            </div>
          )}
        </div>

        {/* PROJECT LINKS */}
        {mode === "project" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub link"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
            />

            <input
              value={demo}
              onChange={(e) => setDemo(e.target.value)}
              placeholder="Live demo link"
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm"
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === "project" ? "Create Project" : "Publish Blog"}
              <Plus className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default CreateProject;