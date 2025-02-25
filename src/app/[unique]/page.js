import connectMongoDB from "@/config/database";
import Url from "@/models/url";

import { notFound, redirect } from "next/navigation";

export default async function RedirectPage({ params }) {
    try {
        const { unique } = params;
        await connectMongoDB();
        const result = await Url.findOne({ unique: unique });

        if (!result) {
            return notFound();
        }
        return redirect(result.url);
    } catch (error) {
        console.error("Error in redirect page:", error);
        if (
            error.name === "MongoTimeoutError" ||
            (error.message && error.message.toLowerCase().includes("timed out"))
        ) {
            throw new Error("Database timeout error");
        }
        throw error;
    }
}