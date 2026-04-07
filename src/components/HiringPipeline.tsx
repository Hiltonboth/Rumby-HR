import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Star, Briefcase, LayoutGrid, List, ChevronRight, Mail, Phone } from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { cn } from '../lib/utils';

const stages = ['Applied', 'Screening', 'Interviewing', 'Offer Sent', 'Hired'];

export default function HiringPipeline() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-space-gray">Recruitment</h1>
          <p className="text-gray-500 mt-1">Track and manage your hiring pipeline from application to hire.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-black/[0.05] rounded-xl p-1 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'kanban' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Job Opening
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search candidates by name or role..."
          className="w-full bg-white border border-black/[0.05] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-apple-gray/30 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05]">
                  <th className="px-6 py-4 font-bold">Candidate</th>
                  <th className="px-6 py-4 font-bold">Applied For</th>
                  <th className="px-6 py-4 font-bold">Current Stage</th>
                  <th className="px-6 py-4 font-bold">Score</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {MOCK_CANDIDATES.map((candidate) => (
                  <tr key={candidate.id} className="group hover:bg-apple-gray/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-space-gray">{candidate.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {candidate.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-space-gray">{candidate.role}</p>
                      <p className="text-xs text-gray-500">Engineering Dept</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                        candidate.status === 'Hired' ? "bg-green-50 text-green-600" :
                        candidate.status === 'Offer Sent' ? "bg-blue-50 text-blue-600" :
                        candidate.status === 'Interviewing' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                        <Star className="w-4 h-4 fill-current" />
                        {candidate.score}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-gray-400">
                        <Mail className="w-4 h-4 hover:text-accent transition-colors" />
                        <Phone className="w-4 h-4 hover:text-accent transition-colors" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-300 hover:text-space-gray transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 no-scrollbar">
          {stages.map((stage) => (
            <div key={stage} className="flex-shrink-0 w-80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-space-gray uppercase tracking-widest">{stage}</h3>
                  <span className="px-2 py-0.5 bg-apple-gray text-gray-500 text-[10px] font-bold rounded-full">
                    {MOCK_CANDIDATES.filter(c => c.status === stage).length}
                  </span>
                </div>
              </div>

              <div className="space-y-4 min-h-[500px] p-2 bg-apple-gray/30 rounded-2xl border border-black/[0.02]">
                {MOCK_CANDIDATES.filter(c => c.status === stage).map((candidate) => (
                  <div key={candidate.id} className="bg-white border border-black/[0.05] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        <Star className="w-3 h-3 fill-current" />
                        {candidate.score}
                      </div>
                    </div>
                    <h4 className="font-bold text-space-gray">{candidate.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{candidate.role}</p>
                    <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {[1, 2].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Reviewer" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <button className="text-gray-400 hover:text-space-gray">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
