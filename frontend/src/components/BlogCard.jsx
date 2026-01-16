import { useState } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/timeAgo";
import { renderMentions } from "../utils/renderMentions";

const BlogCard = ({ blog }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeImage, setActiveImage] = useState(null);

  const content = blog.content || "";

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
            Blog · {timeAgo(blog.createdAt)}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 mt-3">
        <h3 className="font-semibold text-lg">{blog.title}</h3>

        <p className="text-sm text-gray-700 mt-1">
          {expanded || content.length <= 220
            ? renderMentions(content, blog.mentions)
            : renderMentions(content.slice(0, 220) + "...", blog.mentions)}

          {content.length > 220 && (
            <button
              onClick={() => setExpanded(!expanded)}
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
              onClick={() => setActiveImage(img.url)}
            />
          ))}
        </div>
      )}

      {/* TECH STACK */}
      <div className="px-4 mt-3 flex gap-2 flex-wrap">
        {(blog.techStack || []).map(tag => (
          <span
            key={tag}
            className="text-xs text-blue-600"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* FOOTER (STATIC FOR NOW) */}
      <div className="px-4 mt-4 text-sm text-gray-500">
        📝 Blog post
      </div>

      {/* IMAGE MODAL */}
      {activeImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
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