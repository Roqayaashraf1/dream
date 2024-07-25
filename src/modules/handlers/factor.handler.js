import { catchAsyncError } from "../../middleWare/catchAsyncError.js"

export const deleteOne = (model)=>{
    return catchAsyncError(async(req,res,next)=>{
        const {id}=req.params
            let result = await model.findByIdAndDelete(id)
            !result && next(new AppError(`Document not found`,404)) 
            result && res.json({message:"success",result})
          
        }) 
}