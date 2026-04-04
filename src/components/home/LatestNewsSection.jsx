import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import ImageOptimizer from '@/components/ImageOptimizer';
import { initialBlogPosts } from '@/lib/blogData';

const LatestNewsSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        const list = (data && data.length > 0 ? data : initialBlogPosts).slice(0, 3);
        setPosts(list);
      } catch (e) {
        setPosts(initialBlogPosts.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return (
    <section className="py-20 bg-[#f5f7fa] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3a52]">Últimas Notícias</h2>
            <p className="text-gray-500 mt-2">Fique por dentro das novidades do mercado imobiliário.</p>
          </div>
          <Link to="/blog" className="md:self-end">
            <Button variant="link" className="text-[#0d5a7a] px-0">Ver todos os artigos</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id || post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="h-44 bg-gray-100 overflow-hidden">
                  <ImageOptimizer
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    width={800}
                    height={440}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#0d5a7a]/10 text-[#0d5a7a]">
                      {post.category || 'Mercado'}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#1a3a52] leading-snug line-clamp-2 group-hover:text-[#0d5a7a] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestNewsSection;
