"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_cloudfront_1 = require("@aws-sdk/client-cloudfront");
const client_s3_1 = require("@aws-sdk/client-s3");
class MediaService {
    constructor() {
        this.BUCKET_NAME = process.env.S3_BUCKET_NAME;
        this.AWS_REGION = process.env.AWS_REGION;
        this.AWS_ACCESS_KEY = process.env.S3_ACCESS_KEY;
        this.AWS_SECRET_KEY = process.env.S3_SECRET_KEY;
        this.CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
        this.S3 = new client_s3_1.S3Client({
            region: this.AWS_REGION,
            credentials: {
                accessKeyId: String(this.AWS_ACCESS_KEY),
                secretAccessKey: String(this.AWS_SECRET_KEY),
            },
        });
        this.cloudFront = new client_cloudfront_1.CloudFrontClient({
            region: this.AWS_REGION,
            credentials: {
                accessKeyId: String(this.AWS_ACCESS_KEY),
                secretAccessKey: String(this.AWS_SECRET_KEY),
            },
        });
    }
    invalidateFileCache(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const path = [`/${filename}`];
                const cmd = new client_cloudfront_1.CreateInvalidationCommand({
                    DistributionId: this.CLOUDFRONT_DISTRIBUTION_ID,
                    InvalidationBatch: {
                        CallerReference: new Date().getTime().toString(),
                        Paths: { Quantity: path.length, Items: path },
                    },
                });
                yield this.cloudFront.send(cmd);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    uploadMedia(file, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const fileSplit = (_a = file === null || file === void 0 ? void 0 : file.name) === null || _a === void 0 ? void 0 : _a.split(".");
                    const fileType = fileSplit[fileSplit.length - 1];
                    const fileName = `${new Date().getTime()}.${fileType}`;
                    const params = {
                        Bucket: this.BUCKET_NAME,
                        Key: `${folder || "common"}${fileName}`,
                        Body: file === null || file === void 0 ? void 0 : file.data,
                        ContentType: file.mimetype,
                    };
                    const command = new client_s3_1.PutObjectCommand(params);
                    yield this.S3.send(command);
                    yield this.invalidateFileCache(`${params === null || params === void 0 ? void 0 : params.Key}`);
                    resolve({
                        url: new URL(`${params === null || params === void 0 ? void 0 : params.Key}`, process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN).toString(),
                        path: `${params === null || params === void 0 ? void 0 : params.Key}`,
                    });
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    multiPartUpload(file, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileSplit = file.name.split(".");
                const fileType = fileSplit[fileSplit.length - 1];
                const fileName = `${new Date().getTime()}.${fileType}`;
                const params = {
                    Bucket: this.BUCKET_NAME,
                    Key: `${folder || "common"}/${fileName}`,
                    Body: file.data,
                    ContentType: file.mimetype,
                };
                const multipartUploadResponse = yield this.S3.send(new client_s3_1.CreateMultipartUploadCommand(params));
                const uploadId = multipartUploadResponse.UploadId;
                const fileSize = file.data.length;
                const partSize = 1024 * 1024 * 1;
                const numParts = Math.ceil(fileSize / partSize);
                const partPromises = [];
                for (let i = 0; i < numParts; i++) {
                    const start = i * partSize;
                    const end = Math.min(start + partSize, fileSize);
                    const partParams = {
                        Bucket: this.BUCKET_NAME,
                        Key: `${folder || "common"}/${fileName}`,
                        UploadId: uploadId,
                        PartNumber: i + 1,
                        Body: file.data.slice(start, end),
                    };
                    const partPromise = this.S3.send(new client_s3_1.UploadPartCommand(partParams));
                    partPromises.push(partPromise);
                }
                const partData = yield Promise.all(partPromises);
                const parts = partData.map(({ ETag, PartNumber }) => ({
                    ETag,
                    PartNumber,
                }));
                const completeParams = {
                    Bucket: this.BUCKET_NAME,
                    Key: `${folder || "common"}/${fileName}`,
                    UploadId: uploadId,
                    MultipartUpload: { Parts: parts },
                };
                yield this.S3.send(new client_s3_1.CompleteMultipartUploadCommand(completeParams));
                yield this.invalidateFileCache(`${params.Key}`);
                const url = new URL(`${params.Key}`, process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN).toString();
                return { url, path: `${params.Key}` };
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    deleteMedia(path) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Bucket: this.BUCKET_NAME,
                    Key: path,
                };
                const deleteData = new client_s3_1.DeleteObjectCommand(Object.assign({}, params));
                yield this.S3.send(deleteData);
                yield this.invalidateFileCache(params.Key);
                resolve();
            }
            catch (error) {
                resolve();
            }
        }));
    }
    deleteMultipleMedia(paths) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.DeleteObjectsCommand({
                    Bucket: this.BUCKET_NAME,
                    Delete: {
                        Objects: paths.map((item) => {
                            return { Key: item };
                        }),
                    },
                });
                yield this.S3.send(command);
                const path = paths === null || paths === void 0 ? void 0 : paths.map((item) => `/${item}`);
                const cmd = new client_cloudfront_1.CreateInvalidationCommand({
                    DistributionId: this.CLOUDFRONT_DISTRIBUTION_ID,
                    InvalidationBatch: {
                        CallerReference: new Date().getTime().toString(),
                        Paths: { Quantity: path.length, Items: path },
                    },
                });
                yield this.cloudFront.send(cmd);
                resolve();
            }
            catch (error) {
                resolve();
            }
        }));
    }
    uploadMultipleMedia({ files, folder, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let resultArray = [];
                    for (const file of files) {
                        const fileSplit = file.name.split(".");
                        const fileType = fileSplit[fileSplit.length - 1];
                        const fileName = `${new Date().getTime()}.${fileType}`;
                        const params = {
                            Bucket: this.BUCKET_NAME,
                            Key: `${folder || "common"}/${fileName}`,
                            Body: file.data,
                            ContentType: file.mimetype,
                        };
                        const objectSetUp = new client_s3_1.PutObjectCommand(Object.assign({}, params));
                        yield this.S3.send(objectSetUp);
                        yield this.invalidateFileCache(`${params === null || params === void 0 ? void 0 : params.Key}`);
                        resultArray.push({
                            path: `${params === null || params === void 0 ? void 0 : params.Key}`,
                            url: new URL(`${params === null || params === void 0 ? void 0 : params.Key}`, process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN).toString(),
                        });
                    }
                    resolve(resultArray);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.default = MediaService;
