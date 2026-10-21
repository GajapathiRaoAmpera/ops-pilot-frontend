import next from "eslint-config-next";

const config = [...next, { ignores: ["OpsPilot-ProtoType/**", ".next/**"] }];
export default config;
