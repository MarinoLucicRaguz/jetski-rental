import { db } from "@/lib/db";

export const getAllRentalOptions = async()=>{
    try{
        const allRentalOptions = await db.rentalOptions.findMany();

        return allRentalOptions;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
}

export const getRentalOptionByDuration = async (duration: number) => {
    try {
        const rentalOptions = await db.rentalOptions.findUnique({
            where:{
                duration,
            }
        });
        return rentalOptions;
    } catch(error) {
        console.log(error)
        return null
    }
}

export const getReservationOptionById = async(rentaloption_id:number) => {
    try {
        const singleRentalOption = await db.rentalOptions.findUnique({
            where:{
                rentaloption_id
            }
        });
        return singleRentalOption;
    } catch{
        return null;
    }
}

export const doesDurationExist = async(duration:number) => {
    try {
        const doesItExist = await db.rentalOptions.findUnique({
            where:{
                duration,
            }
        });
        if(doesItExist){
            return true;
        }
        else
        {
            return false;
        }
            
    } catch{
        return null;
    }
}