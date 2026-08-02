import { cloudinary } from "../lib/cloudinary";

export const uploadToCloudinary = (
    file: Express.Multer.File,
    folder: string,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (error, result) => {
                if (error || !result) {
                    reject(error ?? new Error("Image upload failed"));
                    return;
                }
                resolve(result.secure_url);
            },
        );
        stream.end(file.buffer);
    });
};

export const uploadMultipleToCloudinary = (
    files: Express.Multer.File[],
    folder: string,
): Promise<string[]> => {
    const uploads = files.map((file) => uploadToCloudinary(file, folder));
    return Promise.all(uploads);
};
