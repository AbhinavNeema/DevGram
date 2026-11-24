import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ProjectCard from '../components/ProjectCard';
import BlogCard from '../components/BlogCard';
import {
  Layers,
  Terminal,
  Loader2,
  Activity,
  X,
  Code2,
  Sparkles,
  Plus,
} from 'lucide-react';

const SkeletonFeedItem = ({ idx = 0 }) => (
  <div
    className="animate-pulse bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 mb-6"
    style={{ animationDelay: `${idx * 80}ms` }}
  >
    {/* Author Header */}
    <div className="flex items-center gap-3.5 mb-4">
      <div className="w-11 h-11 rounded-full bg-white/[0.08]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/[0.08] rounded-md w-1/3" />
        <div className="h-3 bg-white/[0.05] rounded-md w-1/4" />
      </div>
      <div className="w-16 h-7 bg-white/[0.05] rounded-xl" />
    </div>

    {/* Content Skeleton */}
    <div className="space-y-3 mb-5">
      <div className="h-5 bg-white/[0.08] rounded-md w-3/4" />
      <div className="h-3.5 bg-white/[0.05] rounded-md w-full" />
      <div className="h-3.5 bg-white/[0.05] rounded-md w-5/6" />
      <div className="h-48 bg-white/[0.04] rounded-xl w-full mt-2" />
    </div>

    {/* Footer Skeleton */}
    <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
      <div className="h-7 w-16 bg-white/[0.05] rounded-full" />
      <div className="h-7 w-16 bg-white/[0.05] rounded-full" />
      <div className="h-7 w-16 bg-white/[0.05] rounded-full ml-auto" />
    </div>
  </div>
);

const safeParsePayload = (res) => {
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
  const activeTag = searchParams.get('tag') || null;

  // Sleek Intro Animation States
  const [isFirstHit, setIsFirstHit] = useState(false);
  const [introFinished, setIntroFinished] = useState(true);
  const [statusText, setStatusText] = useState('Initializing runtime...');
  const [terminalLog, setTerminalLog] = useState([]);

  const fetchAbortRef = useRef(null);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('devgram_intro_seen');
    if (!hasSeenIntro) {
      setIsFirstHit(true);
      setIntroFinished(false);
      sessionStorage.setItem('devgram_intro_seen', 'true');

      const logs = [
        'Booting DevGram microkernel v2.4...',
        'Connecting to peer mesh network...',
        'Synchronizing developer feed stream...',
        'Compiling feed assets...',
        'System ready.',
      ];

      logs.forEach((msg, idx) => {
        setTimeout(() => {
          setStatusText(msg);
          setTerminalLog((prev) => [...prev, msg]);
        }, idx * 450);
      });

      const timer = setTimeout(() => {
        setIntroFinished(true);
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch Feed with cancelable requests and state safety
  const fetchFeed = useCallback(
    async (isInitial = false) => {
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
          if (!hasMore || loadingMore) return;
          setLoadingMore(true);
        }

        const res = await api.get('/feed', {
          params: {
            cursor: isInitial ? 0 : cursor,
            limit: 10,
            tag: activeTag || undefined,
          },
          signal,
        });

        const payload = safeParsePayload(res);

        setFeed((prev) => (isInitial ? payload.data : [...prev, ...payload.data]));
        setCursor(payload.cursor || 0);
        setHasMore(payload.hasMore ?? false);
      } catch (err) {
        if (err.name === 'CanceledError' || err?.name === 'AbortError') {
          // Request was aborted, ignore
        } else {
          console.error('Fetch feed failed', err);
          if (isInitial) setFeed([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, activeTag, hasMore, loadingMore]
  );

  // Initial load and reload on tag change
  useEffect(() => {
    setFeed([]);
    setCursor(0);
    setHasMore(true);
    fetchFeed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  // Infinite scroll IntersectionObserver
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
        { rootMargin: '300px' }
      );

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, fetchFeed, loading]
  );

  const clearFilter = () => {
    setSearchParams((prev) => {
      prev.delete('tag');
      return prev;
    });
  };

  const handlePostDeleted = (deletedId) => {
    setFeed((prev) => prev.filter((item) => item._id !== deletedId));
  };

  // Modern sleek terminal intro overlay
  if (isFirstHit && !introFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0F1E] flex flex-col items-center justify-center p-4 select-none">
        <div className="w-full max-w-lg bg-black/60 backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Mac-style window controls */}
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/[0.08]">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <div className="ml-3 text-xs font-mono text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              devgram@terminal ~
            </div>
          </div>

          {/* Terminal log output */}
          <div className="space-y-2 font-mono text-xs">
            {terminalLog.map((log, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300">
                <span className="text-indigo-400">➜</span>
                <span>{log}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="animate-pulse">❯</span>
              <span className="w-2 h-4 bg-indigo-400 animate-pulse" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 animate-pulse w-full" />
            </div>
            <div className="flex justify-between items-center mt-2 text-[11px] font-mono text-slate-400">
              <span>{statusText}</span>
              <span className="text-indigo-400 font-semibold">Ready</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Active Filter Header */}
      {activeTag && (
        <div className="mb-6 flex items-center justify-between p-3.5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400 font-medium">Filtering by tag:</span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-0.5 text-xs font-semibold">
              #{activeTag}
            </span>
          </div>
          <button
            onClick={clearFilter}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Main Stream Feed */}
      <main>
        {loading ? (
          <div className="space-y-6">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonFeedItem key={i} idx={i} />
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Posts in Stream</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              {activeTag
                ? `No projects or articles found with tag #${activeTag}.`
                : 'The feed is waiting for your creativity. Be the first developer to share your build!'}
            </p>
            <div className="flex justify-center gap-3">
              {activeTag && (
                <button
                  onClick={clearFilter}
                  className="bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.1] rounded-xl px-4 py-2 text-sm transition-all duration-300"
                >
                  Clear Tag Filter
                </button>
              )}
              <Link
                to="/create"
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-medium rounded-xl px-5 py-2 text-sm transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {feed.map((item, idx) => {
              const isLast = idx === feed.length - 1;
              return (
                <div
                  key={item._id}
                  ref={isLast ? lastItemRef : null}
                  className="transition-all duration-300"
                >
                  {item.feedType === 'project' ? (
                    <ProjectCard
                      project={item}
                      showOwnerActions
                      onDelete={() => handlePostDeleted(item._id)}
                    />
                  ) : (
                    <BlogCard
                      blog={item}
                      showOwnerActions
                      onDelete={() => handlePostDeleted(item._id)}
                    />
                  )}
                </div>
              );
            })}

            {/* Infinite Scroll Loader */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs font-medium">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  Loading more posts...
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;