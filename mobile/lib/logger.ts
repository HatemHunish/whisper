const METHODS_TO_WRAP = ["log", "info", "warn", "error", "debug"] as const;
const LOGGER_FILE_HINT = "lib/logger";

let installed = false;

const normalizeCaller = (rawPath: string) => {
  const withoutQuery = rawPath.split("?")[0];
  const segments = withoutQuery.split(/[\\/]/);
  const fileName = segments[segments.length - 1];

  if (!fileName) {
    return null;
  }

  // Metro/Hermes often reports bundle URLs. These are too noisy and not useful.
  if (fileName === "index.bundle") {
    return null;
  }

  return fileName;
};

const extractCaller = (stack?: string) => {
  if (!stack) {
    return "unknown";
  }

  const lines = stack.split("\n").map((line) => line.trim());

  for (const line of lines) {
    if (!line.startsWith("at ")) {
      continue;
    }

    if (line.includes(LOGGER_FILE_HINT) || line.includes("native")) {
      continue;
    }

    const withParensMatch = line.match(/\((.*?):\d+:\d+\)$/);
    const directMatch = line.match(/at\s+(.*?):\d+:\d+$/);
    const fullPath = withParensMatch?.[1] ?? directMatch?.[1];

    if (!fullPath) {
      continue;
    }

    const fileName = normalizeCaller(fullPath);

    if (fileName) {
      return fileName;
    }
  }

  return "unknown";
};

export const installConsoleContext = () => {
  if (installed) {
    return;
  }

  installed = true;

  METHODS_TO_WRAP.forEach((method) => {
    const original = console[method].bind(console);

    console[method] = (...args: unknown[]) => {
      const stack = new Error().stack;
      const caller = extractCaller(stack);
      original(`[${caller}]`, ...args);
    };
  });
};
