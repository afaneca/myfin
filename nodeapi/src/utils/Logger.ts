const addLog = (logMessage: string, forceDisplay = false) => {
  const logsAreEnabled = process.env.LOGGING === 'true';
  // eslint-disable-next-line no-console
  if (logsAreEnabled || forceDisplay) {
    console.log(logMessage);
  }
};

const addStringifiedLog = (logMessage: any, forceDisplay = false) => {
  addLog(JSON.stringify(logMessage), forceDisplay);
};

// eslint-disable-next-line import/prefer-default-export
export default { addLog, addStringifiedLog };
