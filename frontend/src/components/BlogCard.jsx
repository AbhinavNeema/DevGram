import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions";
import MentionInput from "../components/MentionInput";

const BlogCard = ({ blog, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  const authorId =
  typeof blog.author === "string"
    ? blog.author
    : blog.author?._id;

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
  } catch (err) {
    console.error("Copy failed", err);
  }
};

const addView = async () => {
  if (viewed) return;
  try {
    const res = await api.post(`/blogs/${blog._id}/view`);
    setViews(res.data.views);
    setViewed(true);
  } catch (err) {}
};
  /* ================= LIKE ================= */
  const handleLike = async () => {
    await addView();
    const res = await api.put(`/blogs/${blog._id}/like`);
    setLiked(res.data.liked);
    setLikesCount(res.data.likesCount);
  };

  /* ================= COMMENT ================= */
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

  /* ================= DELETE BLOG ================= */
  const deleteBlog = async () => {
    if (!window.confirm("Delete this blog?")) return;
    await api.delete(`/blogs/${blog._id}`);
    window.location.reload();
  };

  return (
  <div className="bg-white border rounded-lg mb-5">
    {/* HEADER */}
    <div className="flex gap-3 px-4 pt-4">
      <div className="w-10 h-10 rounded-full bg-[#e7f3ff] flex items-center justify-center font-semibold text-[#0a66c2]">
        {blog.author?.name?.[0] || "U"}
      </div>

      <div className="flex-1">
        <Link
          to={`/user/${blog.author?._id}`}
          className="text-sm font-semibold hover:underline"
        >
          {blog.author?.name}
        </Link>
        <p className="text-xs text-gray-500">
          Posted · {timeAgo(blog.createdAt)}
        </p>
      </div>

      <div className="text-xs flex gap-3">
        {/* SHARE */}
        <button onClick={handleShare} className="text-blue-600">
          {copied ? "Copied!" : "Share"}
        </button>

        {/* OWNER ACTIONS */}
        {showOwnerActions && isOwner && (
          <button onClick={deleteBlog} className="text-red-500">
            Delete
          </button>
        )}
      </div>
    </div>

    {/* CONTENT */}
    <div className="px-4 mt-3">
      <h3 className="font-semibold">{blog.title}</h3>

      <p className="text-sm text-gray-700 mt-1">
        {expanded || content.length <= 180
          ? renderMentions(content, blog.mentions)
          : renderMentions(content.slice(0, 180) + "...", blog.mentions)}

        {content.length > 180 && (
          <button
            onClick={() => {
              setExpanded(!expanded);
              addView();
            }}
            className="ml-1 text-blue-600 font-medium"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </p>
    </div>

    {/* IMAGES */}
    {blog.images?.length > 0 && (
      <div className="px-4 mt-3 grid grid-cols-2 gap-2">
        {blog.images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            className="h-48 w-full object-cover rounded cursor-pointer"
            onClick={() => {
              addView();
              setActiveImage(img.url);
            }}
          />
        ))}
      </div>
    )}

    {/* TAGS */}
    <div className="px-4 mt-3 flex gap-2 flex-wrap">
      {(blog.techStack || []).map(tag => (
        <Link
          key={tag}
          to={`/?tag=${encodeURIComponent(tag)}`}
          className="text-xs text-blue-600 hover:underline"
        >
          #{tag}
        </Link>
      ))}
    </div>

    {/* ACTION BAR */}
    <div className="px-4 mt-4 flex gap-6 text-sm text-gray-600">
      <button onClick={handleLike}>❤️ {likesCount}</button>
      <span>💬 {comments.length}</span>
      <span>👀 {views}</span>
    </div>

    {/* COMMENTS */}
    <div className="border-t px-4 py-3 text-sm">
      {!showAllComments && comments.length > 0 && (
        <>
          <div>
            <b>{comments[0].author?.name}</b>{" "}
            {renderMentions(comments[0].text, comments[0].mentions)}
          </div>
          {comments.length > 1 && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-xs text-blue-600"
            >
              View all {comments.length} comments
            </button>
          )}
        </>
      )}

      {showAllComments &&
        comments.map(c => (
          <div key={c._id} className="flex justify-between">
            <span>
              <b>{c.author?.name}</b>{" "}
              {renderMentions(c.text, c.mentions)}
            </span>
            {String(c.author?._id) === String(userId) && (
              <button
                onClick={() => deleteComment(c._id)}
                className="text-red-500 text-xs"
              >
                Delete
              </button>
            )}
          </div>
        ))}

      <div className="flex gap-2 mt-3">
        <MentionInput
          value={text}
          onChange={setText}
          onMentionsChange={setCommentMentions}
          placeholder="Add a comment… @username"
          rows={2}
        />
        <button onClick={addComment} className="text-blue-600 font-medium">
          Post
        </button>
      </div>
    </div>

    {/* IMAGE MODAL */}
    {activeImage && (
      <div
        className="fixed inset-0 bg-black/80 flex items-center justify-center"
        onClick={() => setActiveImage(null)}
      >
        <img
          src={activeImage}
          className="max-w-[90%] max-h-[90%] rounded"
          alt=""
        />
      </div>
    )}
  </div>
);

};

export default BlogCard;