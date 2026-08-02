export interface IGearItemPayload {
    title: string;
    description: string;
    pricePerDay: number;
    location: string;
    brand: string;
    stock?: number;
    isFeature?: boolean;
    images?: string[];
    categoryId: string;
}

export interface IGearQueryFilters {
    searchTerm?: string;
    category?: string;
    brand?: string;
    availability?: 'true' | 'false';
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    page?: string;
    limit?: string;
}