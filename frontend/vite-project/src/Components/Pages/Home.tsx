import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Surface from '../Common/Surface';
import { 
  Droplets, 
  Sparkles, 
  Heart, 
  FlaskConical,
  ArrowRight,
  Leaf,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';

interface Oil {
  id: number;
  name: string;
  vibes?: number[];
}

interface Blend {
  id: number;
  name: string;
  description?: string;
  created_by_username?: string;
}

const Home: React.FC = () => {
  const [oilCount, setOilCount] = useState<number | null>(null);
  const [blendCount, setBlendCount] = useState<number | null>(null);
  const [recentBlends, setRecentBlends] = useState<Blend[]>([]);
  const [featuredOils, setFeaturedOils] = useState<Oil[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Fetch counts and recent data
    client.get('/essential-oils/').then(r => {
      const data = Array.isArray(r.data) ? r.data : (r.data.results || []);
      setOilCount(data.length);
      // Pick 4 random oils as featured
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setFeaturedOils(shuffled.slice(0, 4));
    }).catch(() => {});

    client.get('/blends/').then(r => {
      const data = Array.isArray(r.data) ? r.data : (r.data.results || []);
      setBlendCount(data.length);
      setRecentBlends(data.slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40">
            <Leaf className="h-12 w-12 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Essential Oils Blend Studio
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Discover, create, and share custom essential oil blends. 
          Explore scent profiles, balance notes, and craft your perfect aromatherapy experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/blends/create">
            <Button size="lg" className="gap-2">
              <FlaskConical className="h-5 w-5" />
              Create a Blend
            </Button>
          </Link>
          <Link to="/essential-oils">
            <Button size="lg" variant="outline" className="gap-2">
              <Droplets className="h-5 w-5" />
              Browse Oils
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Surface elevation={1} className="p-6 text-center">
          <Droplets className="h-8 w-8 mx-auto mb-2 text-teal-500" />
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {oilCount ?? '—'}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Essential Oils</div>
        </Surface>
        <Surface elevation={1} className="p-6 text-center">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {blendCount ?? '—'}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Community Blends</div>
        </Surface>
        <Surface elevation={1} className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">10</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Mood Vibes</div>
        </Surface>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/essential-oils" className="group">
          <Surface elevation={1} className="p-5 h-full hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
            <Droplets className="h-6 w-6 text-teal-500 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Explore Oils
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Browse the full collection with filters by note, aroma, and vibe.
            </p>
            <span className="text-sm text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </span>
          </Surface>
        </Link>

        <Link to="/blends" className="group">
          <Surface elevation={1} className="p-5 h-full hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
            <FlaskConical className="h-6 w-6 text-indigo-500 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Community Blends
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Discover blends created by the community.
            </p>
            <span className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Browse <ArrowRight className="h-4 w-4" />
            </span>
          </Surface>
        </Link>

        <Link to="/blends/create" className="group">
          <Surface elevation={1} className="p-5 h-full hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
            <Sparkles className="h-6 w-6 text-emerald-500 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Create Blend
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Mix oils, balance notes, and craft your signature blend.
            </p>
            <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Start creating <ArrowRight className="h-4 w-4" />
            </span>
          </Surface>
        </Link>

        <Link to={isLoggedIn ? "/blends/favorites" : "/login"} className="group">
          <Surface elevation={1} className="p-5 h-full hover:border-pink-300 dark:hover:border-pink-700 transition-colors">
            <Heart className="h-6 w-6 text-pink-500 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {isLoggedIn ? 'My Favorites' : 'Sign In'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {isLoggedIn ? 'View blends you\'ve saved to favorites.' : 'Sign in to save favorites and create blends.'}
            </p>
            <span className="text-sm text-pink-600 dark:text-pink-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              {isLoggedIn ? 'View' : 'Sign in'} <ArrowRight className="h-4 w-4" />
            </span>
          </Surface>
        </Link>
      </div>

      {/* Featured Oils */}
      {featuredOils.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Featured Oils
            </h2>
            <Link to="/essential-oils" className="text-sm text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredOils.map(oil => (
              <Link key={oil.id} to={`/essential-oils/${oil.id}`}>
                <Surface elevation={1} className="p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/40">
                      <Droplets className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {oil.name}
                    </span>
                  </div>
                </Surface>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Blends */}
      {recentBlends.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Recent Blends
            </h2>
            <Link to="/blends" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {recentBlends.map(blend => (
              <Surface key={blend.id} elevation={1} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
                    <FlaskConical className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {blend.name}
                    </h3>
                    {blend.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {blend.description}
                      </p>
                    )}
                    {blend.created_by_username && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        by {blend.created_by_username}
                      </p>
                    )}
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
