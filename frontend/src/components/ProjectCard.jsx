import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions.jsx";
import MentionInput from "../components/MentionInput";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Code2,
  Github,
  Globe
} from "lucide-react";

const ProjectCard = ({ project, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = JSON.parse(atob(token.split(".")[1])).id;

  const isOwner = project.owner?._id === userId || project.owner === userId;
  const description = project.description || "";

  const [likesCount, setLikesCount] = useState(project.likes?.length || 0);
  const [liked, setLiked] = useState(project.likes?.includes(userId) || false);
  const [comments, setComments] = useState(project.comments || []);
  const [text, setText] = useState("");
  const [views, setViews] = useState(project.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);

  /* Same Logic Functions */
  const handleShare = () => {
    const url = `${window.location.origin}/project/${project._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/projects/${project._id}/view`);
      setViews(res.data.views);
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    const res = await api.put(`/projects/${project._id}/like`);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
  };

  const addComment = async () => {
    if (!text.trim()) return;
    const res = await api.post(`/projects/${project._id}/comments`, {
      text,
      mentions: commentMentions.map(u => u._id)
    });
    setComments([...comments, res.data]);
    setText("");
    setCommentMentions([]);
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/projects/${project._id}/comments/${commentId}`);
    setComments(comments.filter(c => c._id !== commentId));
  };

  const deleteProject = async () => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${project._id}`);
    window.location.reload();
  };

  return (
    <div className="group bg-[#0F111A] border border-white/10 rounded-[32px] mb-8 overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-5 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
            {project.owner?.name?.[0] || "U"}
          </div>

          <div>
            <Link to={`/user/${project.owner?._id}`} className="text-sm font-black text-white hover:text-indigo-400 transition-colors tracking-tight">
              {project.owner?.name}
            </Link>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Deployed · {timeAgo(project.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              copied ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {copied ? "Link Copied" : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>

          {isOwner && showOwnerActions && (
            <div className="flex gap-1 ml-2">
              <button onClick={() => navigate(`/projects/${project._id}/edit`)} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={deleteProject} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="px-6 py-6">
        <h3 className="text-2xl font-black text-white mb-3 tracking-tighter leading-tight">
          {project.title}
        </h3>

        <div className="text-[15px] text-slate-300 font-medium leading-relaxed mb-6">
          {expanded || description.length <= 180
            ? renderMentions(description, project.mentions)
            : renderMentions(description.slice(0, 180) + "...", project.mentions)}

          {description.length > 180 && (
            <button
              onClick={() => { setExpanded(!expanded); addView(); }}
              className="ml-2 text-indigo-400 font-black hover:text-indigo-300 underline underline-offset-4 decoration-2"
            >
              {expanded ? "Collapse" : "Expand Brief"}
            </button>
          )}
        </div>

        {/* 🚀 DEPLOYMENT LINKS (FIXED VISIBILITY) */}
        {(project.githubLink || project.liveDemoLink) && (
          <div className="flex flex-wrap gap-3 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
            {project.githubLink && (
              <a 
                href={project.githubLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1D26] hover:bg-[#252a3a] text-white rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            )}
            {project.liveDemoLink && (
              <a 
                href={project.liveDemoLink} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Globe className="w-4 h-4" />
                Live Terminal
              </a>
            )}
          </div>
        )}

        {/* IMAGE GRID */}
        {project.images?.length > 0 && (
          <div className={`grid gap-4 mb-6 ${project.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {project.images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-[24px] border border-white/5 cursor-zoom-in group/img"
                onClick={() => { addView(); setActiveImage(img.url); }}
              >
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/img:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <img
                  src={img.url}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                />
              </div>
            ))}
          </div>
        )}

        {/* TAGS */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(project.techStack || []).map(tag => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
            >
              <Code2 className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>

        {/* INTERACTION BAR */}
        <div className="flex gap-8 items-center pt-6 border-t border-white/5 text-slate-400">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 font-black text-xs transition-colors group/btn ${liked ? "text-rose-500" : "hover:text-rose-500"}`}
          >
            <Heart className={`w-5 h-5 transition-transform ${liked ? "fill-current scale-110 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "group-hover/btn:scale-110"}`} />
            {likesCount}
          </button>
          <div className="flex items-center gap-2 font-black text-xs">
            <MessageCircle className="w-5 h-5" />
            {comments.length}
          </div>
          <div className="flex items-center gap-2 font-black text-xs">
            <Eye className="w-5 h-5" />
            {views}
          </div>
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="bg-black/20 border-t border-white/5 p-6">
        {/* Comment list truncated for brevity - same as before */}
        <div className="space-y-4 mb-6">
           {/* ... (Comments rendering logic) */}
        </div>

        {/* INPUT */}
        <div className="flex gap-3">
          <div className="flex-1 bg-[#1A1D26] border border-white/10 rounded-2xl px-4 py-1 focus-within:border-indigo-500/50 transition-all">
            <MentionInput
              value={text}
              onChange={setText}
              onMentionsChange={setCommentMentions}
              placeholder="System log... @user"
              rows={1}
              className="py-3 text-sm text-white placeholder:text-slate-600 font-medium"
            />
          </div>
          <button
            onClick={addComment}
            className="px-6 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;