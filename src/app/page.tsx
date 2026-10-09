import Link from "next/link";
import { auth } from "@/auth";
import { getProducts } from "@/lib/products";
import { AuthButtons } from "./auth-buttons";

export default async function HomePage() {
  const session = await auth();
  const products = getProducts();
  const isLoggedIn = Boolean(session?.user);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px 30px",
            marginBottom: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
            }}
          >
            รายการสินค้า
          </h1>

          <AuthButtons
            isLoggedIn={isLoggedIn}
            userName={session?.user?.name}
          />
        </header>

        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {products.map((product) => (
            <article
              key={product.id}
              data-testid="product"
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px 28px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "22px",
                }}
              >
                {product.name}
              </h2>

              <p
                style={{
                  margin: "0 0 12px",
                  color: "#666",
                }}
              >
                {product.description}
              </p>

              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                ฿{product.price.toLocaleString("th-TH")}
              </p>

              {isLoggedIn && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <Link
                    href={`/products/${product.id}/edit`}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background: "#2563eb",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    แก้ไข
                  </Link>

                  <Link
                    href={`/products/${product.id}/delete`}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background: "#dc2626",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    ลบ
                  </Link>
                </div>
              )}
            </article>
          ))}

          {products.length === 0 && (
            <p style={{ textAlign: "center" }}>ไม่มีสินค้า</p>
          )}
        </div>
      </div>
    </main>
  );
}