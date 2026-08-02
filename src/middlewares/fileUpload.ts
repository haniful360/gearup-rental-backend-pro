import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import {
    uploadMultipleToCloudinary,
    uploadToCloudinary,
} from "../utils/cloudinaryUpload";

const storage = multer.memoryStorage();

const imageFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"));
    }
};

const upload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadMultipleImages = upload.array("images", 6);

export const uploadSingleImage = upload.single("photo");

export const uploadCategoryImage = upload.single("image");

export const parseGearFormData = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const files = req.files as Express.Multer.File[] | undefined;

        if (files && files.length > 0) {
            const urls = await uploadMultipleToCloudinary(files, "gears");
            req.body.images = urls;
        }

        if (req.body.pricePerDay !== undefined) {
            req.body.pricePerDay = Number(req.body.pricePerDay);
        }
        if (req.body.stock !== undefined) {
            req.body.stock = Number(req.body.stock);
        }
        if (req.body.isFeature !== undefined) {
            req.body.isFeature =
                req.body.isFeature === true || req.body.isFeature === "true";
        }
        if (req.body.isAvailable !== undefined) {
            req.body.isAvailable =
                req.body.isAvailable === true ||
                req.body.isAvailable === "true";
        }

        next();
    },
);

export const parseProfilePhoto = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file as Express.Multer.File | undefined;

        if (file) {
            const url = await uploadToCloudinary(file, "profiles");
            req.body.photo = url;
        }

        next();
    },
);

export const parseCategoryImage = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const file = req.file as Express.Multer.File | undefined;

        if (file) {
            const url = await uploadToCloudinary(file, "categories");
            req.body.image = url;
        }

        next();
    },
);
