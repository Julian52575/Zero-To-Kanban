   export type ItemStatus = 'todo' | 'doing' | 'done';
   export interface Item {
       id: string; // ou number, selon ton API
       name: string;
       completed: boolean;
       status?: ItemStatus;
   }