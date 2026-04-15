import React from 'react';
import { motion } from 'motion/react';
import { Quote, Star, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const STORIES = [
  {
    id: 1,
    name: "Farai Mutasa",
    role: "Founder, ZimTech Solutions",
    content: "ZivoHR transformed how we handle our growing team. The automated payroll and localized contracts saved us weeks of legal headaches. It's not just software; it's a partner in our growth.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Chidzero",
    role: "HR Director, GreenAgro Zim",
    content: "The Resource Library is a goldmine. Having the Labour Act and NEC handbooks at our fingertips has made compliance effortless. Our employees love the transparent payslips delivered via WhatsApp.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5
  },
  {
    id: 3,
    name: "Tendai Moyo",
    role: "Operations Manager, BuildIt SME",
    content: "We used to struggle with labor disputes. Since using ZivoHR's AI HR Manager, we've resolved issues before they even started. The community forum is also a great place to share insights with other SME owners.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5
  }
];

export default function SuccessStories() {
  return (
    <section className="py-16 bg-white text-space-gray overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <Quote className="w-5 h-5" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-accent">
            Testimonials: Empowering the visionaries of Zimbabwean business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STORIES.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white border border-black/[0.08] hover:border-accent/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
            >
              <h4 className="text-lg font-bold text-space-gray mb-4 leading-tight">
                {story.name}
              </h4>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                "{story.content}"
              </p>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/[0.03]">
                <div className="flex items-center gap-3">
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="w-10 h-10 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">{story.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <button className="group inline-flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all">
            Read more success stories
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
