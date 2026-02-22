/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "core-no-nodejs",
      comment: "Core layer (lib/) cannot import Node.js built-ins.",
      severity: "error",
      from: {
        path: "^lib/",
        pathNot: ["^lib/data\\.ts$", "__tests__"],
      },
      to: {
        path: "^node:|^fs$|^path$|^os$|^crypto$|^stream$|^http$|^https$|^net$",
      },
    },
    {
      name: "components-no-server",
      comment: "Components cannot import server-only files.",
      severity: "error",
      from: { path: "^components/" },
      to: { path: "/server\\.ts$" },
    },
    {
      name: "core-no-server-only",
      comment:
        "Core layer (lib/) cannot import server-only package directly — use server.ts files.",
      severity: "error",
      from: {
        path: "^lib/",
        pathNot: ["/server\\.ts$"],
      },
      to: { path: "server-only" },
    },
    {
      name: "barrel-no-server-reexport",
      comment:
        "Barrel files (index.ts) must not re-export ./server to avoid leaking server code.",
      severity: "error",
      from: { path: "/index\\.ts$" },
      to: { path: "/server\\.ts$" },
    },
    {
      name: "no-circular",
      comment: "Circular dependencies cause runtime issues.",
      severity: "warn",
      from: { pathNot: "node_modules" },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
