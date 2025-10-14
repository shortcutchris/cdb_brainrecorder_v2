import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromptTemplate } from '../types';

const STORAGE_KEY = '@prompt_templates';

// System-defined prompt templates (cannot be deleted)
const SYSTEM_TEMPLATES: PromptTemplate[] = [
  {
    id: 'system-summary',
    name: 'Summary',
    prompt: 'Create a concise summary of the main points.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'system-todo',
    name: 'To-Do List',
    prompt: 'Extract all action items and create a to-do list.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'system-keypoints',
    name: 'Key Points',
    prompt: 'List the key points and takeaways.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'system-questions',
    name: 'Questions',
    prompt: 'Extract all questions mentioned and provide answers if possible.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'system-email',
    name: 'Email Draft',
    prompt: 'Convert this into a professional email.',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
];

interface PromptTemplatesContextType {
  templates: PromptTemplate[];
  systemTemplates: PromptTemplate[];
  userTemplates: PromptTemplate[];
  loading: boolean;
  addTemplate: (name: string, prompt: string) => Promise<void>;
  updateTemplate: (id: string, name: string, prompt: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => PromptTemplate | undefined;
  refresh: () => Promise<void>;
}

const PromptTemplatesContext = createContext<PromptTemplatesContextType | undefined>(undefined);

export function PromptTemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<PromptTemplate[]>(SYSTEM_TEMPLATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userTemplates = JSON.parse(stored) as PromptTemplate[];
        setTemplates([...SYSTEM_TEMPLATES, ...userTemplates]);
      } else {
        setTemplates(SYSTEM_TEMPLATES);
      }
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      setTemplates(SYSTEM_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const saveUserTemplates = async (userTemplates: PromptTemplate[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
    } catch (error) {
      console.error('Error saving prompt templates:', error);
      throw error;
    }
  };

  const addTemplate = async (name: string, prompt: string) => {
    const newTemplate: PromptTemplate = {
      id: `user-${Date.now()}`,
      name,
      prompt,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    const userTemplates = templates.filter(t => !t.isSystem);
    const updatedUserTemplates = [...userTemplates, newTemplate];
    await saveUserTemplates(updatedUserTemplates);
    setTemplates([...SYSTEM_TEMPLATES, ...updatedUserTemplates]);
  };

  const updateTemplate = async (id: string, name: string, prompt: string) => {
    const template = templates.find(t => t.id === id);
    if (!template || template.isSystem) {
      throw new Error('Cannot update system template');
    }

    const userTemplates = templates.filter(t => !t.isSystem);
    const updatedUserTemplates = userTemplates.map(t =>
      t.id === id ? { ...t, name, prompt } : t
    );
    await saveUserTemplates(updatedUserTemplates);
    setTemplates([...SYSTEM_TEMPLATES, ...updatedUserTemplates]);
  };

  const deleteTemplate = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template || template.isSystem) {
      throw new Error('Cannot delete system template');
    }

    const userTemplates = templates.filter(t => !t.isSystem && t.id !== id);
    await saveUserTemplates(userTemplates);
    setTemplates([...SYSTEM_TEMPLATES, ...userTemplates]);
  };

  const getTemplate = (id: string) => {
    return templates.find(t => t.id === id);
  };

  const refresh = async () => {
    await loadTemplates();
  };

  const systemTemplates = templates.filter(t => t.isSystem);
  const userTemplates = templates.filter(t => !t.isSystem);

  return (
    <PromptTemplatesContext.Provider
      value={{
        templates,
        systemTemplates,
        userTemplates,
        loading,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getTemplate,
        refresh,
      }}
    >
      {children}
    </PromptTemplatesContext.Provider>
  );
}

export function usePromptTemplates() {
  const context = useContext(PromptTemplatesContext);
  if (!context) {
    throw new Error('usePromptTemplates must be used within PromptTemplatesProvider');
  }
  return context;
}
