"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ProductForm from "./ProductForm";

import {
  defaultQuery,
  fetchProducts,
  SORT_FIELDS,
  SearchQuerySchema,
} from "@/lib/products";

import type {
  Product,
  ProductDraft,
  ProductList,
  SearchQuery,
} from "@/lib/products";

type LoadState = "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] =
    useState<LoadState>("loading");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [editing, setEditing] =
    useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    defaultValues: defaultQuery,
  });

  async function loadProducts(
    query: SearchQuery
  ) {
    try {
      setStatus("loading");
      setErrorMessage("");

      const result =
        await fetchProducts(query);

      console.log(
        "สินค้าที่ได้:",
        result.products
      );

      setProducts(result.products);
      setStatus("ready");

    } catch (error) {

      console.error(
        "โหลดสินค้าไม่สำเร็จ:",
        error
      );

      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดสินค้าได้"
      );
    }
  }

  useEffect(() => {
    loadProducts(defaultQuery);
  }, []);

  async function searchProducts(
    query: SearchQuery
  ) {
    await loadProducts(query);
  }

  function saveProduct(
    draft: ProductDraft
  ) {
    if (editing) {

      setProducts((current) =>
        current.map((product) =>
          product.id === editing.id
            ? {
                ...draft,
                id: editing.id,
              }
            : product
        )
      );

      setEditing(null);

      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      ...draft,
    };

    setProducts((current) => [
      newProduct,
      ...current,
    ]);
  }

  function deleteProduct(id: number) {
    setProducts((current) =>
      current.filter(
        (product) =>
          product.id !== id
      )
    );
  }

  return (
    <div className="product-page">

      <div className="container">

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <div className="hero-badge">
              ✦ Product Explorer
            </div>

            <h1>
              จัดการสินค้า
              <br />
              ง่ายและเป็นระบบ
            </h1>

            <p>
              ค้นหา เพิ่ม แก้ไข และจัดการข้อมูลสินค้า
              ผ่านระบบเดียว
            </p>

          </div>

        </section>

        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">
            <p className="stat-label">
              สินค้าที่แสดง
            </p>

            <p className="stat-value">
              {products.length}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              สถานะระบบ
            </p>

            <p className="stat-value">
              {status === "ready"
                ? "พร้อมใช้งาน"
                : status === "loading"
                ? "กำลังโหลด"
                : "เกิดข้อผิดพลาด"}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">
              API
            </p>

            <p className="stat-value">
              DummyJSON
            </p>
          </div>

        </section>

        {/* SEARCH */}

        <section className="card">

          <div className="card-header">

            <div>
              <h2 className="card-title">
                🔎 ค้นหาสินค้า
              </h2>

              <p className="card-description">
                ค้นหาและจัดเรียงรายการสินค้า
              </p>
            </div>

          </div>

          <form
            onSubmit={handleSubmit(
              searchProducts
            )}
          >

            <div className="search-grid">

              <div className="field">

                <label htmlFor="q">
                  คำค้น
                </label>

                <input
                  id="q"
                  {...register("q")}
                  placeholder="เช่น phone"
                />

              </div>

              <div className="field">

                <label htmlFor="limit">
                  จำนวนรายการ
                </label>

                <input
                  id="limit"
                  type="number"
                  {...register("limit", {
                    valueAsNumber: true,
                  })}
                />

                {errors.limit && (
                  <p className="error-message">
                    {errors.limit.message}
                  </p>
                )}

              </div>

              <div className="field">

                <label htmlFor="sortBy">
                  เรียงตาม
                </label>

                <select
                  id="sortBy"
                  {...register("sortBy")}
                >

                  {SORT_FIELDS.map(
                    (field) => (
                      <option
                        key={field}
                        value={field}
                      >
                        {field}
                      </option>
                    )
                  )}

                </select>

              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "กำลังค้นหา..."
                  : "ค้นหา"}
              </button>

            </div>

          </form>

        </section>

        {/* ADD / EDIT */}

        <ProductForm
          editing={editing}
          onSave={saveProduct}
          onCancel={() =>
            setEditing(null)
          }
        />

        {/* PRODUCTS */}

        <section className="card table-card">

          <div className="table-header">

            <h2 className="card-title">
              📦 รายการสินค้า
            </h2>

            <p className="card-description">
              รายการสินค้าจากระบบ
            </p>

          </div>

          {status === "loading" && (
            <div className="status-box">

              <div className="loading-icon" />

              <p className="status-title">
                กำลังโหลดข้อมูล...
              </p>

              <p className="status-text">
                กำลังเชื่อมต่อกับ DummyJSON
              </p>

            </div>
          )}

          {status === "error" && (
            <div className="status-box">

              <div className="error-box">
                ❌ {errorMessage}
              </div>

              <br />

              <button
                className="btn btn-primary"
                onClick={() =>
                  loadProducts(
                    defaultQuery
                  )
                }
              >
                🔄 ลองใหม่
              </button>

            </div>
          )}

          {status === "ready" &&
            products.length === 0 && (
              <div className="empty-box">

                <div className="empty-icon">
                  📦
                </div>

                <h3>
                  ไม่พบสินค้า
                </h3>

                <p>
                  ลองเปลี่ยนคำค้นแล้วค้นหาใหม่
                </p>

              </div>
            )}

          {status === "ready" &&
            products.length > 0 && (

              <div className="table-wrapper">

                <table className="product-table">

                  <thead>

                    <tr>
                      <th>
                        สินค้า
                      </th>

                      <th>
                        ราคา
                      </th>

                      <th>
                        จำนวน
                      </th>

                      <th>
                        หมวดหมู่
                      </th>

                      <th>
                        จัดการ
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {products.map(
                      (product) => (

                        <tr
                          key={product.id}
                        >

                          <td>
                            <span className="product-name">
                              {product.title}
                            </span>
                          </td>

                          <td>
                            <span className="price">
                              ${product.price}
                            </span>
                          </td>

                          <td>
                            <span className="stock-badge">
                              {product.stock} ชิ้น
                            </span>
                          </td>

                          <td>
                            <span className="category-badge">
                              {product.category}
                            </span>
                          </td>

                          <td>

                            <div className="action-buttons">

                              <button
                                className="btn btn-edit"
                                type="button"
                                onClick={() =>
                                  setEditing(
                                    product
                                  )
                                }
                              >
                                ✏️ แก้ไข
                              </button>

                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() =>
                                  deleteProduct(
                                    product.id
                                  )
                                }
                              >
                                🗑️ ลบ
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

        <footer className="footer">
          Product Explorer · React Hook Form · Zod · DummyJSON API
        </footer>

      </div>

    </div>
  );
}