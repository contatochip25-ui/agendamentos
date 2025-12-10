export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number; // in minutes
  description: string;
  tags: string[];
  status: 'scheduled' | 'completed';
  location?: string;
}

export type MeetingFormData = Omit<Meeting, 'id' | 'status'>;

export interface FilterState {
  status: 'all' | 'scheduled' | 'completed';
  search: string;
}
