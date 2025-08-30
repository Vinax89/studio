import { initCategoryModel, teardownCategoryModel } from "./train/category-model";

initCategoryModel().catch((err) => {
  console.error("Failed to initialize category model", err);
});

if (typeof process !== "undefined") {
  process.once("exit", () => teardownCategoryModel());
  process.once("SIGINT", () => {
    teardownCategoryModel();
    process.exit(0);
  });
}
