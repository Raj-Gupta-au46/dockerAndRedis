import { BadRequest } from "http-errors";

const conditionArray = ["A-Z", "Z-A"];

export const sortTextCondition = (title: string, sortFormat: string): any => {
  try {
    if (!conditionArray.includes(sortFormat.toUpperCase()))
      throw new BadRequest("Invalid sort text format");
    const makeUpperCase = sortFormat.toUpperCase();

    return {
      [title]: makeUpperCase === "A-Z" ? 1 : -1,
    };
  } catch (error) {
    return error;
  }
};
