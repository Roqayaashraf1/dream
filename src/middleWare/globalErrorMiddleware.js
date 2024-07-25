
export const  globalErrorMiddleware =(err,req,res,next)=>{
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({err : err.message,statusCode})
}