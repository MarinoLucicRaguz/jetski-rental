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

export const getAllRentalOptionsThatAreAvailable = async()=>{
    try{
        const allRentalOptions = await db.rentalOptions.findMany({
            where:{
                isAvailable: true
            }
        });

        return allRentalOptions;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
}

export const getRentalOptionById = async(id: number) =>
{
    try {
        const rentalOption = await db.rentalOptions.findUnique({
            where:{
                rentaloption_id: id,
            }
        })
        return rentalOption;
    }
    catch (error){
        console.log(error);
        return null;
    }
}

export const disableRentalOption = async(id: number) =>{

    {
        try {
            const rentalOption = await db.rentalOptions.findUnique({
                where:{
                    rentaloption_id: id,
                }
            })
            return rentalOption;
        }
        catch (error){
            console.log(error);
            return null;
        }
    }
}
    
export const getRentalOptionByDuration = async (duration: number) => {
    try {
        const rentalOptions = await db.rentalOptions.findMany({
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

export const doesDurationExist = async(duration:number) => {
    try {
        const doesItExist = await db.rentalOptions.findMany({
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