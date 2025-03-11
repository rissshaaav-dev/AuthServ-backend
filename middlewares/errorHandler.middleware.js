const errorHandler = (err, req, res, next) => {
    console.error(`❌ Error at ${err.place}: ${err.message}`);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorHandler;
