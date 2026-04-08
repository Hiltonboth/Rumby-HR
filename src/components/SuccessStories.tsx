import React from 'react';
import { motion } from 'motion/react';
import { Quote, Star, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const STORIES = [
  {
    id: 1,
    name: "Farai Mutasa",
    role: "Founder, ZimTech Solutions",
    content: "Rumby HR transformed how we handle our growing team. The automated payroll and localized contracts saved us weeks of legal headaches. It's not just software; it's a partner in our growth.",
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
    content: "We used to struggle with labor disputes. Since using Rumby's AI HR Manager, we've resolved issues before they even started. The community forum is also a great place to share insights with other SME owners.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
    rating: 5
  }
];

export default function SuccessStories() {
  return (
    <section className="py-24 bg-[#0A0C10] text-white overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-bold tracking-[0.2em] uppercase text-xs mb-4 block"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-serif font-medium leading-tight mb-6"
          >
            Empowering the visionaries of <span className="italic text-accent">Zimbabwean</span> business.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl"
          >
            Join hundreds of SMEs who have streamlined their operations and empowered their people with Rumby HR.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STORIES.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col h-full"
            >
              <div className="flex gap-1 mb-8">
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <div className="relative mb-8">
                <Quote className="absolute -top-4 -left-4 w-12 h-12 text-accent/10 group-hover:text-accent/20 transition-colors" />
                <p className="text-lg text-gray-300 leading-relaxed relative z-10 italic">
                  "{story.content}"
                </p>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-8 border-t border-white/10">
                <img 
                  src={story.image} 
                  alt={story.name} 
                  className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-white text-lg">{story.name}</h4>
                  <p className="text-accent text-xs font-medium uppercase tracking-wider">{story.role}</p>
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
          className="mt-20 text-center"
        >
          <button className="group inline-flex items-center gap-3 text-white font-bold text-lg hover:text-accent transition-colors">
            Read more success stories
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent group-hover:bg-accent transition-all">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
