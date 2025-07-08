import { Model, Document } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../types/pagination';

interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    filter: Record<string, any>,
    options: PaginateOptions
  ): Promise<PaginateResult<T>>;
}

/**
 * Mongoose plugin for pagination
 */
export const paginate = (schema: any) => {
  schema.statics.paginate = async function (
    filter: Record<string, any>,
    options: PaginateOptions
  ): Promise<PaginateResult<any>> {
    let sort = '';
    
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = '-createdAt';
    }

    const limit = options.limit && parseInt(options.limit.toString(), 10) > 0
      ? parseInt(options.limit.toString(), 10)
      : 10;
    
    const page = options.page && parseInt(options.page.toString(), 10) > 0
      ? parseInt(options.page.toString(), 10)
      : 1;
    
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a: any, b: string) => ({ path: b, populate: a })) as any
        );
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};