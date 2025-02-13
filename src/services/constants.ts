// constants.ts

export interface Question {
  id: number;
  text: string;
  exampleVideoUri: string;
}

export interface Task {
  id: number;
  question: Question;
  isCompleted: boolean;
}

export interface Level {
  id: number;
  tasks: Task[];
  progress: number; // 0 ile 100 arasında bir değer
}

export const generateLevels = (): Level[] => {
  const levels: Level[] = [];

  for (let levelId = 1; levelId <= 6; levelId++) {
    const tasks: Task[] = [];
    for (let taskId = 1; taskId <= 10; taskId++) {
      tasks.push({
        id: taskId,
        question: {
          id: taskId,
          text: `Seviye ${levelId} - Görev ${taskId}`,
          exampleVideoUri: require('../theme/assets/trr.mp4'),
        },
        isCompleted: levelId === 1 && taskId < 9 ? true : false,
      });
    }
    levels.push({
      id: levelId,
      tasks,
      progress: 0,
    });
  }

  return levels;
};

export const levels: Level[] = generateLevels();
