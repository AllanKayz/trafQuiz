export {};

declare global {
  interface Window {
    electron: {
      getUsers: () => Promise<any[]>;
      addUser: (user: any) => Promise<any>;
      getQuizzes: () => Promise<any[]>;
      addQuiz: (quiz: any) => Promise<any>;
      getResults: () => Promise<any[]>;
      addResult: (result: any) => Promise<any>;
      getInstructors: () => Promise<any[]>;
      addInstructor: (instructor: any) => Promise<any>;
      getPackages: () => Promise<any[]>;
      addPackage: (pkg: any) => Promise<any>;
      getSpecializations: () => Promise<any[]>;
      addSpecialization: (specialization: any) => Promise<any>;
      getCertifications: () => Promise<any[]>;
      addCertification: (certification: any) => Promise<any>;
      updateUser: (user: any) => Promise<any>;
      updateQuiz: (quiz: any) => Promise<any>;
      updateInstructor: (instructor: any) => Promise<any>;
      updateSpecialization: (specialization: any) => Promise<any>;
      updateCertification: (certification: any) => Promise<any>;
      deleteUser: (userId: number) => Promise<any>;
      deleteQuiz: (quizId: number) => Promise<any>;
      deleteInstructor: (instructorId: number) => Promise<any>;
      fetchExam: (token: any) => Promise<any[]>;
      fetchExamDuration: () => Promise<number>;
      setExamTimeframe: (time: any) => Promise<any>;
      sync: () => Promise<any>;
      login: (credentials: any) => Promise<any>;
    };
  }
}
