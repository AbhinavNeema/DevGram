import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import TAGS from "../constants/tags";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [techStack, setTechStack] = useState([]);
  const [tagSearch, setTagSearch] = useState("");

  const [github, setGithub] = useState("");
  const [demo, setDemo] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data;

        setTitle(p.title);
        setDescription(p.description);
        setTechStack(p.techStack || []);
        setGithub(p.githubLink || "");
        setDemo(p.liveDemoLink || "");
      } catch (err) {
        console.error("Fetch project error", err);
      }
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
    setTechStack(techStack.filter(t => t !== tag));
  };

  const filteredTags = TAGS.filter(tag =>
    tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !techStack.includes(tag)
  );

const saveChanges = async () => {
    if (!title || !description) {
      return alert("Title & description required");
    }

    setLoading(true);
    try {
      await api.put(`/projects/${id}`, {
        title,
        description,
        techStack,
        githubLink: github,
        liveDemoLink: demo,
      });

      navigate("/");
    } catch (err) {
      console.error("Update project failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Project</h2>

      <input
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        placeholder="Project title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        placeholder="Describe your project"
        rows={4}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="mb-4 relative">
        <label className="text-sm font-medium text-gray-700">
          Tech Stack (max 8)
        </label>

        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map(tag => (
            <span
              key={tag}
              className="bg-[#eef3f8] px-3 py-1 rounded-full text-xs flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          value={tagSearch}
          onChange={e => setTagSearch(e.target.value)}
          placeholder="Search tech (React, ML, Docker...)"
          className="w-full border rounded-md px-3 py-2 mt-2 text-sm"
        />

        {tagSearch && filteredTags.length > 0 && (
          <div className="absolute z-10 bg-white border rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow">
            {filteredTags.map(tag => (
              <div
                key={tag}
                onClick={() => addTag(tag)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        className="w-full border rounded-md px-3 py-2 mb-3 text-sm"
        placeholder="GitHub link"
        value={github}
        onChange={e => setGithub(e.target.value)}
      />

      <input
        className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
        placeholder="Live demo link"
        value={demo}
        onChange={e => setDemo(e.target.value)}
      />

      <button
        onClick={saveChanges}
        disabled={loading}
        className="w-full bg-[#0a66c2] text-white py-2 rounded-md"
      >
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
};

export default EditProject;