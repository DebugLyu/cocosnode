import lyu from "../lyu";

process.on('SIGINT', function () {
    process.exit();
});

process.on("exit", (code) => {
    lyu.exit(false);
    console.log("Service Exit");
});

// 未知异常捕获
process.on('uncaughtException', (err) => {
    console.error('捕获的异常');
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    let reason2 = {
        code: (reason as any)["code"],
        input: (reason as any)["input"],
        message: (reason as any)["message"],
        stack: (reason as any)["stack"],
    }
    console.error('未处理的拒绝：', '原因：', reason2);
});