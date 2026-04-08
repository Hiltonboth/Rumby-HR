import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  ChevronRight, 
  Star, 
  Plus, 
  Send,
  ThumbsUp,
  Smile,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Briefcase,
  Sparkles,
  FileText,
  User,
  CheckCircle2,
  X,
  ArrowLeft,
  Upload,
  PenTool,
  Download,
  Eye,
  Search,
  MoreVertical,
  Hash,
  AtSign,
  Paperclip,
  Image as ImageIcon,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';
import SignaturePad from './SignaturePad';
import CVBuilder from './CVBuilder';

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  reactions: { [key: string]: number };
}

interface Post {
  id: string;
  author: string;
  role: string;
  content: string;
  likes: number;
  comments: Comment[];
  time: string;
  reactions: { [key: string]: number };
}

interface Job {
  id: string;
  company: string;
  role: string;
  rating: string;
  location: string;
  salary: string;
  desc: string;
  requirements: string[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Recruiting Manager',
    role: 'Human Resources',
    content: "I'm interviewing at a new company and I reached out to someone on LinkedIn who was in the role before for their thoughts. Has anyone ever done this?",
    likes: 9,
    time: '2h ago',
    reactions: { '👍': 5, '❤️': 3, '😮': 1 },
    comments: [
      { id: 'c1', author: 'HR Pro', content: "It's a great idea! Just be professional about it.", time: '1h ago', reactions: { '👍': 2 } }
    ]
  },
  {
    id: '2',
    author: 'HR Generalist',
    role: 'Human Resources',
    content: "I've been part of discussions where diversity goals were emphasized, but hiring managers still leaned toward 'safe' or familiar profiles. HR can push...",
    likes: 6,
    time: '5h ago',
    reactions: { '👍': 4, '❤️': 2 },
    comments: []
  }
];

const JOBS: Job[] = [
  {
    id: 'j1',
    company: 'Linical',
    role: 'HR Business Partner',
    rating: '3.4',
    location: 'Harare',
    salary: '$1,500 - $2,500',
    desc: 'We are looking for an experienced HRBP to join our growing team in Harare. You will be responsible for employee relations, payroll compliance, and performance management.',
    requirements: ['5+ years HR experience', 'Degree in HR or related field', 'Expertise in Zimbabwean Labour Act', 'Excellent communication skills']
  },
  {
    id: 'j2',
    company: 'TechZim',
    role: 'Recruitment Lead',
    rating: '4.2',
    location: 'Bulawayo',
    salary: '$1,200 - $1,800',
    desc: 'Join the leading tech news platform in Zimbabwe. Help us find and hire the best tech talent in the region.',
    requirements: ['3+ years recruitment experience', 'Strong networking skills', 'Familiarity with tech roles', 'Proactive attitude']
  }
];

const SignaturePadPlaceholder = () => null; // Removed inline SignaturePad

const ALL_JOBS: Job[] = [
  ...JOBS,
  {
    id: 'j3',
    company: 'Econet Wireless',
    role: 'Employee Relations Specialist',
    rating: '4.5',
    location: 'Harare',
    salary: '$2,000 - $3,500',
    desc: 'Manage labor relations and compliance for the largest telecom company in Zimbabwe.',
    requirements: ['7+ years experience', 'Law degree preferred', 'Strong negotiation skills']
  },
  {
    id: 'j4',
    company: 'Delta Corporation',
    role: 'HR Assistant',
    rating: '4.0',
    location: 'Harare',
    salary: '$800 - $1,200',
    desc: 'Support the HR team with administrative tasks, payroll, and recruitment.',
    requirements: ['1-2 years experience', 'Diploma in HR', 'Attention to detail']
  }
];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: 'cover' | 'cv' | 'match', content: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userData, setUserData] = useState({ name: '', experience: '', skills: '' });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'activity'>('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCVBuilder, setShowCVBuilder] = useState(false);

  const displayedJobs = showAllJobs ? ALL_JOBS : JOBS;

  const filteredPosts = posts.filter(post => 
    (post.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
     post.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddPost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You',
      role: 'Community Member',
      content: newPostContent,
      likes: 0,
      time: 'Just now',
      reactions: {},
      comments: []
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const handleReaction = (postId: string, emoji: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newReactions = { ...p.reactions };
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return { ...p, reactions: newReactions };
      }
      return p;
    }));
  };

  const generateAIContent = async (type: 'cover' | 'cv' | 'match') => {
    if (!selectedJob) return;
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');
      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = '';
      if (type === 'cover') {
        prompt = `Generate a professional cover letter for the role of ${selectedJob.role} at ${selectedJob.company}. User info: Name: ${userData.name}, Experience: ${userData.experience}, Skills: ${userData.skills}. Job details: ${selectedJob.desc}. Requirements: ${selectedJob.requirements.join(', ')}. Keep it concise and tailored to the Zimbabwean context.`;
      } else if (type === 'cv') {
        prompt = `Create a professional CV structure and content for ${userData.name} applying for ${selectedJob.role} at ${selectedJob.company}. User data: Experience: ${userData.experience}, Skills: ${userData.skills}. Tailor it to highlight matches with these requirements: ${selectedJob.requirements.join(', ')}.`;
      } else {
        prompt = `Analyze the match between this candidate and the job. Candidate: Experience: ${userData.experience}, Skills: ${userData.skills}. Job: ${selectedJob.role} at ${selectedJob.company}, Requirements: ${selectedJob.requirements.join(', ')}. 
        Provide a detailed analysis (Indeed-style) with:
        1. Strengths: What makes them a great fit.
        2. Weaknesses/Gaps: What they are missing or could improve.
        3. Overall Recommendation.
        Use bullet points and clear headings.`;
      }

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      setAiResult({ type, content: result.text || "Sorry, I couldn't generate that content." });
    } catch (error) {
      console.error('AI Error:', error);
      setAiResult({ type, content: "Sorry, I couldn't generate that content right now. Please check your API key." });
    } finally {
      setIsGenerating(false);
    }
  };

  const [showShareModal, setShowShareModal] = useState<Post | null>(null);

  const handleShare = (post: Post, platform: 'whatsapp' | 'facebook' | 'copy') => {
    const text = encodeURIComponent(`Check out this HR discussion on Rumby HR: "${post.content.slice(0, 50)}..."`);
    const url = window.location.href;
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
    setShowShareModal(null);
  };

  const [newCommentContent, setNewCommentContent] = useState<{ [key: string]: string }>({});

  const handleAddComment = (postId: string) => {
    const content = newCommentContent[postId];
    if (!content?.trim()) return;
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          author: 'You',
          content: content,
          time: 'Just now',
          reactions: {}
        };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
    setNewCommentContent({ ...newCommentContent, [postId]: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed - Chat Style */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-space-gray">Community</h2>
              <div className="flex bg-apple-gray/50 p-1 rounded-xl border border-black/[0.03]">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'feed' ? "bg-white text-accent shadow-sm" : "text-gray-400 hover:text-space-gray"
                  )}
                >
                  Feed
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    activeTab === 'activity' ? "bg-white text-accent shadow-sm" : "text-gray-400 hover:text-space-gray"
                  )}
                >
                  Activity
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-black/[0.05] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 w-48 md:w-64"
                />
              </div>
              <button 
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              >
                <Plus className="w-4 h-4" />
                New Question
              </button>
            </div>
          </div>

          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-4 bg-apple-gray/30 border-b border-black/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                {activeTab === 'feed' ? 'Recent Activity' : 'All Community Activity'}
              </div>
              {activeTab === 'feed' && (
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-bold text-accent hover:underline"
                >
                  View all activity
                </button>
              )}
            </div>
            <div className="divide-y divide-black/[0.05]">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="p-6 hover:bg-apple-gray/20 transition-all cursor-pointer group flex gap-4"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-space-gray truncate">{post.author}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{post.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <ThumbsUp className="w-3 h-3" />
                        {post.likes + Object.values(post.reactions).reduce((a, b) => (a as number) + (b as number), 0)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments.length}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 self-center group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Jobs & AI */}
        <div className="space-y-8">
          <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-space-gray">Discover your next job</h3>
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            </div>
            <div className="space-y-4">
              {displayedJobs.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="p-5 bg-white rounded-3xl border border-black/[0.03] flex items-center gap-4 group cursor-pointer hover:border-accent/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-apple-gray rounded-2xl flex items-center justify-center text-accent font-bold">
                    {job.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-space-gray truncate">{job.company} <span className="text-accent ml-1">★ {job.rating}</span></p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{job.role}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{job.location}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-all" />
                </div>
              ))}
            </div>
            {!showAllJobs && (
              <button 
                onClick={() => setShowAllJobs(true)}
                className="w-full py-4 rounded-2xl border border-accent/20 text-accent font-bold text-sm hover:bg-accent/5 transition-all"
              >
                View all vacancies
              </button>
            )}
          </div>

          <div className="p-8 bg-white border border-black/[0.05] rounded-[2.5rem] space-y-6">
            <h3 className="text-xl font-bold">Community Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-apple-gray/30 rounded-2xl text-center">
                <p className="text-2xl font-bold text-space-gray">1.2k</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</p>
              </div>
              <div className="p-4 bg-apple-gray/30 rounded-2xl text-center">
                <p className="text-2xl font-bold text-space-gray">45</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Jobs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    {selectedJob.company[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-space-gray">{selectedJob.role}</h2>
                    <p className="text-sm text-gray-500 font-medium">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedJob(null); setAiResult(null); setIsApplying(false); setUploadedFiles([]); setSignature(null); setIsSigning(false); }} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">About the role</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedJob.desc}</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Requirements</h3>
                    <ul className="space-y-3">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Document Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Upload Documents</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-3xl hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer group">
                        <Upload className="w-8 h-8 text-gray-300 group-hover:text-accent transition-colors mb-2" />
                        <span className="text-sm font-bold text-gray-500 group-hover:text-accent">Click to upload CV, Certificates, or ID</span>
                        <span className="text-[10px] text-gray-400 mt-1">PDF, DOCX, JPG, PNG (Max 10MB)</span>
                        <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                      </label>
                      {uploadedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {uploadedFiles.map((file, i) => (
                            <div key={i} className="px-3 py-1.5 bg-apple-gray rounded-full text-[10px] font-bold text-gray-500 flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              {file.name}
                              <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {!isApplying ? (
                    <div className="p-8 bg-accent/5 rounded-[2rem] border border-accent/10 space-y-6">
                      <h3 className="text-xl font-bold text-space-gray">Apply with AI Assistant</h3>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Your Full Name"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                          className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                        <textarea 
                          placeholder="Briefly describe your experience..."
                          value={userData.experience}
                          onChange={(e) => setUserData({...userData, experience: e.target.value})}
                          className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 h-24 resize-none"
                        />
                        <input 
                          type="text" 
                          placeholder="Key Skills (comma separated)"
                          value={userData.skills}
                          onChange={(e) => setUserData({...userData, skills: e.target.value})}
                          className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => generateAIContent('cover')}
                          disabled={isGenerating || !userData.name}
                          className="btn-secondary py-3 text-xs flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Cover Letter
                        </button>
                        <button 
                          onClick={() => setShowCVBuilder(true)}
                          disabled={isGenerating || !userData.name}
                          className="btn-secondary py-3 text-xs flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          CV Builder
                        </button>
                      </div>
                      <button 
                        onClick={() => generateAIContent('match')}
                        disabled={isGenerating || !userData.name}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        Check Job Match
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100 text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">Application Sent!</h3>
                      <p className="text-sm text-green-700/70">Your application for {selectedJob.role} has been submitted to {selectedJob.company}.</p>
                      
                      <div className="p-6 bg-white rounded-3xl border border-green-200 text-left space-y-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <h4 className="font-bold">Next Steps</h4>
                        </div>
                        <p className="text-xs text-gray-500">The employer will review your application and pre-screen your profile. You will be notified if you are shortlisted for an interview or if a contract is sent for your signature.</p>
                      </div>
                      
                      <button onClick={() => setSelectedJob(null)} className="btn-primary w-full py-4 bg-green-600 border-none">Done</button>
                    </div>
                  )}

                  {aiResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white border border-black/[0.05] rounded-3xl shadow-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-accent">
                          {aiResult.type === 'cover' ? 'AI Cover Letter' : aiResult.type === 'cv' ? 'AI CV Structure' : 'AI Match Analysis'}
                        </h4>
                        <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <textarea 
                        value={aiResult.content}
                        onChange={(e) => setAiResult({ ...aiResult, content: e.target.value })}
                        className="w-full h-64 bg-apple-gray/30 border-none rounded-2xl p-4 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-accent/20 resize-none custom-scrollbar"
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setIsApplying(true)}
                          className="flex-1 btn-primary py-3 text-sm"
                        >
                          Apply with this {aiResult.type === 'cover' ? 'Letter' : 'Profile'}
                        </button>
                        <button className="p-3 bg-apple-gray rounded-xl text-gray-500 hover:text-accent transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CV Builder Modal */}
      <AnimatePresence>
        {showCVBuilder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full h-full sm:h-[90vh] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <CVBuilder 
                initialData={userData} 
                onCancel={() => setShowCVBuilder(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Thread Modal (Discord Style) */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-space-gray">Discussion Thread</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Started by {selectedPost.author}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Original Post */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-apple-gray rounded-full flex items-center justify-center text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-space-gray">{selectedPost.author}</p>
                      <p className="text-[10px] text-gray-400">{selectedPost.time}</p>
                    </div>
                  </div>
                  <p className="text-base text-gray-600 leading-relaxed bg-apple-gray/30 p-4 rounded-2xl">{selectedPost.content}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['👍', '❤️', '😮', '👏'].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => handleReaction(selectedPost.id, emoji)}
                        className="px-2.5 py-1 bg-apple-gray/50 hover:bg-apple-gray rounded-full text-xs transition-all flex items-center gap-1.5"
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-bold text-gray-500">{selectedPost.reactions[emoji] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments (Chat Style) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-black/[0.05]" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedPost.comments.length} Comments</span>
                    <div className="h-[1px] flex-1 bg-black/[0.05]" />
                  </div>

                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="w-8 h-8 bg-apple-gray rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 text-xs font-bold">
                        {comment.author[0]}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-space-gray">{comment.author}</span>
                          <span className="text-[10px] text-gray-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-black/[0.05] bg-apple-gray/5">
                <div className="flex items-end gap-3 bg-white border border-black/[0.05] rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                  <button className="p-2 text-gray-400 hover:text-accent transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <textarea 
                    placeholder={`Reply to ${selectedPost.author}...`}
                    value={newCommentContent[selectedPost.id] || ''}
                    onChange={(e) => setNewCommentContent({ ...newCommentContent, [selectedPost.id]: e.target.value })}
                    className="flex-1 bg-transparent border-none p-2 text-sm outline-none resize-none h-10 max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(selectedPost.id);
                      }
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-accent transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleAddComment(selectedPost.id)}
                      className="p-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <h3 className="text-xl font-bold">Ask the Community</h3>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-apple-gray rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-400">
                    <User className="w-6 h-6" />
                  </div>
                  <textarea 
                    placeholder="What's on your mind? Ask a question about HR, compliance, or workplace culture..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1 bg-apple-gray/30 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all resize-none h-40"
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-2">
                    <button className="p-2.5 bg-apple-gray/50 hover:bg-apple-gray rounded-xl text-gray-400 transition-all">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-apple-gray/50 hover:bg-apple-gray rounded-xl text-gray-400 transition-all">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-apple-gray/50 hover:bg-apple-gray rounded-xl text-gray-400 transition-all">
                      <AtSign className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    onClick={handleAddPost}
                    disabled={!newPostContent.trim()}
                    className="btn-primary px-8 py-3 shadow-lg shadow-accent/20 disabled:opacity-50"
                  >
                    Post Question
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
