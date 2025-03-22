const { z } = require("zod")

const productSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty"),
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Category ID must be a valid ObjectId")
    .optional(),
  featured: z
    .boolean()
    .default(false)
    .optional(),
  description: z.string().optional(),
  price: z
    .union([
      z.number().min(0, "Price must be greater than 0"),
      z.string().transform((val) => Number(val)),
    ])
    .refine((val) => !isNaN(val), { message: "Price must be a valid number" })
    .refine((val) => val >= 0, { message: "Price must be greater than 0" }),
  discountPercentage: z
    .union([
      z.number().min(0).max(100).optional(),
      z.string().transform((val) => (val ? Number(val) : undefined)).optional(),
    ])
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 100),
      { message: "Discount percentage must be between 0 and 100" }
    )
    .optional(),
  stock: z
    .union([
      z.number().min(0, "Stock quantity must be greater than 0"),
      z.string().transform((val) => Number(val)),
    ])
    .refine((val) => !isNaN(val), { message: "Stock must be a valid number" })
    .refine((val) => val >= 0, { message: "Stock quantity must be greater than 0" }),
  thumbnail: z
    .string({ required_error: "Thumbnail is required" })
    .min(1, "Thumbnail cannot be empty"),
  status: z
    .enum(["active", "inactive", "deleted"], {
      errorMap: () => ({ message: "Status must be one of: active, inactive, deleted" }),
    })
    .default("active"),
  slug: z.string().optional(),
  createdBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "CreatedBy must be a valid ObjectId")
    .optional(),
  updatedBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "UpdatedBy must be a valid ObjectId")
    .optional(),
});

const createProductSchema = productSchema
const updateProductSchema = productSchema.partial()

const validateProduct = (type = "create") => {
  return (req, res, next) => {
    const result = type === "create" ? createProductSchema.safeParse(req.body) : updateProductSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.errors.map(e => e.message)
      });
    }

    req.body = result.data
    next()
  }
}
// TODO: Sửa lại lỗi safeParse
module.exports = { validateProduct }