const format = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

export const logger = {
  info: (message: string) => console.log(format('INFO', message)),
  success: (message: string) => console.log(format('SUCCESS', message)),
  warn: (message: string) => console.warn(format('WARN', message)),
  error: (message: string, error?: unknown) => {
    console.error(format('ERROR', message));
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else if (error) {
      console.error(error);
    }
  },
};
