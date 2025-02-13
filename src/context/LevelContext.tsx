// LevelsContext.tsx

import React, { createContext, ReactNode, useState } from 'react';

import { generateLevels, Level } from '@/services/constants';

interface LevelsContextProps {
  levels: Level[];
  updateTaskCompletion: (levelId: number, taskId: number) => void;
}

export const LevelsContext = createContext<LevelsContextProps>({
  levels: [],
  updateTaskCompletion: () => {},
});

export const LevelsProvider: React.FC<any> = ({ children }) => {
  const [levels, setLevels] = useState<Level[]>(generateLevels());

  const updateTaskCompletion = (levelId: number, taskId: number) => {
    setLevels((prevLevels) => {
      const newLevels = prevLevels.map((level) => {
        if (level.id === levelId) {
          const updatedTasks = level.tasks.map((task) => {
            if (task.id === taskId) {
              return { ...task, isCompleted: true };
            }
            return task;
          });
          const completedTasks = updatedTasks.filter(
            (task) => task.isCompleted,
          ).length;
          const progress = (completedTasks / updatedTasks.length) * 100;
          return { ...level, tasks: updatedTasks, progress };
        }
        return level;
      });
      return newLevels;
    });
  };

  return (
    <LevelsContext.Provider value={{ levels, updateTaskCompletion }}>
      {children}
    </LevelsContext.Provider>
  );
};
