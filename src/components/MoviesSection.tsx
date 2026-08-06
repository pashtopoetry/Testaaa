import React, { useState } from 'react';
import { Film, Star, Play, Calendar, Clock, ShieldCheck, Heart } from 'lucide-react';
import { Channel, Language } from '../types';
import { translations } from '../data/translations';

interface MoviesSectionProps {
  movies: Channel[];
  activeChannel: Channel;
  onSelectMovie: (movie: Channel) => void;
  language: Language;
  favorites: string[];
  onToggleFavorite: (movieId: string, e: React.MouseEvent) => void;
}

export const MoviesSection: React.FC<MoviesSectionProps> = ({
  movies,
  activeChannel,
  onSelectMovie,
  language,
  favorites,
  onToggleFavorite,
}) => {
  const [movieGenre, setMovieGenre] = useState<string>('all');
  const t = translations[language];

  const genres = [
    { id: 'all', label: language === 'en' ? 'All Movies' : 'ټول فلمونه' },
    { id: 'historical', label: language === 'en' ? 'Historical' : 'تاریخي فلمونه' },
    { id: 'action', label: language === 'en' ? 'Action & War' : 'جنګي او اکشن' },
    { id: 'comedy', label: language === 'en' ? 'Comedy' : 'کاميډي' },
    { id: 'drama', label: language === 'en' ? 'Drama' : 'ډرامه او ټولنیز' },
  ];

  const filteredMovies = movies.filter((m) => {
    if (movieGenre === 'all') return true;
    return m.genre === movieGenre;
  });

  return (
    <div className="space-y-6">
      {/* Movies Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Film className="w-3.5 h-3.5" />
              <span>{t.catMovies}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'en' ? 'Exclusive Pashto Dubbed Cinema' : 'ځانګړي پښتو ډب شوي او محلي فلمونه'}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {language === 'en'
                ? 'Enjoy the finest collection of historical epics, action movies, and comedies dubbed in Pashto.'
                : 'د پښتو ژبې تر ټولو غوره، تاریخي، اتلولي، جنګي او خندوونکي فلمونه په لوړ کیفیت ننداره کړئ.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-700/80 px-4 py-3 rounded-2xl">
            <span className="text-2xl">🎬</span>
            <div>
              <div className="text-xs text-slate-400 font-medium">
                {language === 'en' ? 'Total Movies' : 'ټول فلمونه'}
              </div>
              <div className="text-lg font-black text-amber-400 font-mono">
                {movies.length} {language === 'en' ? 'Titles' : 'فلمونه'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Genre Subcategories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {genres.map((g) => {
          const isSelected = movieGenre === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setMovieGenre(g.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 border-amber-400 text-white shadow-lg ring-2 ring-amber-500/30'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-base text-slate-200 mb-1">
            {language === 'en' ? 'No movies found in this category.' : 'پدې کټګورۍ کې کوم فلم ونه موندل شو.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMovies.map((movie) => {
            const isActive = activeChannel.id === movie.id;
            const isFav = favorites.includes(movie.id);

            return (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className={`group bg-slate-900/90 border rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Movie Cover Poster */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img
                    src={movie.bannerImg || movie.logo}
                    alt={movie.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 text-xs font-black shadow-lg">
                      ⭐ {movie.imdbRating || '8.5'}
                    </span>
                    <button
                      onClick={(e) => onToggleFavorite(movie.id, e)}
                      className={`p-2 rounded-xl backdrop-blur-md transition ${
                        isFav
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50'
                          : 'bg-slate-950/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration & Year Badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-200 text-[11px] font-mono border border-slate-700">
                      {movie.duration || '2h'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 text-amber-400 text-[11px] font-mono border border-slate-700">
                      {movie.releaseYear || '2024'}
                    </span>
                  </div>
                </div>

                {/* Movie Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition line-clamp-1">
                      {movie.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {movie.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-amber-400/90">
                      <Film className="w-3.5 h-3.5" />
                      {movie.genre?.toUpperCase() || 'CINEMA'}
                    </span>
                    <button className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold transition flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      <span>{language === 'en' ? 'Watch Now' : 'کتل'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
