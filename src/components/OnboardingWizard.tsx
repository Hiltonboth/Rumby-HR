import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  PartyPopper, 
  FileText, 
  User, 
  Mail,
  X,
  FileCheck,
  Users,
  AlertCircle,
  Download,
  GripVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface OnboardingWizardProps {
  userId: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
}

interface OnboardingDoc {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'verified' | 'error';
  type: string;
  progress: number;
  error?: string;
}

interface TaskItemProps {
  key?: string | number;
  task: OnboardingTask;
  onToggle: (id: string) => void;
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50
      }}
      className="relative touch-none"
    >
      <div
        className={cn(
          "w-full p-4 rounded-2xl border transition-all flex items-center justify-between text-left bg-white",
          task.completed 
            ? "bg-green-50 border-green-100 text-green-700" 
            : "border-black/[0.05] text-gray-600 hover:border-accent/20"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <div 
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing p-2 -ml-2 hover:bg-apple-gray rounded-xl transition-colors text-gray-400"
            title="Drag to reorder tasks"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <button
            onClick={() => onToggle(task.id)}
            className="flex items-center gap-3 flex-1 text-left"
            title={task.completed ? "Mark as incomplete" : "Mark as completed"}
          >
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300" />
            )}
            <span className={cn("font-bold", task.completed && "line-through opacity-60")}>
              {task.title}
            </span>
          </button>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
      </div>
    </Reorder.Item>
  );
}

export default function OnboardingWizard({ userId, onComplete, onCancel }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    { id: '1', title: 'Complete personal profile', completed: false },
    { id: '2', title: 'Review employee handbook', completed: false },
    { id: '3', title: 'Set up direct deposit', completed: false },
    { id: '4', title: 'Sign non-disclosure agreement', completed: false },
    { id: '5', title: 'Meet the team', completed: false },
  ]);
  const [docs, setDocs] = useState<OnboardingDoc[]>([
    { id: '1', name: 'Identity Proof (Passport/ID)', status: 'pending', type: '.jpg,.jpeg,.png,.pdf', progress: 0 },
    { id: '2', name: 'Tax Documents', status: 'pending', type: '.pdf', progress: 0 },
    { id: '3', name: 'Signed Contract', status: 'pending', type: '.pdf', progress: 0 },
  ]);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    // Fetch welcome message or user info if needed
    const fetchUserInfo = async () => {
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setWelcomeMessage(`Welcome to the team, ${data.fullName}! We're thrilled to have you on board. This wizard will guide you through your first steps at Rumby HR.`);
      }
    };
    fetchUserInfo();
  }, [userId]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleFileClick = (id: string) => {
    const doc = docs.find(d => d.id === id);
    if (doc) {
      setActiveDocId(id);
      if (fileInputRef.current) {
        fileInputRef.current.accept = doc.type;
        fileInputRef.current.click();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocId) return;

    // Validation
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      setDocs(docs.map(d => d.id === activeDocId ? { ...d, status: 'error', error: 'File too large. Maximum size is 10MB.' } : d));
      return;
    }

    // Start upload simulation
    setDocs(docs.map(d => d.id === activeDocId ? { ...d, status: 'uploading', progress: 0, error: undefined } : d));
    setIsUploading(activeDocId);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 30;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDocs(prev => prev.map(d => d.id === activeDocId ? { ...d, status: 'uploaded', progress: 100 } : d));
        setIsUploading(null);
        setActiveDocId(null);
      } else {
        setDocs(prev => prev.map(d => d.id === activeDocId ? { ...d, progress: currentProgress } : d));
      }
    }, 300);

    // Reset input
    e.target.value = '';
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / totalSteps) * 100;

  // Auto-advance when all tasks are completed in step 2
  useEffect(() => {
    if (step === 2) {
      const allCompleted = tasks.every(t => t.completed);
      if (allCompleted) {
        const timer = setTimeout(() => {
          nextStep();
        }, 1500); // 1.5 second delay
        return () => clearTimeout(timer);
      }
    }
  }, [tasks, step]);

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:p-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/[0.03] md:border-none md:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            <PartyPopper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Onboarding</h2>
            <p className="text-xs text-gray-400 font-medium">Step {step} of {totalSteps}</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-apple-gray/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 md:px-0 md:max-w-2xl md:mx-auto w-full mb-8">
        <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-accent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 md:max-w-2xl md:mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Welcome Aboard!</h1>
                <p className="text-gray-500 leading-relaxed text-lg">
                  {welcomeMessage || "We're excited to start this journey with you. Let's get you set up for success."}
                </p>
              </div>
              
              <div className="card-aura p-6 bg-accent/5 border-accent/10 space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Mail className="w-5 h-5" />
                  <span className="font-bold">Automated Welcome Email</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  A welcome package has been sent to your registered email address. It contains your login credentials and a digital copy of the employee handbook.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-black/[0.05] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Role</p>
                    <p className="font-bold text-sm">Product Designer</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl border border-black/[0.05] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Team</p>
                    <p className="font-bold text-sm">Design & UX</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Task Checklist</h1>
                <p className="text-gray-500">Please complete these essential tasks to get started.</p>
              </div>

              {/* Task Progress Indicator */}
              <div className="p-5 rounded-3xl bg-apple-gray/30 border border-black/[0.03] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-space-gray">Progress</span>
                  <span className="text-xs font-black text-accent uppercase tracking-widest">
                    {tasks.filter(t => t.completed).length} of {tasks.length} Completed
                  </span>
                </div>
                <div className="h-2 w-full bg-apple-gray rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                    className="h-full bg-accent"
                  />
                </div>
              </div>

              <Reorder.Group 
                axis="y" 
                values={tasks} 
                onReorder={setTasks}
                className="space-y-3"
              >
                {tasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                  />
                ))}
              </Reorder.Group>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
                <p className="text-gray-500">Securely upload your required documents for verification.</p>
              </div>

              <div className="space-y-4">
                {docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-5 rounded-[2rem] border border-black/[0.05] bg-white space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          doc.status === 'pending' || doc.status === 'uploading' ? "bg-apple-gray text-gray-400" : 
                          doc.status === 'error' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                        )}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{doc.name}</p>
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            doc.status === 'pending' ? "text-gray-400" :
                            doc.status === 'uploading' ? "text-accent" :
                            doc.status === 'error' ? "text-red-500" : "text-green-600"
                          )}>
                            {doc.status === 'pending' ? 'Required' : 
                             doc.status === 'uploading' ? `Uploading ${Math.round(doc.progress)}%` : 
                             doc.status === 'error' ? 'Upload Failed' : 'Uploaded'}
                          </p>
                        </div>
                      </div>
                      {(doc.status === 'uploaded' || doc.status === 'verified') && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              // Mock download
                              const blob = new Blob(['Mock document content for ' + doc.name], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="p-2 hover:bg-apple-gray rounded-lg text-gray-400 hover:text-accent transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <FileCheck className="w-4 h-4" />
                            {doc.status === 'verified' ? 'Verified' : 'Pending Review'}
                          </div>
                        </div>
                      )}
                    </div>

                    {doc.status === 'uploading' && (
                      <div className="h-1.5 w-full bg-apple-gray rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${doc.progress}%` }}
                          className="h-full bg-accent"
                        />
                      </div>
                    )}

                    {(doc.status === 'pending' || doc.status === 'error') && (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleFileClick(doc.id)}
                          className={cn(
                            "w-full py-3 rounded-xl border-2 border-dashed text-accent font-bold text-sm flex items-center justify-center gap-2 transition-all",
                            doc.status === 'error' ? "border-red-200 bg-red-50 text-red-600" : "border-accent/20 hover:bg-accent/5"
                          )}
                        >
                          <Upload className="w-4 h-4" />
                          {doc.status === 'error' ? 'Try Again' : 'Choose File'}
                        </button>
                        {doc.error && (
                          <div className="flex items-center gap-2 text-red-600 text-xs font-bold px-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {doc.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center text-accent mx-auto">
                <PartyPopper className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">You're All Set!</h1>
                <p className="text-gray-500 text-lg max-w-sm mx-auto">
                  You've completed the initial onboarding process. Your manager will review your documents shortly.
                </p>
              </div>
              
              <div className="card-aura p-6 bg-apple-gray/30 space-y-4 text-left max-w-md mx-auto">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Next Steps</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Join the team Slack channel
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Attend the Monday morning standup
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Complete your first training module
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-xl border-t border-black/[0.03] flex items-center justify-between md:relative md:bg-transparent md:border-none md:p-0 md:mt-auto md:pb-8 md:max-w-2xl md:mx-auto">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-space-gray transition-colors disabled:opacity-0"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={nextStep}
          className="btn-primary px-10 py-4 text-lg flex items-center gap-2 shadow-xl shadow-accent/20"
        >
          {step === totalSteps ? 'Finish' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
