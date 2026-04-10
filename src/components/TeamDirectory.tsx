import React from 'react';
import { Search, Plus, Filter, Mail, MapPin, MoreVertical, Phone, Building } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee } from '../types';
import { cn } from '../lib/utils';

interface TeamDirectoryProps {
  onSelectEmployee: (employee: Employee) => void;
}

export default function TeamDirectory({ onSelectEmployee }: TeamDirectoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-space-gray">Organization</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all employees and their information in one place.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 md:px-6 text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 md:px-6 text-sm">
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name, role, or department..."
          className="w-full bg-white border border-black/[0.05] rounded-xl pl-12 pr-4 py-2.5 md:py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
        />
      </div>

      {/* Employee Table/Cards */}
      <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-apple-gray/30 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05]">
                <th className="px-6 py-4 font-bold">Employee</th>
                <th className="px-6 py-4 font-bold">Role & Dept</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {MOCK_EMPLOYEES.map((employee) => (
                <tr 
                  key={employee.id} 
                  onClick={() => onSelectEmployee(employee)}
                  className="group hover:bg-apple-gray/20 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name} 
                        className="w-10 h-10 rounded-xl object-cover border border-black/[0.05]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-space-gray">{employee.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {employee.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-space-gray">{employee.role}</p>
                    <p className="text-xs text-gray-500">{employee.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        +1 (555) 000-0000
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {employee.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md",
                      employee.status === 'Active' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-300 hover:text-space-gray transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-black/[0.05]">
          {MOCK_EMPLOYEES.map((employee) => (
            <div 
              key={employee.id}
              onClick={() => onSelectEmployee(employee)}
              className="p-4 space-y-4 active:bg-apple-gray/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={employee.avatar} 
                    alt={employee.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-black/[0.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-space-gray">{employee.name}</p>
                    <p className="text-xs text-gray-500">{employee.role}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md",
                  employee.status === 'Active' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                )}>
                  {employee.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Building className="w-3.5 h-3.5" />
                  {employee.department}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {employee.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
