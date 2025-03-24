const { z } = require("zod");
const mongoose = require("mongoose");

const categorySchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty"),
  parentId: z
    .string()
    .nullable()
    .refine((val) => !val || mongoose.Types.ObjectId.isValid(val), {
      message: "parentId must be a valid ObjectId or empty",
    })
    .default(null),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z
    .enum(["active", "inactive", "deleted"], {
      errorMap: () => ({ message: "Status must be one of: active, inactive, deleted" }),
    })
    .default("active"),
  slug: z.string().optional(), // Slug sẽ được tạo tự động bởi mongoose-slug-updater
  createdBy: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "createdBy must be a valid ObjectId",
    })
    .optional(),
  updatedBy: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "updatedBy must be a valid ObjectId",
    })
    .optional(),
});

const createCategorySchema = categorySchema;
const updateCategorySchema = categorySchema.partial();

const validateCategory = (type = "create") => {
  return (req, res, next) => {
    const schema = type === "create" ? createCategorySchema : updateCategorySchema;
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map(e => e.message),
      });
    }

    req.body = result.data;
    next();
  };
};

module.exports = { validateCategory };