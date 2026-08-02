import { prisma } from '../../lib/prisma';


const createCategoryInDB = async (payload: { name: string; description?: string; image?: string }) => {
    const slug = payload.name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

    const result = await prisma.category.create({
        data: {
            name: payload.name,
            slug,
            description: payload.description,
            image: payload.image,
        },
    });
    return result;
};


const getAllCategoriesFromDB = async () => {
    const result = await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });
    return result;
};

const getSingleCategoryFromDB = async (id: string) => {
    const result = await prisma.category.findUniqueOrThrow({
        where: { id },
        include: {
            gearItems: true,
        },
    });
    return result;
};


const updateCategoryInDB = async (id: string, payload: { name?: string; description?: string; image?: string }) => {
    let slug;
    if (payload.name) {
        slug = payload.name
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    }

    const result = await prisma.category.update({
        where: { id },
        data: {
            ...payload,
            ...(slug && { slug }),
        },
    });
    return result;
};


const deleteCategoryFromDB = async (id: string) => {
    const result = await prisma.category.delete({
        where: { id },
    });
    return result;
};

export const CategoryServices = {
    createCategoryInDB,
    getAllCategoriesFromDB,
    getSingleCategoryFromDB,
    updateCategoryInDB,
    deleteCategoryFromDB,
};