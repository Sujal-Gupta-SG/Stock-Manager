"use client";
import Header from "@/components/Header";
import ToastCont from "@/components/ToastCont";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function DashBoard({ session, signIn, signOut }) {
  const [productForm, setProductForm] = useState({});
  const [products, setProducts] = useState([]);
  const [dropdown, setDropdown] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const debounceTimeout = useRef(null);
  const fetchProducts = async () => {
    const res = await fetch(
      `/api/product?query2=${session.user.name}&query3=${session.user.email}`
    );
    let rjson = await res.json();
    setProducts(rjson.products);
  };
  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          UserName: session.user.name,
          UserEmail: session.user.email,
        }),
      });

      if (res.ok) {
        setProductForm({ slug: "", quantity: "", price: "" });
        toast.success("Product added successfully!");
        fetchProducts();
      } else {
        toast.error("Failed to add product.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the product.", e);
    }
  };

  const deleteProduct = async (id, process) => {
    try {
      const response = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success(
          process === "DELETE"
            ? "Product deleted successfully!"
            : "Product open for edit"
        );
        fetchProducts();
        return response;
      } else {
        toast.error(
          process === "DELETE"
            ? "Failed to delete the product."
            : "Failed to edit"
        );
        throw new error({ status: "error" });
      }
    } catch (error) {
      toast.error(
        process === "DELETE"
          ? `An error occurred while deleting the product. ${e}`
          : "An error occured"
      );
      throw new error({ status: "error" });
    }
  };
  const handleQuantityChange = async (id, change) => {
    try {
      const res = await fetch(`/api/product?id=${id}&change=${change}`, {
        method: "PATCH",
      });

      if (res.ok) {
        searching(searchQuery);
        toast.success("Updated successfully");
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (e) {
      toast.error("Error updating quantity:", e);
    }
  };

  const editProductDetails = async (product) => {
    const res = await deleteProduct(product._id, "EDIT");
    if (res.ok) {
      setProductForm({
        slug: product.slug,
        quantity: product.quantity,
        price: product.price,
      });
      toast.info("Product ready to edit.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLoading(true);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(searching(value), 500);
  };

  const searching = async (value) => {
    const res = await fetch(
      `/api/search?searchValue=${value}&&query2=${session.user.name}&query3=${session.user.email}`
    );
    let rjson = await res.json();
    setDropdown(rjson.products || []);
    setLoading(false);
  };

  const handleBlurClick = () => {
    if (!session) {
      toast.error("Please sign in first to use this feature.");
    }
  };

  useEffect(() => {
    setShowOverlay(!session); // Show overlay if not signed in
  }, [session]);

  return (
    <>
      <ToastCont />
      <Header session={session} signIn={signIn} signOut={signOut} />
      {showOverlay && (
        <div
          className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50"
          onClick={handleBlurClick}
        >
          <div className="text-center text-gray-800">
            {" "}
            <button
              onClick={() => signIn("google")}
              className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded z-50"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      )}
      <div className="container bg-red-100 mx-auto p-4 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Search a Product</h1>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Enter a product name"
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {searchQuery && loading && (
            <div className="absolute left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 p-2">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}

          {searchQuery && !loading && dropdown.length > 0 && (
            <div className="absolute left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {dropdown.map((product) => (
                <div
                  key={product.slug}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  <span className="block font-medium">{product.slug}</span>
                  <span className="text-sm text-gray-500">
                    Quantity:{" "}
                    <button
                      onClick={() => handleQuantityChange(product._id, "add")}
                      className="px-2 py-1 bg-green-500 mx-2 text-white rounded text-xs"
                    >
                      +
                    </button>
                    {product.quantity}
                    <button
                      onClick={() => handleQuantityChange(product._id, "sub")}
                      className="px-2 py-1 bg-red-500 mx-2 text-white rounded text-xs"
                    >
                      -
                    </button>
                    , Price: ₹{product.price}
                  </span>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !loading && dropdown.length === 0 && (
            <div className="absolute left-0 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 p-2">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Form */}
      <div className="container my-6 bg-red-100 mx-auto p-4 max-w-lg">
        <form className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Product Slug</label>
              <input
                name="slug"
                value={productForm?.slug || ""}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Quantity</label>
              <input
                value={productForm?.quantity || ""}
                name="quantity"
                onChange={handleChange}
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Price</label>
              <input
                value={productForm?.price || ""}
                name="price"
                onChange={handleChange}
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter price"
              />
            </div>
          </div>
          <button
            onClick={addProduct}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Display Current Stock */}
      <div className="container my-6 bg-red-100 mx-auto p-4 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Display Current Stock</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b bg-gray-100 text-left">
                  Product Slug
                </th>
                <th className="py-2 px-4 border-b bg-gray-100 text-left">
                  Quantity
                </th>
                <th className="py-2 px-4 border-b bg-gray-100 text-left">
                  Price
                </th>
                <th className="py-2 px-4 border-b bg-gray-100 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="py-2 px-4 border-b">{product.slug}</td>
                    <td className="py-2 px-4 border-b">{product.quantity}</td>
                    <td className="py-2 px-4 border-b">₹{product.price}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => editProductDetails(product)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id, "DELETE")}
                        className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-2 px-4 border-b text-center">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
