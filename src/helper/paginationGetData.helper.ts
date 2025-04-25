import { Model } from "mongoose";

export async function aggregationData<T>({
  model,
  args,
  position,
  limitSkipArgs,
  per_page,
  pageNo,
  isTotalData,
}: {
  model: Model<T>;
  args: any[];
  position: number;
  limitSkipArgs: any[];
  per_page?: number;
  pageNo?: number;
  isTotalData?: boolean;
}) {
  try {
    if (per_page && pageNo) {
      // const totalData = await model.find(args).count();
      const perPage = per_page;

      // const totalPages = Math.ceil(totalData / perPage);
      // const skip = +perPage * (pageNo - 1);
      const totalCount = isTotalData
        ? await model.aggregate([
            ...args,
            {
              $count: "totalCount",
            },
          ])
        : undefined;
      args.splice(position, 0, limitSkipArgs);
      const compArgs = args.flat();
      const dataGet = await model.aggregate(compArgs);

      const haveNextPage = Boolean(dataGet.length === Number(perPage) + 1);
      if (haveNextPage) {
        dataGet.pop();
      }

      return {
        results: dataGet,
        haveNextPage,
        pageNo: isTotalData ? pageNo : undefined,
        perPage: isTotalData ? per_page : undefined,
        totalCount: totalCount?.[0]?.totalCount,
      };
    } else {
      const dataGet = await model.aggregate(args);
      return {
        results: dataGet,
        haveNextPage: false,
      };
    }
  } catch (error) {
    throw error;
  }
}

export default async function getData<T, T2>({
  model,
  args,
  per_page,
  pageNo,
  populate,
  select,
  sort,
  isTotalData,
}: {
  model: Model<T>;
  args: T2;
  per_page?: number;
  pageNo?: number;
  populate?: string | any[];
  select?: string;
  sort?: any;
  isTotalData?: boolean;
}) {
  try {
    if (per_page && pageNo) {
      // const totalData = await model.find(args).count();
      const perPage = per_page;

      // const totalPages = Math.ceil(totalData / perPage);
      const skip = +perPage * (pageNo - 1);

      const dataGet = await model
        ?.find(args ? args : {})
        .sort(sort ? sort : { createdAt: -1 })
        .skip(skip)
        .limit(per_page + 1)
        .populate(populate || "")
        .select(select ? `-__v ${select}` : "-__v");
      const haveNextPage = Boolean(dataGet.length === per_page + 1);
      if (haveNextPage) {
        dataGet.pop();
      }
      const totalCount = isTotalData
        ? await model.find(args ? args : {}).count()
        : undefined;

      return {
        results: dataGet,
        haveNextPage,
        pageNo: isTotalData ? pageNo : undefined,
        perPage: isTotalData ? per_page : undefined,
        totalCount,
      };
    } else {
      const dataGet = await model
        .find(args ? args : {})
        .sort(sort ? sort : { createdAt: -1 })
        .populate(populate || "")
        .select(select ? `-__v ${select}` : "-__v");
      return {
        results: dataGet,
        haveNextPage: false,
      };
    }
  } catch (error) {
    throw error;
  }
}
