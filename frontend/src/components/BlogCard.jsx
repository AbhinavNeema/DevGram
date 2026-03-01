import React, { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions";
import MentionInput from "../components/MentionInput";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Trash2,
  Hash
} from "lucide-react";

const safeGetUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || null;
  } catch {
    return null;
  }
};

const BlogCard = ({ blog, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const userId = safeGetUserId();

  const isOwner =
    blog.author?._id === userId || blog.author === userId;

  const content = blog.content || "";

  const [likesCount, setLikesCount] = useState(blog.likes?.length || 0);
  const [liked, setLiked] = useState(blog.likes?.includes(userId) || false);
  const [comments, setComments] = useState(blog.comments || []);
  const [text, setText] = useState("");
  const [views, setViews] = useState(blog.views || 0);
  const [expanded, setExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [commentMentions, setCommentMentions] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/blog/${blog._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addView = async () => {
    if (viewed) return;
    try {
      const res = await api.post(`/blogs/${blog._id}/view`);
      setViews(res.data.views);
      setViewed(true);
    } catch {}
  };

  const handleLike = async () => {
    addView();
    const res = await api.put(`/blogs/${blog._id}/like`);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
  };

  const addComment = async () => {
    if (!text.trim()) return;
    const res = await api.post(`/blogs/${blog._id}/comments`, {
      text,
      mentions: commentMentions.map((u) => u._id)
    });
    setComments((prev) => [...prev, res.data]);
    setText("");
    setCommentMentions([]);
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/blogs/${blog._id}/comments/${commentId}`);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const deleteBlog = async () => {
    if (!window.confirm("Delete this blog?")) return;
    await api.delete(`/blogs/${blog._id}`);
    window.location.reload();
  };

  return (
    <article className="group bg-white rounded-3xl mb-8 overflow-hidden transition-shadow duration-500 border border-gray-100 shadow-sm hover:shadow-2xl">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-pink-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-extrabold text-white text-lg shadow-md ring-4 ring-indigo-50">
            {blog.author?.name?.[0] || "U"}
          </div>

          <div>
            <Link
              to={`/user/${blog.author?._id}`}
              className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight"
            >
              {blog.author?.name}
            </Link>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Blog · {timeAgo(blog.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-700 hover:bg-gray-50 border"
            }`}
          >
            {copied ? "Copied" : <><Share2 className="w-4 h-4" /> Share</>}
          </button>

          {isOwner && showOwnerActions && (
            <button
              onClick={deleteBlog}
              className="p-2 text-slate-600 hover:text-rose-600 transition-colors rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* CONTENT */}
      <div className="px-6 py-6">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
          {blog.title}
        </h3>

        <div className="text-[15px] text-slate-700 font-medium leading-relaxed mb-4">
          {expanded || content.length <= 180
            ? renderMentions(content, blog.mentions)
            : renderMentions(content.slice(0, 180) + "...", blog.mentions)}

          {content.length > 180 && (
            <button
              onClick={() => {
                setExpanded(!expanded);
                addView();
              }}
              className="ml-2 text-indigo-600 font-semibold hover:underline"
            >
              {expanded ? "Collapse" : "Read more"}
            </button>
          )}
        </div>

        {/* TAGS */}
        <div className="flex gap-2 flex-wrap mb-6">
          {(blog.techStack || []).map((tag) => (
            <Link
              key={tag}
              to={`/?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-all"
            >
              <Hash className="w-3 h-3" />
              {tag}
            </Link>
          ))}
        </div>

        {/* ACTION BAR */}
        <div className="flex gap-6 items-center pt-4 border-t border-gray-100 text-slate-600">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 font-semibold text-sm ${
              liked ? "text-rose-600" : "hover:text-rose-500"
            }`}
          >
            <Heart className="w-5 h-5" />
            {likesCount}
          </button>

          <div className="flex items-center gap-2 font-semibold text-sm">
            <MessageCircle className="w-5 h-5 text-slate-500" />
            {comments.length}
          </div>

          <div className="flex items-center gap-2 font-semibold text-sm">
            <Eye className="w-5 h-5 text-slate-500" />
            {views}
          </div>
        </div>
      </div>

      {/* COMMENTS (same as ProjectCard) */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
        <div className="max-h-36 overflow-y-auto mb-3">
          {(showAllComments ? comments : comments.slice(0, 1)).map((c) => (
            <div key={c._id} className="flex gap-3 items-start mb-2">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-extrabold text-indigo-700">
                {c.author?.name?.[0] || "U"}
              </div>

              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {c.author?.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>

                  {String(c.author?._id) === String(userId) && (
                    <button
                      onClick={() => deleteComment(c._id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-1 text-sm text-slate-700">
                  {renderMentions(c.text, c.mentions)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* COMMENT INPUT */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border border-gray-100 rounded-full px-3 py-1.5 bg-white focus-within:ring-1 focus-within:ring-indigo-100">
            <MentionInput
              value={text}
              onChange={setText}
              onMentionsChange={setCommentMentions}
              placeholder="Write comment..."
              rows={1}
            />
          </div>

          <button
            onClick={addComment}
            className="text-indigo-600 text-[13px] font-semibold hover:text-indigo-500"
          >
            Post
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;