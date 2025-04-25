// import {
//   accessKey,
//   bucketName,
//   cloudFont,
//   cloudFontDistribution,
//   region,
//   secretKey,
// } from "../config";

// import {
//   CloudFrontClient,
//   CreateInvalidationCommand,
// } from "@aws-sdk/client-cloudfront";
// import {
//   CompleteMultipartUploadCommand,
//   CreateMultipartUploadCommand,
//   DeleteObjectCommand,
//   DeleteObjectsCommand,
//   PutObjectCommand,
//   S3Client,
//   UploadPartCommand,
// } from "@aws-sdk/client-s3";
// export default class MediaStoreService {
//   private s3;
//   private cloudFont;

//   constructor() {
//     this.s3 = new S3Client({
//       region,
//       credentials: {
//         accessKeyId: accessKey,
//         secretAccessKey: secretKey,
//       },
//     });
//     this.cloudFont = new CloudFrontClient({
//       region,
//       credentials: {
//         accessKeyId: accessKey,
//         secretAccessKey: secretKey,
//       },
//     });
//   }
//   private async invalidateFileCache(filename: string) {
//     try {
//       const path = [`/${filename}`];
//       const cmd = new CreateInvalidationCommand({
//         DistributionId: cloudFontDistribution,
//         InvalidationBatch: {
//           CallerReference: new Date().getTime().toString(),
//           Paths: { Quantity: path.length, Items: path },
//         },
//       });
//       await this.cloudFont.send(cmd);
//     } catch (error) {
//       return false;
//     }
//   }

//   async delete({ key }: { key: string }): Promise<any> {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const params = {
//           Bucket: `${bucketName}`,
//           Key: key,
//         };

//         const deleteData = new DeleteObjectCommand({
//           ...params,
//         });
//         // DELETE FROM S3 BUCKET
//         await this.s3.send(deleteData);
//         // INVALIDATE THE CLOUD FRONT CACHE
//         await this.invalidateFileCache(key);
//         return resolve(true);
//       } catch (error) {
//         new Error();
//         return resolve(false);
//       }
//     });
//   }
//   // update Image
//   async updateImage({ path, file }: { file: any; path: string }): Promise<any> {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const params = {
//           Bucket: `${bucketName}`,
//           Key: path,
//           Body: file?.data,
//           ContentType: file.mimetype,
//         };

//         const objectSetUp = new PutObjectCommand({
//           ...params,
//         });
//         const data = await this.s3.send(objectSetUp);

//         await this.invalidateFileCache(path);

//         return resolve(data);
//       } catch (error) {
//         new Error();
//         return resolve(false);
//       }
//     });
//   }

//   public async upload({ file, dir }: { file: any; dir: string }): Promise<
//     | {
//         key: string;
//         Location: string;
//         allData: any;
//       }
//     | boolean
//   > {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const fileSplit = file.name.split(".");
//         const fileType = fileSplit[fileSplit.length - 1];
//         const fileName = `${new Date().getTime()}.${fileType}`;
//         const params = {
//           Bucket: `${bucketName}`,
//           Key: `${dir}/${fileName}`,
//           Body: file?.data,
//           ContentType: file.mimetype,
//         };

//         const objectSetUp = new PutObjectCommand({
//           ...params,
//         });
//         const data = await this.s3.send(objectSetUp);
//         await this.invalidateFileCache(`${params?.Key}`);
//         // console.log(cloudFont);
//         return resolve({
//           key: `${cloudFont}/${params?.Key}`,
//           Location: `${params?.Key}`,
//           allData: data,
//         });
//       } catch (error) {
//         return resolve(false);
//       }
//     });
//   }

//   async newUpload({ file, dir }: { file: any; dir: string }) {
//     const fileSplit = file.name.split(".");
//     const fileType = fileSplit[fileSplit.length - 1];
//     const fileName = `${new Date().getTime()}.${fileType}`;
//     const params = {
//       Bucket: `${bucketName}`,
//       Key: `${dir}/${fileName}`,
//       Body: file?.data,
//       ContentType: file.mimetype,
//     };

//     const multipartUploadResponse = await this.s3.send(
//       new CreateMultipartUploadCommand(params)
//     );
//     const uploadId = multipartUploadResponse.UploadId;

//     const fileSize = fs.statSync(file?.data).size;
//     const partSize = 1024 * 1024 * 1; // 5 MB per part

//     // Divide the file into parts
//     const numParts = Math.ceil(fileSize / partSize);

//     // Upload each part
//     const partPromises = [];
//     for (let i = 0; i < numParts; i++) {
//       const start = i * partSize;
//       const end = Math.min(start + partSize, fileSize);

//       const partParams = {
//         ...params,
//         UploadId: uploadId,
//         PartNumber: i + 1,
//         Body: fs.createReadStream(file?.data, { start, end }),
//         ContentLength: end - start,
//       };

//       const partPromise = this.s3.send(new UploadPartCommand(partParams));
//       partPromises.push(partPromise);
//     }

//     // Wait for all parts to upload
//     const data = await Promise.all(partPromises);

//     const parts = data.map(({ ETag, PartNumber }: any) => ({
//       ETag,
//       PartNumber,
//     }));

//     // Complete the multipart upload
//     const completeParams = {
//       ...params,
//       UploadId: uploadId,
//       MultipartUpload: { Parts: parts },
//     };

//     const completeResponse = await this.s3.send(
//       new CompleteMultipartUploadCommand(completeParams)
//     );
//   }

//   //delete multiple media
//   public deleteMultipleMedia(paths: string[]): Promise<void> {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const command = new DeleteObjectsCommand({
//           Bucket: `${bucketName}`,
//           Delete: {
//             Objects: paths.map((item) => {
//               return { Key: item };
//             }),
//           },
//         });

//         await this.s3.send(command);

//         const path = paths?.map((item) => `/${item}`);
//         const cmd = new CreateInvalidationCommand({
//           DistributionId: cloudFontDistribution,
//           InvalidationBatch: {
//             CallerReference: new Date().getTime().toString(),
//             Paths: { Quantity: path.length, Items: path },
//           },
//         });
//         await this.cloudFont.send(cmd);
//         resolve();
//       } catch (error) {
//         resolve();
//       }
//     });
//   }
// }

import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";

// import { UploadedFile } from "express-fileupload";

export default class MediaService {
  private BUCKET_NAME;

  private AWS_REGION;

  private AWS_ACCESS_KEY;

  private AWS_SECRET_KEY;

  private S3;

  private cloudFront;

  private CLOUDFRONT_DISTRIBUTION_ID;

  constructor() {
    this.BUCKET_NAME = process.env.S3_BUCKET_NAME;

    this.AWS_REGION = process.env.AWS_REGION;

    this.AWS_ACCESS_KEY = process.env.S3_ACCESS_KEY;

    this.AWS_SECRET_KEY = process.env.S3_SECRET_KEY;

    this.CLOUDFRONT_DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

    this.S3 = new S3Client({
      region: this.AWS_REGION,

      credentials: {
        accessKeyId: String(this.AWS_ACCESS_KEY),

        secretAccessKey: String(this.AWS_SECRET_KEY),
      },
    });

    this.cloudFront = new CloudFrontClient({
      region: this.AWS_REGION,

      credentials: {
        accessKeyId: String(this.AWS_ACCESS_KEY),

        secretAccessKey: String(this.AWS_SECRET_KEY),
      },
    });
  }

  private async invalidateFileCache(filename: string) {
    try {
      const path = [`/${filename}`];

      const cmd = new CreateInvalidationCommand({
        DistributionId: this.CLOUDFRONT_DISTRIBUTION_ID,

        InvalidationBatch: {
          CallerReference: new Date().getTime().toString(),

          Paths: { Quantity: path.length, Items: path },
        },
      });

      await this.cloudFront.send(cmd);
    } catch (error) {
      console.log(error);
    }
  }

  public async uploadMedia(
    file: any,

    folder?: string
  ): Promise<{
    url: string;

    path: string;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const fileSplit = file?.name?.split(".");

        const fileType = fileSplit[fileSplit.length - 1];

        const fileName = `${new Date().getTime()}.${fileType}`;

        const params = {
          Bucket: this.BUCKET_NAME,

          Key: `${folder || "common"}${fileName}`,

          Body: file?.data,

          ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);

        await this.S3.send(command);

        await this.invalidateFileCache(`${params?.Key}`);

        resolve({
          url: new URL(
            `${params?.Key}`,

            process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN
          ).toString(),

          path: `${params?.Key}`,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // new upload
  public async multiPartUpload(
    file: any,
    folder?: string
  ): Promise<{ url: string; path: string }> {
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

      const multipartUploadResponse = await this.S3.send(
        new CreateMultipartUploadCommand(params)
      );
      const uploadId = multipartUploadResponse.UploadId;

      const fileSize = file.data.length;
      const partSize = 1024 * 1024 * 1; // 1 MB per part

      // Divide the file into parts
      const numParts = Math.ceil(fileSize / partSize);

      // Upload each part
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

        const partPromise = this.S3.send(new UploadPartCommand(partParams));
        partPromises.push(partPromise);
      }

      // Wait for all parts to upload
      const partData = await Promise.all(partPromises);

      const parts = partData.map(({ ETag, PartNumber }: any) => ({
        ETag,
        PartNumber,
      }));

      // Complete the multipart upload
      const completeParams = {
        Bucket: this.BUCKET_NAME,
        Key: `${folder || "common"}/${fileName}`,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      };

      await this.S3.send(new CompleteMultipartUploadCommand(completeParams));

      // Invalidate CloudFront cache
      await this.invalidateFileCache(`${params.Key}`);

      // Return the URL and path
      const url = new URL(
        `${params.Key}`,
        process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN
      ).toString();

      return { url, path: `${params.Key}` };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public deleteMedia(path: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          Bucket: this.BUCKET_NAME,

          Key: path,
        };

        const deleteData = new DeleteObjectCommand({
          ...params,
        });

        // DELETE FROM S3 BUCKET

        await this.S3.send(deleteData);

        // INVALIDATE THE CLOUD FRONT CACHE

        await this.invalidateFileCache(params.Key);

        resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  //delete multiple media

  public deleteMultipleMedia(paths: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const command = new DeleteObjectsCommand({
          Bucket: this.BUCKET_NAME,

          Delete: {
            Objects: paths.map((item) => {
              return { Key: item };
            }),
          },
        });

        await this.S3.send(command);

        const path = paths?.map((item) => `/${item}`);

        const cmd = new CreateInvalidationCommand({
          DistributionId: this.CLOUDFRONT_DISTRIBUTION_ID,

          InvalidationBatch: {
            CallerReference: new Date().getTime().toString(),

            Paths: { Quantity: path.length, Items: path },
          },
        });

        await this.cloudFront.send(cmd);

        resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  // upload multiple image
  public async uploadMultipleMedia({
    files,
    folder,
  }: {
    files: any[]; // Assuming UploadedFile is defined somewhere
    folder?: string;
  }): Promise<{ path: string; url: string }[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let resultArray: { path: string; url: string }[] = [];

        for (const file of files) {
          // Upload media
          const fileSplit = file.name.split(".");
          const fileType = fileSplit[fileSplit.length - 1];
          const fileName = `${new Date().getTime()}.${fileType}`;
          const params = {
            Bucket: this.BUCKET_NAME,
            Key: `${folder || "common"}/${fileName}`,
            Body: file.data,
            ContentType: file.mimetype,
          };

          const objectSetUp = new PutObjectCommand({
            ...params,
          });

          await this.S3.send(objectSetUp);

          // Invalidate CloudFront cache
          await this.invalidateFileCache(`${params?.Key}`);

          // Push result to the result array
          resultArray.push({
            path: `${params?.Key}`,
            url: new URL(
              `${params?.Key}`,
              process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN
            ).toString(),
          });
        }

        // Send response to the client
        resolve(resultArray);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// public uploadMultipleMedia({
//   files,
//   folder,
// }: {
//   files: UploadedFile[];
//   folder?: string;
// }): Promise<ImageType[]> {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let resultArray: ImageType[] = [];
//       for (const file of files) {
//         // upload media
//         const fileSplit = file.name.split(".");
//         const fileType = fileSplit[fileSplit.length - 1];
//         const fileName = `${new Date().getTime()}.${fileType}`;
//         const params = {
//           Bucket: `${configs.BUCKET_NAME}`,
//           Key: `${uuidv4()}/${fileName}`,
//           Body: file?.data,
//           ContentType: file.mimetype,
//         };

//         const objectSetUp = new PutObjectCommand({
//           ...params,
//         });
//         const data = await new S3Client({
//           region: configs.REGION,
//           credentials: {
//             accessKeyId: configs.ACCESSKEY as string,
//             secretAccessKey: configs.SECRET_KEY as string,
//           },
//         }).send(objectSetUp);
//         await this.invalidateFileCache(`${params?.Key}`);

//         // push result to result array
//         resultArray.push({
//           path: `${params?.Key}`,
//           url: `${configs.CLOUD_FONT}/${params?.Key}`,
//         });
//       }
//       // send response to client
//       resolve(resultArray);
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
