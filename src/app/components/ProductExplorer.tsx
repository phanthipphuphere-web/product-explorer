"use client";

import { useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import ProductSearchForm from "./ProductSearchForm";

import {
  defaultQuery,
  fetchProducts,
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
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery)
      .then(showResult)
      .catch(showError);
  }, []);

  async function searchProducts(query: SearchQuery) {
    await loadProducts(query);
  }

  function saveProduct(draft: ProductDraft) {
    if (editing) {
      setProducts(
        products.map((product) =>
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

    setProducts([
      ...products,
      {
        ...draft,
        id: Date.now(),
      },
    ]);
  }

  function deleteProduct(id: number) {
    setProducts(
      products.filter((product) => product.id !== id)
    );
  }

  return (
    <main>
      <h1>รายการสินค้า</h1>

      <ProductSearchForm onSearch={searchProducts} />

      <ProductForm
        editing={editing}
        onSave={saveProduct}
        onCancel={() => setEditing(null)}
      />

      {status === "loading" && (
        <p>กำลังโหลดข้อมูล...</p>
      )}

      {status === "error" && (
        <p role="alert">
          {errorMessage}
        </p>
      )}

      {status === "ready" && products.length === 0 && (
        <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
      )}

      {status === "ready" && products.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ชื่อสินค้า</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>หมวดหมู่</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.category}</td>

                <td>
                  <button
                    type="button"
                    onClick={() => setEditing(product)}
                  >
                    แก้ไข
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteProduct(product.id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading"
          ? "กำลังโหลด"
          : "โหลดข้อมูล"}
      </button>
    </main>
  );
}