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
exports.aggregationData = void 0;
function aggregationData({ model, args, position, limitSkipArgs, per_page, pageNo, isTotalData, }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (per_page && pageNo) {
                const perPage = per_page;
                const totalCount = isTotalData
                    ? yield model.aggregate([
                        ...args,
                        {
                            $count: "totalCount",
                        },
                    ])
                    : undefined;
                args.splice(position, 0, limitSkipArgs);
                const compArgs = args.flat();
                const dataGet = yield model.aggregate(compArgs);
                const haveNextPage = Boolean(dataGet.length === Number(perPage) + 1);
                if (haveNextPage) {
                    dataGet.pop();
                }
                return {
                    results: dataGet,
                    haveNextPage,
                    pageNo: isTotalData ? pageNo : undefined,
                    perPage: isTotalData ? per_page : undefined,
                    totalCount: (_a = totalCount === null || totalCount === void 0 ? void 0 : totalCount[0]) === null || _a === void 0 ? void 0 : _a.totalCount,
                };
            }
            else {
                const dataGet = yield model.aggregate(args);
                return {
                    results: dataGet,
                    haveNextPage: false,
                };
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.aggregationData = aggregationData;
function getData({ model, args, per_page, pageNo, populate, select, sort, isTotalData, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (per_page && pageNo) {
                const perPage = per_page;
                const skip = +perPage * (pageNo - 1);
                const dataGet = yield (model === null || model === void 0 ? void 0 : model.find(args ? args : {}).sort(sort ? sort : { createdAt: -1 }).skip(skip).limit(per_page + 1).populate(populate || "").select(select ? `-__v ${select}` : "-__v"));
                const haveNextPage = Boolean(dataGet.length === per_page + 1);
                if (haveNextPage) {
                    dataGet.pop();
                }
                const totalCount = isTotalData
                    ? yield model.find(args ? args : {}).count()
                    : undefined;
                return {
                    results: dataGet,
                    haveNextPage,
                    pageNo: isTotalData ? pageNo : undefined,
                    perPage: isTotalData ? per_page : undefined,
                    totalCount,
                };
            }
            else {
                const dataGet = yield model
                    .find(args ? args : {})
                    .sort(sort ? sort : { createdAt: -1 })
                    .populate(populate || "")
                    .select(select ? `-__v ${select}` : "-__v");
                return {
                    results: dataGet,
                    haveNextPage: false,
                };
            }
        }
        catch (error) {
            throw error;
        }
    });
}
exports.default = getData;
