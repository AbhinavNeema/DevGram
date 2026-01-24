import api from "../api/axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions.jsx";
import MentionInput from "../components/MentionInput";

const ProjectCard = ({ project, showOwnerActions = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = JSON.parse(atob(token.split(".")[1])).id;

  const isOwner =
    project.owner?._id === userId || project.owner === userId;

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
  <div className="bg-white border border-gray-200 rounded-xl mb-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-[2px]">
    
    {/* HEADER */}
    <div className="flex gap-3 px-5 pt-5">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-semibold text-white shadow">
        {project.owner?.name?.[0] || "U"}
      </div>

      <div className="flex-1">
        <Link
          to={`/user/${project.owner?._id}`}
          className="text-sm font-semibold hover:underline"
        >
          {project.owner?.name}
        </Link>
        <p className="text-xs text-gray-500">
          Posted · {timeAgo(project.createdAt)}
        </p>
      </div>

      <div className="text-xs flex items-center gap-4">
        <button
          onClick={handleShare}
          className="text-blue-600 hover:text-blue-700 transition font-medium"
        >
          {copied ? "Copied ✓" : "Share"}
        </button>

        {isOwner && showOwnerActions && (
          <>
            <button
              onClick={() => navigate(`/projects/${project._id}/edit`)}
              className="hover:text-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={deleteProject}
              className="text-red-500 hover:text-red-600 transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>

    {/* CONTENT */}
    <div className="px-5 mt-3">
      <h3 className="font-semibold text-base">{project.title}</h3>

      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
        {expanded || description.length <= 180
          ? renderMentions(description, project.mentions)
          : renderMentions(description.slice(0, 180) + "...", project.mentions)}

        {description.length > 180 && (
          <button
            onClick={() => {
              setExpanded(!expanded);
              addView();
            }}
            className="ml-1 text-blue-600 font-medium hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </p>
    </div>

    {/* IMAGES */}
    {project.images?.length > 0 && (
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        {project.images.map((img, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => {
              addView();
              setActiveImage(img.url);
            }}
          >
            <img
              src={img.url}
              className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    )}

    {/* TAGS */}
    <div className="px-5 mt-4 flex gap-2 flex-wrap">
      {(project.techStack || []).map(tag => (
        <Link
          key={tag}
          to={`/?tag=${encodeURIComponent(tag)}`}
          className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
        >
          #{tag}
        </Link>
      ))}
    </div>

    {/* ACTION BAR */}
    <div className="px-5 mt-4 flex gap-6 text-sm text-gray-600 border-t pt-3">
      <button
        onClick={handleLike}
        className="flex items-center gap-1 hover:text-red-500 transition"
      >
        ❤️ <span className={liked ? "font-semibold text-red-500" : ""}>{likesCount}</span>
      </button>
      <span className="flex items-center gap-1">💬 {comments.length}</span>
      <span className="flex items-center gap-1">👀 {views}</span>
    </div>

    {/* COMMENTS */}
    <div className="px-5 py-4 text-sm border-t bg-gray-50 rounded-b-xl">
      {!showAllComments && comments.length > 0 && (
        <>
          <div className="mb-1">
            <b>{comments[0].author?.name}</b>{" "}
            {renderMentions(comments[0].text, comments[0].mentions)}
          </div>
          {comments.length > 1 && (
            <button
              onClick={() => setShowAllComments(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              View all {comments.length} comments
            </button>
          )}
        </>
      )}

      {showAllComments &&
        comments.map(c => (
          <div key={c._id} className="flex justify-between py-1">
            <span>
              <b>{c.author?.name}</b>{" "}
              {renderMentions(c.text, c.mentions)}
            </span>
            {String(c.author?._id) === String(userId) && (
              <button
                onClick={() => deleteComment(c._id)}
                className="text-red-500 text-xs hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}

      {/* COMMENT INPUT */}
      <div className="flex gap-2 mt-3">
  <MentionInput
    value={text}
    onChange={setText}
    onMentionsChange={setCommentMentions}
    placeholder="Add a comment… @username"
    rows={1}
    className="py-2 text-sm"
  />
  <button
    onClick={addComment}
    className="px-4 h-9 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
  >
    Post
  </button>
</div>


    </div>

    {/* IMAGE MODAL */}
    {activeImage && (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setActiveImage(null)}
      >
        <img
          src={activeImage}
          className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
        />
      </div>
    )}
  </div>
);
};

export default ProjectCard;