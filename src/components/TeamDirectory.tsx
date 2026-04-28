import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, MapPin, MoreVertical, Phone, Building, Loader2, Sparkles } from 'lucide-react';
import { Employee, UserProfile } from '../types';
import { cn } from '../lib/utils';
import { employeeService } from '../services/employeeService';
import EmployeeProfile from './EmployeeProfile';

interface TeamDirectoryProps {
  onSelectEmployee: (employeeId: string) => void;
  userProfile: UserProfile | null;
}

export default function TeamDirectory({ onSelectEmployee, userProfile }: TeamDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      if (!userProfile?.companyId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await employeeService.getEmployees(userProfile.companyId);
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployees();
  }, [userProfile]);

  if (selectedEmployeeId) {
    return (
      <EmployeeProfile 
        employeeId={selectedEmployeeId} 
        onBack={() => setSelectedEmployeeId(null)}
        userProfile={userProfile}
      />
    );
  }

  const filteredEmployees = employees.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      employee.role.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-gray-500 font-medium">Loading organization directory...</p>
        </div>
      </div>
    );
  }

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-black/[0.05] rounded-xl pl-12 pr-4 py-2.5 md:py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
        />
      </div>

      {/* Employee Table/Cards */}
      <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden shadow-sm">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-apple-gray/50 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-space-gray">No employees found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-accent font-bold text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
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
                  {filteredEmployees.map((employee) => (
                    <tr 
                      key={employee.id} 
                      onClick={() => setSelectedEmployeeId(employee.id)}
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
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md w-fit",
                            employee.status === 'Active' ? "bg-green-50 text-green-600" : 
                            employee.status === 'Onboarding' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                          )}>
                            {employee.status}
                          </span>
                          {employee.status === 'Onboarding' && (
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center justify-between text-[8px] font-bold text-purple-400">
                                <span>PROGRESS</span>
                                <span>35%</span>
                              </div>
                              <div className="h-1 w-16 bg-purple-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }} />
                              </div>
                            </div>
                          )}
                        </div>
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
              {filteredEmployees.map((employee) => (
                <div 
                  key={employee.id}
                  onClick={() => setSelectedEmployeeId(employee.id)}
                  className="p-5 space-y-4 active:bg-apple-gray/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name} 
                        className="w-14 h-14 rounded-2xl object-cover border border-black/[0.05] shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-space-gray text-lg leading-tight">{employee.name}</p>
                        <p className="text-xs font-medium text-accent uppercase tracking-wider mt-0.5">{employee.role}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                      employee.status === 'Active' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {employee.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-apple-gray/50 flex items-center justify-center flex-shrink-0">
                        <Building className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-apple-gray/50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="truncate">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-apple-gray/50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <span>+263 77 000 0000</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-apple-gray/50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <span>{employee.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
