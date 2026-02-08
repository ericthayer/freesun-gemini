
import React, { useState } from 'react';
import {
  Users, Plane, Award, MapPin, Search,
  X, ChevronLeft, ChevronRight, Maximize2,
  Info, History, Heart, Sparkles
} from 'lucide-react';
import { useCrewMembers, ShowcaseMember } from '../hooks/useCrewMembers';

export const CrewShowcase: React.FC = () => {
  const { showcaseMembers: crewData } = useCrewMembers();
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const openSlideshow = (index: number) => setSlideshowIndex(index);
  const closeSlideshow = () => setSlideshowIndex(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  React.useEffect(() => {
    if (slideshowIndex !== null) {
      document.body.style.overflow = 'hidden';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeSlideshow();
      };

      const handleArrowKeys = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleArrowKeys);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleArrowKeys);
      };
    }
  }, [slideshowIndex]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slideshowIndex === null) return;
    setSlideshowIndex((slideshowIndex + 1) % crewData.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slideshowIndex === null) return;
    setSlideshowIndex((slideshowIndex - 1 + crewData.length) % crewData.length);
  };

  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Users size={14} /> The Freesun Crew
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 uppercase italic">Meet the <span className="text-primary">Aeronauts</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
            The pilots and ground operations team that make every sunrise mission possible.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {crewData.map((member, index) => {
            const isPilot = member.role === 'Pilot';
            return (
              <div 
                key={member.id}
                className={`group relative rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-500 shadow-xl cursor-pointer ${
                  isPilot ? 'lg:col-span-2 lg:row-span-2 row-span-2' : 'col-span-1 row-span-1'
                }`}
                onClick={() => openSlideshow(index)}
              >
                {/* Member Image */}
                <img 
                  src={member.imageUrl} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />

                {/* Pilot Badge Overlay */}
                {isPilot && (
                  <div className="absolute top-6 left-6">
                    <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Plane size={12} /> Chief Pilot
                    </span>
                  </div>
                )}

                {/* Default Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent group-hover:translate-y-full transition-transform duration-500">
                  <div className="text-white">
                    <h3 className={`font-bold ${isPilot ? 'text-3xl' : 'text-xl'}`}>{member.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-200">{member.role}</p>
                  </div>
                </div>

                {/* Hover Detailed Content Overlay */}
                <div className="absolute inset-0 bg-primary/95 text-white p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-between backdrop-blur-sm z-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold italic ${isPilot ? 'text-4xl' : 'text-2xl'}`}>{member.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{member.role}</p>
                      </div>
                      <div className="p-2 bg-white/10 rounded-xl">
                        <Sparkles size={isPilot ? 24 : 16} />
                      </div>
                    </div>
                    
                    <p className={`italic leading-relaxed ${isPilot ? 'text-base' : 'text-xs line-clamp-3'}`}>
                      "{member.bio}"
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                      <div>
                        <div className="text-[9px] font-black uppercase opacity-60">Experience</div>
                        <div className="font-bold text-lg">{member.experience}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase opacity-60">Flight Hours</div>
                        <div className="font-bold text-lg">{member.flights}+</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <button className="flex-grow py-3 bg-white text-primary font-bold text-xs rounded-xl hover:bg-slate-100 transition-all active:scale-95">
                      Full Profile
                    </button>
                    <button className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
           <button 
            onClick={() => openSlideshow(0)}
            className="inline-flex items-center gap-2 px-10 py-5 bg-background border-2 border-primary/20 text-primary font-black text-lg rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            Launch Gallery Experience <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Slideshow Lightbox */}
      {slideshowIndex !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl cursor-pointer"
            onClick={closeSlideshow}
            aria-label="Click to close"
          />

          <button
            onClick={closeSlideshow}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-3 sm:p-4 bg-white/10 hover:bg-white/20 cursor-pointer text-white rounded-full transition-all z-[1001] backdrop-blur-sm border border-white/20 shadow-xl group"
            aria-label="Close gallery"
          >
            <X size={24} className="sm:w-8 sm:h-8" />
            <span className="sr-only">Press ESC to close</span>
          </button>

          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white/40 text-xs font-medium z-[1001] hidden sm:flex items-center gap-2">
            <span>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">ESC</kbd> to close
            </span>
            <span className="text-white/20">•</span>
            <span>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 ml-1">→</kbd> to navigate
            </span>
          </div>

          <div className="relative w-full max-w-6xl h-full flex flex-col lg:flex-row items-center gap-10 z-[1000] animate-in zoom-in-95 duration-500">
            {/* Nav Left */}
            <button 
              onClick={prevSlide}
              className="hidden lg:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Photo Section */}
            <div
              className="lg:w-2/3 h-full max-h-[70vh] lg:max-h-full flex items-center justify-center bg-black/40 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={crewData[slideshowIndex].imageUrl}
                alt={crewData[slideshowIndex].name}
                className="w-full h-full object-cover animate-in fade-in duration-700 select-none"
                draggable="false"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
              
              {/* Mobile Nav */}
              <div className="lg:hidden absolute bottom-6 flex gap-3">
                <button
                  onClick={prevSlide}
                  className="p-4 bg-black/60 backdrop-blur rounded-full text-white border border-white/20"
                  aria-label="Previous crew member"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-4 bg-black/60 backdrop-blur rounded-full text-white border border-white/20"
                  aria-label="Next crew member"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/3 text-white space-y-8 animate-in slide-in-from-right-8 duration-500 delay-200">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {crewData[slideshowIndex].role === 'Pilot' ? <Plane size={10} /> : <Users size={10} />}
                  {crewData[slideshowIndex].role}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter italic leading-none">{crewData[slideshowIndex].name}</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Flight Log Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                      <div className="text-primary font-black text-2xl italic">{crewData[slideshowIndex].experience}</div>
                      <div className="text-[9px] font-bold uppercase text-white/60">Professional Rank</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                      <div className="text-primary font-black text-2xl italic">{crewData[slideshowIndex].flights}</div>
                      <div className="text-[9px] font-bold uppercase text-white/60">Missions Logged</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Core Specialization</h4>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl italic text-lg">
                    <Sparkles className="text-primary shrink-0" size={20} />
                    {crewData[slideshowIndex].specialty}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Aeronautical Background</h4>
                  <p className="text-white/70 italic leading-relaxed text-lg">
                    "{crewData[slideshowIndex].bio}"
                  </p>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button className="flex-grow py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Inquire for Launch
                </button>
                <button className="p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                  <Heart size={24} />
                </button>
              </div>
            </div>

            {/* Nav Right */}
            <button 
              onClick={nextSlide}
              className="hidden lg:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
