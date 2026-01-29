import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions";
import MentionInput from "../components/MentionInput";
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  Share2, 
  Trash2, 
  Hash, 
  MoreHorizontal, 
  ChevronRight 
} from "lucide-react";

const BlogCard = ({ blog, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const authorId = typeof blog.author === "string" ? blog.author : blog.author?._id;
  const isOwner = String(authorId) === String(userId);
  const content = blog.content || "";

  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [liked, setLiked] = useState(blog.likes?.includes(userId) || false);
  const [comments, setComments] = useState(blog.comments || []);
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState(blog.views || 0);
  const [viewed, setViewed] = useState(false);

  const handleShare = async () => {
    const link = `${window.location.origin}/blog/${blog._id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) { console.error("Copy failed", err); }
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/blogs/${blog._id}/view`);
      setViews(res.data.views);
      setViewed(true);
    } catch (err) {}
  };

  const handleLike = async () => {
    await addView();
    const res = await api.put(`/blogs/${blog._id}/like`);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
  };

  const addComment = async () => {
    if (!text.trim()) return;
    const res = await api.post(`/blogs/${blog._id}/comments`, {
      text,
      mentions: commentMentions.map(u => u._id),
    });
    setComments([...comments, res.data]);
    setText("");
    setCommentMentions([]);
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/blogs/${blog._id}/comments/${commentId}`);
    setComments(comments.filter(c => c._id !== commentId));
  };

  const deleteBlog = async () => {
    if (!window.confirm("Delete this blog?")) return;
    await api.delete(`/blogs/${blog._id}`);
    window.location.reload();
  };

  return (
    <div className="group bg-[#0F111A] border border-white/10 rounded-[32px] mb-8 overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 px-6 py-5 bg-white/[0.02] border-b border-white/5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
          {blog.author?.name?.[0] || "U"}
        </div>

        <div className="flex-1">
          <Link
            to={`/user/${blog.author?._id}`}
            className="text-sm font-black text-white hover:text-indigo-400 transition-colors tracking-tight block"
          >
            {blog.author?.name}
          </Link>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Technical Insight · {timeAgo(blog.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              copied ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
            }`}
          >
            {copied ? "Copied" : <><Share2 className="w-3.5 h-3.5" /> Share</>}
          </button>

          {showOwnerActions && isOwner && (
            <button onClick={deleteBlog} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="px-8 py-6">
        <h3 className="text-2xl font-black text-white mb-4 tracking-tighter leading-tight">
          {blog.title}
        </h3>

        <div className="text-[15px] text-slate-300 font-medium leading-relaxed mb-6">
          {expanded || content.length <= 180
            ? renderMentions(content, blog.mentions)
            : renderMentions(content.slice(0, 180) + "...", blog.mentions)}

          {content.length > 180 && (
            <button
              onClick={() => { setExpanded(!expanded); addView(); }}
              className="ml-2 text-indigo-400 font-black hover:text-indigo-300 underline underline-offset-4 decoration-2"
            >
              {expanded ? "Collapse Brief" : "Read Full Log"}
            </button>
          )}
        </div>

        {/* IMAGE GRID */}
        {blog.images?.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {blog.images.map((img, i) => (
              <div 
                key={i} 
                className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group/img cursor-zoom-in"
                onClick={() => { addView(); setActiveImage(img.url); }}
              >
                <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Blog attachment" />
              </div>
            ))}
          </div>
        )}

        {/* TAGS */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(blog.techStack || []).map(tag => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
            >
              <Hash className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>

        {/* INTERACTION ACTION BAR */}
        <div className="flex gap-10 items-center pt-6 border-t border-white/5 text-slate-400">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 font-black text-xs transition-all group/btn ${liked ? "text-rose-500" : "hover:text-rose-500"}`}
          >
            <Heart className={`w-5 h-5 transition-transform ${liked ? "fill-current scale-110 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "group-hover/btn:scale-110"}`} />
            {likesCount}
          </button>
          <div className="flex items-center gap-2 font-black text-xs">
            <MessageSquare className="w-5 h-5" />
            {comments.length}
          </div>
          <div className="flex items-center gap-2 font-black text-xs">
            <Eye className="w-5 h-5" />
            {views}
          </div>
        </div>
      </div>

      {/* COMMENTS LOG SECTION */}
      <div className="bg-black/20 border-t border-white/5 p-6 sm:p-8">
        <div className="space-y-4 mb-6">
          {!showAllComments && comments.length > 0 && (
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-medium text-slate-300">
                <span className="font-black text-indigo-400 mr-2 uppercase tracking-tighter">{comments[0].author?.name}</span>
                {renderMentions(comments[0].text, comments[0].mentions)}
              </div>
              {comments.length > 1 && (
                <button
                  onClick={() => setShowAllComments(true)}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                >
                  View Feed <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {showAllComments &&
            comments.map(c => (
              <div key={c._id} className="flex items-start justify-between group/comm py-1 animate-in fade-in duration-300">
                <div className="text-sm font-medium text-slate-300">
                   <span className="font-black text-indigo-400 mr-2 uppercase tracking-tighter">{c.author?.name}</span>
                   {renderMentions(c.text, c.mentions)}
                </div>
                {String(c.author?._id) === String(userId) && (
                  <button onClick={() => deleteComment(c._id)} className="opacity-0 group-hover/comm:opacity-100 text-rose-500 transition-opacity p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
        </div>

        {/* INPUT: Midnight Control Style */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 bg-[#1A1D26] border border-white/10 rounded-2xl px-4 py-1.5 focus-within:border-indigo-500/50 transition-all shadow-inner">
            <MentionInput
              value={text}
              onChange={setText}
              onMentionsChange={setCommentMentions}
              placeholder="System log... @user"
              rows={2}
              className="py-2 text-sm text-white placeholder:text-slate-600 font-medium"
            />
          </div>
          <button
            onClick={addComment}
            className="px-8 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-1"
          >
            Post
          </button>
        </div>
      </div>

      {/* FULL-SCREEN MODAL */}
      {activeImage && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            className="max-w-full max-h-full rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.3)] object-contain"
            alt="Expanded view"
          />
        </div>
      )}
    </div>
  );
};

export default BlogCard;