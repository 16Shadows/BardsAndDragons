import { AuthMiddleware, AuthMiddlewareBag } from "../middleware/AuthMiddleware";
import { Controller } from "../modules/core/controllers/decorators";
import { Accept, Return } from "../modules/core/mimeType/decorators";
import { POST } from "../modules/core/routing/decorators";
import { getTempFileName } from "./tempFile";
import { hash } from "./hash";
import { ModelDataSource } from "../model/dataSource";
import { Image } from "../model/image";
import path from 'path';
import { Like } from "typeorm";
import fs from 'fs';
import fsPromise from 'fs/promises';
import { compareFiles } from "./fileCompare";
import { finished } from 'stream/promises';


@Controller('api/v1/images')
export class ImagesController {
    private _dbContext: ModelDataSource;

    constructor(dbContext: ModelDataSource) {
        this._dbContext = dbContext;
    }

    @POST('upload')
    //@Middleware(AuthMiddleware)
    @Accept('image/png')
    @Return('application/json')
    async uploadPng(_middlewareBag: AuthMiddlewareBag, body: NodeJS.ReadableStream): Promise<{path: string}> {
        return this.uploadImage(body, 'png');
    }

    @POST('upload')
    //@Middleware(AuthMiddleware)
    @Accept('image/jpeg')
    @Return('application/json')
    async uploadJpeg(_middlewareBag: AuthMiddlewareBag, body: NodeJS.ReadableStream): Promise<{path: string}> {
        return this.uploadImage(body, 'jpeg');
    }

    private static localizePath(p: string): string {
        return p.replaceAll('/', path.sep);
    }

    async uploadImage(body: NodeJS.ReadableStream, extension: 'png' | 'jpeg'): Promise<{path: string}> {
        const tempFile = await getTempFileName();

        const writeStream = fs.createWriteStream(tempFile);

        body.pipe(writeStream);
        await finished(body);
        writeStream.end();
        await finished(writeStream);
        writeStream.destroy();

        var readStream = fs.createReadStream(tempFile);
        var imagePath = 'userimages/'+ await hash(readStream, 'sha1') + '/';
        readStream.destroy();

        const imageRepo = this._dbContext.getRepository(Image);
        var images = await imageRepo.findBy({
            blob: Like(`${imagePath}%`)
        });

        var img: Image;

        if (images.length == 0) {
            //fs.access will throw if the file doesn't exist
            //So the logic is:
            //if the file doesn't exist, fs.access throws and we create the file in finally block
            //if the file does exist, we requery database to make make sure that the file wasn't added in-between previous query and fs.access check
            //Then, if the file isn't present in the database, it is an orphan file and should be overwritten (this will happen in finally block)
            try { 
                await fsPromise.access(imagePath, fsPromise.constants.F_OK);
                images = await imageRepo.findBy({
                    blob: Like(`${imagePath}%`)
                });
            }
            catch {}
            finally {
                if (images.length == 0) {
                    await fsPromise.mkdir(path.join('public', ImagesController.localizePath(imagePath)), {recursive: true});
                    imagePath += '0.' + extension;
                    await fsPromise.rename(tempFile, path.join('public', ImagesController.localizePath(imagePath)));
                    img = new Image();
                    img.blob = imagePath;
                    await imageRepo.save(img);
                    return {
                        path: imagePath
                    };
                }
            }
        }

        //There is a file with the same hash already...

        for (let existingImage of images) {
            if (!existingImage.blob.toLowerCase().endsWith(extension) ||
                !await compareFiles(tempFile, path.join('public', ImagesController.localizePath(existingImage.blob))))
                continue;

            //A file has matched!
            return {
                path: existingImage.blob
            };
        }

        //No file matches by content, save the file
        let i = 0;
        for (; i < images.length && images.some(x => x.blob.startsWith(imagePath + i)); i++);
        await fsPromise.mkdir(path.join('public', ImagesController.localizePath(imagePath)), {recursive: true});
        imagePath += i.toString() + '.' + extension;
        await fsPromise.rename(tempFile, path.join('public', ImagesController.localizePath(imagePath)));
        img = new Image();
        img.blob = imagePath;
        await imageRepo.save(img);
        return {
            path: imagePath
        };
    }
}