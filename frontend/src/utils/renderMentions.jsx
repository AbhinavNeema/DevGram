import { Link } from "react-router-dom";

export const renderMentions = (text) => {
  if (!text) return null;

  return text.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link
          key={i}
          to={`/user/username/${username}`}
          className="text-[#0a66c2] font-medium hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
};