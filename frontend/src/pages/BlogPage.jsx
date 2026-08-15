import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import BlogCard from "../components/BlogCard";
import { Loader2, FileText, ArrowLeft, RefreshCw, BookOpen } from "lucide-react";

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (err) {
      console.error("Failed to fetch blog:", err);
      if (err.response?.status === 404) {
        setError("Blog not found");
      } else {
        setError("Failed to load blog");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-500 rounded-full blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Loading blog</p>
          <p className="text-sm text-slate-400">Fetching content...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="relative text-center py-24 glass-panel border border-indigo-200/30 dark:border-indigo-800/30 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-cyan-50/30 to-teal-50/50 dark:from-slate-900/80 dark:via-indigo-950/20 dark:to-cyan-950/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-3xl" />

          <div className="relative">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 rounded-2xl flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                <FileText className="w-10 h-10 text-indigo-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {error || "Blog not found"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              The blog may have been deleted or doesn't exist.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400/70 transition-all font-medium"
              >
                Go Home
              </button>
              <button
                onClick={fetchBlog}
                className="group relative px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <RefreshCw className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-all"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        Back
      </button>

      {/* Blog content */}
      <BlogCard blog={blog} showOwnerActions={true} />
    </div>
  );
};

export default BlogPage;