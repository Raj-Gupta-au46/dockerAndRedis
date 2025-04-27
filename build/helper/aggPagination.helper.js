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
exports.aggregationHelper = void 0;
const aggregationHelper = ({ model, args, perPage, pageNo, }) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            let pagination = [];
            if (perPage) {
                pagination.push({
                    $skip: (Number(pageNo || 0) - 1) * Number(perPage),
                }, {
                    $limit: Number(perPage) + 1,
                });
            }
            const [firstPromise, secondPromise] = yield Promise.allSettled([
                model.aggregate([
                    ...args,
                    {
                        $count: "totalCount",
                    },
                ]),
                model.aggregate([...args, ...pagination]),
            ]);
            if ((firstPromise === null || firstPromise === void 0 ? void 0 : firstPromise.status) === "rejected")
                throw new Error((_a = firstPromise === null || firstPromise === void 0 ? void 0 : firstPromise.reason) === null || _a === void 0 ? void 0 : _a.message);
            if ((secondPromise === null || secondPromise === void 0 ? void 0 : secondPromise.status) === "rejected")
                throw new Error((_b = secondPromise === null || secondPromise === void 0 ? void 0 : secondPromise.reason) === null || _b === void 0 ? void 0 : _b.message);
            const totalLength = (_c = secondPromise.value) === null || _c === void 0 ? void 0 : _c.length;
            if (totalLength > Number(perPage))
                secondPromise.value.pop();
            resolve({
                data: secondPromise.value,
                isLastChunk: !(totalLength > Number(perPage)),
                totalCount: (_d = firstPromise === null || firstPromise === void 0 ? void 0 : firstPromise.value[0]) === null || _d === void 0 ? void 0 : _d.totalCount,
                perPage: Number(perPage),
                pageNo: Number(pageNo),
            });
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.aggregationHelper = aggregationHelper;
