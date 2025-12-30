export interface ProduceRecord {
    id: string;
    date: string;
    produce_type: 'MILK' | 'EGGS' | 'MAIZE' | 'OTHER';
    quantity: string; // Decimal from backend comes as string or number? usually string or number depending on serializer. DRF DecimalField -> string usually.
    unit: string;
    morning_yield?: string;
    noon_yield?: string;
    evening_yield?: string;
    crates?: string;
    custom_data?: any;
    created_at: string;
}
