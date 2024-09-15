import { NextResponse } from "next/server";
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URL;

const client = new MongoClient(uri);

// GET: Retrieve all products
export async function GET(request) {
  const queryParams = request.nextUrl.searchParams;

  // Retrieve query parameters
  const query2 = queryParams.get("query2");
  const query3 = queryParams.get("query3");

  try {
    await client.connect(); // Ensure client is connected
    const database = client.db("Stock");
    const inventory = database.collection("inventory");

    // Fetch all products from inventory collection
    const products = await inventory
      .find({
        UserName: query2,
        UserEmail: query3,
      })
      .toArray();

    // Return the products as JSON
    return NextResponse.json({ products, success: true });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  } finally {
    await client.close(); // Close the connection after query
  }
}

// POST: Add a product
export async function POST(request) {
  try {
    const body = await request.json(); // Parse the incoming request body

    await client.connect(); // Ensure client is connected
    const database = client.db("Stock");
    const inventory = database.collection("inventory");

    // Insert the product into the inventory collection
    const product = await inventory.insertOne(body);

    // Return the newly created product
    return NextResponse.json({ product, ok: true });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  } finally {
    await client.close(); // Close the connection after the operation
  }
}

export async function DELETE(request) {
  const queryParams = request.nextUrl.searchParams;

  // Retrieve query parameter
  const id = queryParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  try {
    await client.connect(); // Ensure client is connected
    console.log("Connected to MongoDB");
    const database = client.db("Stock");
    const inventory = database.collection("inventory");

    // Convert the ID to an ObjectId
    let objectId;
    try {
      // Ensure id is a valid ObjectId string
      objectId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Delete the product by ID
    const result = await inventory.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    await client.close(); // Close the connection after query
  }
}

export async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const change = searchParams.get("change");

  if (!id) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    await client.connect();
    const database = client.db("Stock");
    const inventory = database.collection("inventory");

    // Validate ObjectId format
    if (ObjectId.isValid(id)) {
      const objectId = new ObjectId(id);

      // Find the product to ensure it exists
      const product = await inventory.findOne({ _id: objectId });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      // Calculate new quantity
      const newQuantity =
        change === "add"
          ? parseInt(product.quantity) + 1
          : parseInt(product.quantity) - 1;
      if (newQuantity < 0) {
        return NextResponse.json(
          { error: "Quantity cannot be negative" },
          { status: 400 }
        );
      }

      // Update the quantity
      const result = await inventory.updateOne(
        { _id: objectId },
        { $set: { quantity: newQuantity } }
      );

      if (result.modifiedCount === 1) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: "Failed to update quantity" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  } finally {
    await client.close(); // Close the connection after query
  }
}
