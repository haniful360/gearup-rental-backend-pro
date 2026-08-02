import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { IGearItemPayload, IGearQueryFilters } from './gear.interface';


const createGearInDB = async (providerId: string, payload: IGearItemPayload) => {
    const result = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId,
        },
    });
    return result;
};

const getAllGearsFromDB = async (query: IGearQueryFilters) => {
    const { searchTerm, location, category, brand, availability, minPrice, maxPrice, page = '1', limit = '10' } = query;

    const andConditions: Prisma.GearItemWhereInput[] = [];

    // searchTerm title, description, brand, location
    if (searchTerm && searchTerm.trim() !== '') {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    // category filter
    if (category && category.trim() !== '') {
        andConditions.push({
            category: {
                OR: [
                    { id: category },
                    { slug: category.toLowerCase() },
                ],
            },
        });
    }

    // brand filter
    if (brand && brand.trim() !== '') {
        andConditions.push({
            brand: { equals: brand, mode: 'insensitive' },
        });
    }

    // location filter
    if (location && location.trim() !== '') {
        andConditions.push({
            location: { equals: location, mode: 'insensitive' },
        });
    }


    //  availability filter
    if (availability && (availability === 'true' || availability === 'false')) {
        andConditions.push({
            isAvailable: availability === 'true',
        });
    }

    // price range filter
    if (minPrice || maxPrice) {
        const priceFilter: Prisma.FloatFilter = {};
        if (minPrice && !isNaN(parseFloat(minPrice))) priceFilter.gte = parseFloat(minPrice);
        if (maxPrice && !isNaN(parseFloat(maxPrice))) priceFilter.lte = parseFloat(maxPrice);

        if (Object.keys(priceFilter).length > 0) {
            andConditions.push({ pricePerDay: priceFilter });
        }
    }


    const whereConditions: Prisma.GearItemWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    // pagination
    const currentPage = Math.max(Number(page), 1);
    const currentLimit = Math.max(Number(limit), 1);
    const skip = (currentPage - 1) * currentLimit;

    const result = await prisma.gearItem.findMany({
        where: whereConditions,
        include: {
            category: true,
        },
        skip,
        take: currentLimit,
        orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.gearItem.count({ where: whereConditions });

    return {
        meta: { page: currentPage, limit: currentLimit, total },
        data: result,
    };
};

const getSingleGearFromDB = async (id: string) => {
    const result = await prisma.gearItem.findUniqueOrThrow({
        where: { id },
        include: {
            category: true,
            provider: {
                select: { id: true, name: true, email: true },
            },
            reviews: {
                include: {
                    customer: { select: { name: true } },
                },
            },
        },
    });
    return result;
};


const updateGearInDB = async (id: string, providerId: string, payload: Partial<IGearItemPayload>) => {
   
    const isGearExist = await prisma.gearItem.findUnique({
        where: { id },
    });

    if (!isGearExist) {
        throw new Error('Gear item not found!');
    }

    if (isGearExist.providerId !== providerId) {
        throw new Error('You are not authorized to update this gear!');
    }

    if (payload.categoryId) {
        const isCategoryExist = await prisma.category.findUnique({
            where: { id: payload.categoryId },
        });

        if (!isCategoryExist) {
            throw new Error('The provided categoryId does not exist in the database! Please check again.');
        }
    }

    const result = await prisma.gearItem.update({
        where: { id },
        data: payload,
    });

    return result;
};

const deleteGearFromDB = async (gearId: string, providerId: string) => {
    const gear = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId },
    });

    if (gear.providerId !== providerId) {
        throw new Error('You are not authorized to delete this gear!');
    }

    await prisma.gearItem.delete({
        where: { id: gearId },
    });

    return null;
};

export const providerGearServices = {
    createGearInDB,
    updateGearInDB,
    deleteGearFromDB,
    getAllGearsFromDB,
    getSingleGearFromDB,
};