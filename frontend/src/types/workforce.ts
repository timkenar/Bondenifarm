export interface Worker {
    id: string;
    full_name: string;
    national_id: string;
    role: string;
    employment_type?: string;
    phone: string;
    address: string;
    hired_date: string | null;
    salary: string;
    notes: string;
    custom_data?: any;
}

export interface Attendance {
    id: string;
    worker: string; // Worker ID
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    task_notes: string;
}
