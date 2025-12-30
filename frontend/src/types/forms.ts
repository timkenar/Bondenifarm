export interface LivestockFormData {
    tag_id: string;
    name: string;
    species: 'CATTLE' | 'CHICKEN' | 'GOAT' | 'SHEEP' | 'OTHER';
    breed: string;
    sex: 'MALE' | 'FEMALE';
    status: 'ACTIVE' | 'SOLD' | 'DECEASED' | 'SICK';
    current_weight: string;
}
