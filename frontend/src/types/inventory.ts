export interface Tool {
    id: string;
    name: string;
    category: string;
    sku: string;
    quantity: number;
    condition: 'NEW' | 'GOOD' | 'NEEDS_REPAIR' | 'BROKEN';
    location: string;
    purchase_date: string | null;
    purchase_price: string | null;
    photo: string | null;
    notes: string;
}

export interface Consumable {
    id: string;
    item_name: string;
    sku: string;
    unit: string;
    quantity_on_hand: string;
    reorder_threshold: string;
    unit_price: string | null;
}
