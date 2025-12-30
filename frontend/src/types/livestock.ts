export interface Livestock {
    id: string;
    tag_id: string;
    name: string;
    species: 'CATTLE' | 'POULTRY' | 'GOAT' | 'SHEEP' | 'OTHER';
    category: 'HEIFER' | 'CALF' | 'BULL' | 'COW' | 'BUCK' | 'DOE' | 'KID' | 'RAM' | 'EWE' | 'LAMB' | 'LAYER' | 'BROILER' | 'KIENYEJI' | 'CHICK' | 'OTHER';
    breed: string;
    sex: 'MALE' | 'FEMALE';
    quantity: number;
    dob: string | null;
    purchase_date: string | null;
    purchase_price: string | null;
    status: 'ACTIVE' | 'SOLD' | 'DECEASED' | 'SICK';
    current_weight: string | null;
    photo: string | null;
    notes: string;
    custom_data?: any;
}
