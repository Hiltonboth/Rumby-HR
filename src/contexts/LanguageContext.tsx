import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'sn' | 'nd' | 'zh' | 'af';

interface Translation {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translation = {
  dashboard: { en: 'Dashboard', sn: 'Dhibhodhi', nd: 'Idhibhodi', zh: '仪表板', af: 'Dashboard' },
  employees: { en: 'Employees', sn: 'Vashandi', nd: 'Abasebenzi', zh: '员工', af: 'Werknemers' },
  payroll: { en: 'Payroll', sn: 'Mubhadharo', nd: 'Izihambiso', zh: '工资单', af: 'Betaalstaat' },
  performance: { en: 'Performance', sn: 'Kuita Mashura', nd: 'Ukusebenza', zh: '绩效', af: 'Prestasie' },
  documents: { en: 'Documents', sn: 'Magwaro', nd: 'Amadokhumenti', zh: '文件', af: 'Dokumente' },
  hiring: { en: 'Hiring', sn: 'Kupinza Basa', nd: 'Ukuqatsha', zh: '招聘', af: 'Huur' },
  settings: { en: 'Settings', sn: 'Zvirongwa', nd: 'Izilungiselelo', zh: '设置', af: 'Instellings' },
  logout: { en: 'Log Out', sn: 'Kubuda', nd: 'Phuma', zh: '登出', af: 'Meld uit' },
  welcome: { en: 'Welcome back', sn: 'Mauya zvakare', nd: 'Wamukelekile futhi', zh: '欢迎回来', af: 'Welkom terug' },
  search: { en: 'Search...', sn: 'Tsvaga...', nd: 'Dinga...', zh: '搜索...', af: 'Soek...' },
  actions: { en: 'Actions', sn: 'Zvekuita', nd: 'Izenzo', zh: '操作', af: 'Aksies' },
  save: { en: 'Save Changes', sn: 'Chengetedza', nd: 'Gcina', zh: '保存更改', af: 'Stoor veranderinge' },
  cancel: { en: 'Cancel', sn: 'Kanzura', nd: 'Sula', zh: '取消', af: 'Kanselleer' },
  delete: { en: 'Delete', sn: 'Dzima', nd: 'Susa', zh: '删除', af: 'Skrap' },
  edit: { en: 'Edit', sn: 'Gadziridza', nd: 'Lungisa', zh: '编辑', af: 'Wysig' },
  add: { en: 'Add New', sn: 'Wedzera', nd: 'Engeza', zh: '新增', af: 'Voeg by' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('zivohr_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('zivohr_lang', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
