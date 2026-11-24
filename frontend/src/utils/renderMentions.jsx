import { Link } from "react-router-dom";

export const renderMentions = (text, mentions = []) => {
  if (!text) return null;

  if (!mentions || !Array.isArray(mentions)) return text;

  const map = {};
  mentions.forEach(u => {
    if (!u || !u.username) return;
    map[u.username] = u._id;
  });

  return text.split(/(@[a-zA-Z0-9_.]+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      if (map[username]) {
        return (
          <Link
            key={i}
            to={`/user/${map[username]}`}
            className="text-blue-600 hover:underline"
          >
            {part}
          </Link>
        );
      }
    }
    return part;
  });
};