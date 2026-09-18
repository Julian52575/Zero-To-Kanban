export type Status = 'backlog' | 'doing' | 'review' | 'completed'

export interface Item {
    id: string;
    name: string;
    status: Status;
}
