import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import BlogCard from "../components/BlogCard";
import { Layers, Zap, Terminal, Loader2, Activity, Plus } from "lucide-react";

const SkeletonItem = ({ idx = 0 }) => (
  <div
    className="animate-pulse bg-white rounded-3xl border border-gray-100 shadow-sm p-5"
    style={{ animationDelay: `${idx * 60}ms` }}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-100" />
      <div className="flex-1">
        <div className="h-4 bg-gray-100 rounded w-3/5 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="w-20 h-8 bg-gray-100 rounded" />
    </div>

    <div className="space-y-3">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-11/12" />
      <div className="h-40 bg-gray-100 rounded-md" />
    </div>

    <div className="mt-4 flex items-center gap-4">
      <div className="h-8 w-20 bg-gray-100 rounded-full" />
      <div className="h-8 w-10 bg-gray-100 rounded-full ml-auto" />
    </div>
  </div>
);

const safeParsePayload = (res) => {
  // handle either array response or payload object like before
  if (!res) return { data: [], cursor: 0, hasMore: false };
  if (Array.isArray(res.data)) return { data: res.data, cursor: 0, hasMore: false };
  return {
    data: res.data?.data || res.data || [],
    cursor: res.data?.cursor ?? 0,
    hasMore: res.data?.hasMore ?? false,
  };
};

const ProjectsPage = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag") || null;

  // intro animation states
  const [isFirstHit, setIsFirstHit] = useState(false);
  const [introFinished, setIntroFinished] = useState(true);
  const [statusText, setStatusText] = useState("Initializing...");

  // debounce / abort control
  const fetchAbortRef = useRef(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("devgram_intro_seen");
    if (!hasSeenIntro) {
      setIsFirstHit(true);
      setIntroFinished(false);
      sessionStorage.setItem("devgram_intro_seen", "true");

      const messages = ["Connecting to Grid...", "Bypassing Firewalls...", "Fetching Nodes...", "Ready."];
      messages.forEach((msg, i) => {
        setTimeout(() => setStatusText(msg), i * 600);
      });

      setTimeout(() => setIntroFinished(true), 2800);
    }
  }, []);

  // fetch feed (safe, cancelable, supports initial/next)
  const fetchFeed = useCallback(
    async (isInitial = false) => {
      // cancel previous
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
      fetchAbortRef.current = new AbortController();
      const signal = fetchAbortRef.current.signal;

      try {
        if (isInitial) {
          setLoading(true);
          setCursor(0);
        } else {
          if (!hasMore) return;
          setLoadingMore(true);
        }

        const res = await api.get("/feed", {
          params: {
            cursor: isInitial ? 0 : cursor,
            limit: 12,
            tag: activeTag || undefined,
          },
          signal,
        });

        const payload = safeParsePayload(res);

        setFeed((prev) => (isInitial ? payload.data : [...prev, ...payload.data]));
        setCursor(payload.cursor || 0);
        setHasMore(payload.hasMore ?? false);
      } catch (err) {
        if (err.name === "CanceledError" || err?.name === "AbortError") {
          // ignore
        } else {
          console.error("Fetch failed", err);
          if (isInitial) setFeed([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, activeTag, hasMore]
  );

  // initial load & reload on tag change
  useEffect(() => {
    setFeed([]);
    setCursor(0);
    setHasMore(true);
    fetchFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  // infinite scroll observer
  const observer = useRef();
  const lastItemRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
            fetchFeed(false);
          }
        },
        { rootMargin: "200px" }
      );

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, fetchFeed, loading]
  );

  // compute top tags (simple frequency count from feed)
  const topTags = useMemo(() => {
    const count = {};
    feed.forEach((it) => {
      const arr = (it.techStack || []).slice(0, 6);
      arr.forEach((t) => (count[t] = (count[t] || 0) + 1));
    });
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((e) => e[0]);
  }, [feed]);

  const handleTagClick = (value) => {
    setSearchParams((prev) => {
      prev.set("tag", value);
      return prev;
    });
  };

  const clearFilter = () => {
    setSearchParams((prev) => {
      prev.delete("tag");
      return prev;
    });
  };

  // layout: two-column on lg: feed (2/3) + sidebar (1/3)
  return isFirstHit && !introFinished ? (
    <div className="fixed inset-0 z-[200] bg-indigo-900/95 flex flex-col items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-8">
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(79,70,229,0.45)] animate-in zoom-in duration-700">
          <Terminal className="text-white w-12 h-12 stroke-[2.5px]" />
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-white tracking-[0.08em] uppercase italic animate-typing">DevGram</h1>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-indigo-300 animate-pulse" />
            <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">{statusText}</span>
          </div>

          <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-progress" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typing { from { width: 0 } to { width: 100% } }
        @keyframes progress { from { width: 0 } to { width: 100% } }
        .animate-typing { animation: typing 1.6s steps(7,end) forwards; }
        .animate-progress { animation: progress 2.6s linear forwards; }
      `}</style>
    </div>
  ) : (
    <div className="max-w-2xl mx-auto">
      {/* layout grid */}
      <main>
        {loading ? (
          <div className="space-y-8">
            {[0, 1, 2, 3].map((i) => <SkeletonItem key={i} idx={i} />)}
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <Layers className="mx-auto w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">No Signal Detected</h3>
            <p className="text-sm text-slate-500 mt-2">Try clearing filters or create a new post to kickstart the stream.</p>
            <div className="mt-6">
              <button onClick={clearFilter} className="px-5 py-2 bg-indigo-600 text-white rounded-xl">Clear Filters</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {feed.map((item, idx) => {
              const isLast = idx === feed.length - 1;
              return (
                <div
                  key={item._id}
                  ref={isLast ? lastItemRef : null}
                  className="animate-in fade-in slide-in-from-bottom-6 duration-500 transform hover:scale-[1.01] transition-all"
                  style={{ animationDelay: `${(idx % 6) * 40}ms` }}
                >
                  {item.feedType === "project" ? (
                    <ProjectCard project={item} showOwnerActions />
                  ) : (
                    <BlogCard blog={item} showOwnerActions />
                  )}
                </div>
              );
            })}

            {loadingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;