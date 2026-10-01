import { z } from "zod";

export const CATEGORIES = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
] as const;

export const SORT_FIELDS = [
  "title",
  "price",
  "stock",
] as const;

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type Product = z.infer<
  typeof ProductSchema
>;

export type ProductList = z.infer<
  typeof ProductListSchema
>;

export const SearchQuerySchema = z.object({
  q: z.string(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(30),
  sortBy: z.enum(SORT_FIELDS),
});

export type SearchQuery = z.infer<
  typeof SearchQuerySchema
>;

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

export const ProductDraftSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อสินค้า"),

  price: z
    .number()
    .min(0, "ราคาต้องไม่ติดลบ"),

  stock: z
    .number()
    .int("จำนวนสินค้าต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนสินค้าต้องไม่ติดลบ"),

  category: z.enum(CATEGORIES),
});

export type ProductDraft = z.infer<
  typeof ProductDraftSchema
>;

const API_BASE = "https://dummyjson.com";

export function buildProductUrl(
  query: SearchQuery
) {
  const params = new URLSearchParams();

  if (query.q.trim() !== "") {
    params.set("q", query.q.trim());
  }

  params.set(
    "limit",
    String(query.limit)
  );

  params.set(
    "sortBy",
    query.sortBy
  );

  params.set("order", "asc");

  params.set(
    "select",
    "title,price,stock,category"
  );

  if (query.q.trim() !== "") {
    return `${API_BASE}/products/search?${params.toString()}`;
  }

  return `${API_BASE}/products?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery = defaultQuery
): Promise<ProductList> {

  const url = buildProductUrl(query);

  console.log("กำลังเรียก API:", url);

  // ป้องกันเว็บค้างที่ "กำลังโหลด" ตลอด
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `API ตอบกลับด้วยสถานะ ${response.status}`
      );
    }

    const data = await response.json();

    console.log("ข้อมูลจาก API:", data);

    const result =
      ProductListSchema.safeParse(data);

    if (!result.success) {
      console.error(
        "ข้อมูลไม่ตรง Schema:",
        result.error
      );

      throw new Error(
        "ข้อมูลจาก API ไม่ตรงกับ Schema"
      );
    }

    return result.data;

  } catch (error) {

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "เชื่อมต่อ API นานเกินไป กรุณาลองใหม่"
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "ไม่สามารถเชื่อมต่อ API ได้"
    );

  } finally {
    clearTimeout(timeout);
  }
}