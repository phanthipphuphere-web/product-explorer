"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  CATEGORIES,
  ProductDraftSchema,
} from "@/lib/products";

import type {
  Product,
  ProductDraft,
} from "@/lib/products";

type ProductFormProps = {
  editing: Product | null;
  onSave: (draft: ProductDraft) => void;
  onCancel: () => void;
};

export default function ProductForm({
  editing,
  onSave,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isDirty,
      isValid,
    },
  } = useForm<ProductDraft>({
    resolver: zodResolver(ProductDraftSchema),
    mode: "onTouched",

    defaultValues: {
      title: "",
      price: 0,
      stock: 0,
      category: undefined,
    },
  });

  useEffect(() => {
    if (editing) {
      const category = CATEGORIES.includes(
        editing.category as (typeof CATEGORIES)[number]
      )
        ? (editing.category as (typeof CATEGORIES)[number])
        : undefined;

      reset({
        title: editing.title,
        price: editing.price,
        stock: editing.stock,
        category,
      });
    } else {
      reset({
        title: "",
        price: 0,
        stock: 0,
        category: undefined,
      });
    }
  }, [editing, reset]);

  function saveProduct(values: ProductDraft) {
    onSave(values);

    if (!editing) {
      reset({
        title: "",
        price: 0,
        stock: 0,
        category: undefined,
      });
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            {editing
              ? "✏️ แก้ไขสินค้า"
              : "➕ เพิ่มสินค้า"}
          </h2>

          <p className="card-description">
            {editing
              ? "แก้ไขรายละเอียดสินค้าแล้วกดบันทึก"
              : "เพิ่มสินค้าใหม่เข้าสู่รายการ"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(saveProduct)}>
        <div className="product-form-grid">

          {/* ชื่อสินค้า */}
          <div className="field">
            <label htmlFor="title">
              ชื่อสินค้า
            </label>

            <input
              id="title"
              {...register("title")}
              placeholder="เช่น iPhone 15"
              aria-invalid={!!errors.title}
            />

            {errors.title && (
              <p className="error-message">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* ราคา */}
          <div className="field">
            <label htmlFor="price">
              ราคา
            </label>

            <input
              id="price"
              type="number"
              step="0.01"
              {...register("price", {
                valueAsNumber: true,
              })}
              placeholder="0.00"
              aria-invalid={!!errors.price}
            />

            {errors.price && (
              <p className="error-message">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* จำนวน */}
          <div className="field">
            <label htmlFor="stock">
              จำนวนสินค้า
            </label>

            <input
              id="stock"
              type="number"
              {...register("stock", {
                valueAsNumber: true,
              })}
              placeholder="0"
              aria-invalid={!!errors.stock}
            />

            {errors.stock && (
              <p className="error-message">
                {errors.stock.message}
              </p>
            )}
          </div>

          {/* หมวดหมู่ */}
          <div className="field">
            <label htmlFor="category">
              หมวดหมู่
            </label>

            <select
              id="category"
              {...register("category")}
              aria-invalid={!!errors.category}
            >
              <option value="">
                เลือกหมวดหมู่
              </option>

              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {errors.category && (
              <p className="error-message">
                {errors.category.message}
              </p>
            )}
          </div>

        </div>

        <div className="form-actions">

          <button
            className="btn btn-success"
            type="submit"
            disabled={!isDirty || !isValid}
          >
            {editing
              ? "💾 บันทึกการแก้ไข"
              : "➕ เพิ่มสินค้า"}
          </button>

          {editing && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onCancel}
            >
              ยกเลิก
            </button>
          )}

        </div>
      </form>
    </section>
  );
}