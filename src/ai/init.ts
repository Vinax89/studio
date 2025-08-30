import { initCategoryModel, teardownCategoryModel } from "./train/category-model";
import { logger } from "@/lib/logger";

initCategoryModel().catch((err) => {
  logger.error("Failed to initialize category model", err);
});

if (typeof process !== "undefined") {
  process.once("exit", () => teardownCategoryModel());
  process.once("SIGINT", () => {
    teardownCategoryModel();
    process.exit(0);
  });
}
