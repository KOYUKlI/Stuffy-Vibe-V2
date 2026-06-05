const timestamp = () => new Date().toISOString();

export const logger = {
  info(message: string): void {
    console.log(`[${timestamp()}] [INFO] ${message}`);
  },
  success(message: string): void {
    console.log(`[${timestamp()}] [OK] ${message}`);
  },
  warn(message: string): void {
    console.warn(`[${timestamp()}] [WARN] ${message}`);
  },
  error(message: string, error?: unknown): void {
    console.error(`[${timestamp()}] [ERROR] ${message}`);
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
      return;
    }
    if (error) console.error(error);
  },
};
