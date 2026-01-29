import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import TAGS from "../constants/tags";
import MentionInput from "../components/MentionInput";
import { 
  Save, 
  ArrowLeft, 
  Cpu, 
  Code2, 
  Github, 
  ExternalLink, 
  X, 
  Loader2,
  Terminal
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

  const addTag = tag => {
    if (techStack.includes(tag)) return;
    if (techStack.length >= 8) return;
    setTechStack([...techStack, tag]);
    setTagSearch("");
  };

  const removeTag = tag => {
    setTechStack(techStack.filter(t => t !== tag));
  };

  const filteredTags = TAGS.filter(
    tag =>
      tag.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !techStack.includes(tag)
  );

  const saveChanges = async () => {
    if (!title || !description) return;
    setLoading(true);
    await api.put(`/projects/${id}`, {
      title,
      description,
      mentions: mentions.map(m => m._id),
      techStack,
      githubLink: github,
      liveDemoLink: demo,
    });
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0F111A] border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-white tracking-tighter">Edit Project</h2>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Update Repository</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* TITLE */}
        <div className="space-y-2 group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Project Identity</label>
          <input
            className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            placeholder="Project title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2 group">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Documentation</label>
          <div className="bg-[#161925] border-2 border-white/5 rounded-2xl focus-within:border-indigo-500/50 transition-all overflow-hidden">
            <MentionInput
              value={description}
              onChange={setDescription}
              onMentionsChange={setMentions}
              initialMentions={mentions}
              rows={5}
              className="bg-transparent"
            />
          </div>
        </div>

        {/* TECH STACK */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Architecture Control</label>
            <Cpu className="w-4 h-4 text-slate-700" />
          </div>

          <div className="flex flex-wrap gap-2">
            {techStack.map(tag => (
              <span
                key={tag}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in zoom-in"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-300 transition-colors">
                  <X className="w-3 h-3 stroke-[4px]" />
                </button>
              </span>
            ))}
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Code2 className="w-4 h-4" />
            </div>
            <input
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              placeholder="Search tech stack..."
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
            />

            {tagSearch && filteredTags.length > 0 && (
              <div className="absolute z-50 bg-[#1A1D26] border border-white/10 rounded-2xl mt-2 w-full max-h-48 overflow-y-auto p-2 shadow-2xl backdrop-blur-xl">
                {filteredTags.map(tag => (
                  <div
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-4 py-3 text-sm text-slate-300 hover:bg-indigo-600 hover:text-white rounded-xl cursor-pointer transition-all font-bold"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <Github className="w-4 h-4" />
            </div>
            <input
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-xs text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
              placeholder="GitHub link"
              value={github}
              onChange={e => setGithub(e.target.value)}
            />
          </div>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
              <ExternalLink className="w-4 h-4" />
            </div>
            <input
              className="w-full bg-[#161925] border-2 border-white/5 rounded-2xl pl-12 pr-5 py-4 text-xs text-white font-bold focus:border-indigo-500/50 outline-none transition-all"
              placeholder="Live demo link"
              value={demo}
              onChange={e => setDemo(e.target.value)}
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          disabled={loading}
          className="w-full relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Commit Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProject;