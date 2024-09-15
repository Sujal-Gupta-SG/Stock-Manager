import { NextResponse } from "next/server";
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

export async function GET(request) {
  const queryParams = request.nextUrl.searchParams;

  // Retrieve query parameters
  const searchValue = queryParams.get("searchValue");
  const query2 = queryParams.get("query2");
  const query3 = queryParams.get("query3");

  try {
    await client.connect(); // Ensure client is connected
    console.log("Connected to MongoDB");
    const database = client.db("Stock");
    const inventory = database.collection("inventory");

    // Construct query based on whether searchValue is provided
    const query = {
      UserName: query2,
      UserEmail: query3,
      ...(searchValue
        ? {
            slug: { $regex: searchValue, $options: "i" },
          }
        : {}),
    };

    // Fetch products based on constructed query
    const products = await inventory.find(query).toArray();

    // Return the products as JSON
    return NextResponse.json({ products, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  } finally {
    await client.close(); // Close the connection after query
  }
}
