export interface Sale {
    id: string;
    product: 'EGGS' | 'MILK' | 'TOMATOES' | 'MANURE' | 'OTHER';
    quantity: string;
    unit: string;
    unit_price: string;
    total_amount: string;
    customer_name: string;
    payment_status: 'PAID' | 'PARTIAL' | 'PENDING';
    date: string;
}

export interface Purchase {
    id: string;
    supplier: string;
    total_amount: string;
    date: string;
    items: any; // JSON
    custom_data?: any;
}

export interface Expenditure {
    id: string;
    category: 'FEED' | 'LABOR' | 'FUEL' | 'MAINTENANCE' | 'TREATMENT' | 'OTHER';
    amount: string;
    description: string;
    date: string;
    custom_data?: any;
}
