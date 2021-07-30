exports.addLog = (logMessage, forceDisplay = false) => {
    const logsAreEnabled = process.env.LOGGING === "true"
    if (logsAreEnabled || forceDisplay)
        console.log(logMessage)
}