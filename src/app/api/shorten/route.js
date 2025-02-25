import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import connectMongoDB from "@/config/database";
import Url from "@/models/url";

export async function POST(request) {
    try {
        const requestData = await request.json();

        if (!requestData.url) {
            return NextResponse.json(
                { message: "Invalid parameters" },
                { status: 400 }
            );
        }

        await connectMongoDB();

        let unique;
        if (requestData.customAddress && requestData.customAddress.trim() !== "") {
            const existingUrl = await Url.findOne({ unique: requestData.customAddress });
    
            if (existingUrl) {
                return NextResponse.json(
                    { message: "Custom unique already exists" },
                    { status: 400 }
                );
            }
    
            unique = requestData.customAddress;
        } else {
            unique = nanoid(5);
        }
    
        const query = await Url.create({ 
            url: requestData.url,
            unique: unique
        });
    
        return NextResponse.json(
            { message: "Success shorten URL", data: query },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in POST /shorten:", error);
        if (
            error.name === "MongoTimeoutError" ||
            (error.message && error.message.toLowerCase().includes("timed out"))
        ) {
            return NextResponse.json(
                { message: "Database timeout error" },
                { status: 504 }
            );
        }
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}