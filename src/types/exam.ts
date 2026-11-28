export interface ExamInfo { id:string;title:string;duration_minutes:number;xp_reward:number; }
export interface ExamQuestion { id:string;question_text:string;question_type:string;marks:number;chapter?:string;exam_options:{id:string;option_text:string}[]; }
export type ExamAnswers = Record<string,{option_id:string|null;short_answer:string|null}>;
