export interface IAdminUserQuery {
    page?: string;
    limit?: string;
    role?: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
    status?: 'active' | 'suspended';
    searchTerm?: string;
}

export interface IAdminGearQuery {
    page?: string;
    limit?: string;
    searchTerm?: string;
}

export interface IAdminRentalQuery {
    page?: string;
    limit?: string;
}
