import { IInterest } from "./interest.interface";
import { Interest } from "./interest.model";

export const createInterestIntoDB = async (interestData : IInterest) => {   
    const { name } = interestData;
    const interest = await Interest.create({ name });
    return interest;
}