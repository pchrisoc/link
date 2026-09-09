import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

import connectMongoDB from "/src/config/database";
import Url from "/src/models/url";

import { getSession } from '../../../lib/auth';
import { safeDestination, validAlias, trustedOrigin } from '../../../lib/security.mjs';

export async function POST(request) {
    try {
        if (!await getSession()) return NextResponse.json({ message: "Sign in to create links." }, { status: 401 });
        if (!trustedOrigin(request)) return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
        const requestData = await request.json().catch(() => null);
        const destination = safeDestination(requestData?.url);

        if (!destination) {
            return NextResponse.json(
                { message: "Enter a valid HTTP or HTTPS URL without embedded credentials." },
                { status: 400 }
            );
        }

        const alias = requestData.customAddress;
        if (alias != null && (typeof alias !== 'string' || (alias.trim() && !validAlias(alias.trim())))) {
            return NextResponse.json({ message: "Aliases must use 1–64 letters, numbers, hyphens or underscores and cannot use reserved names." }, { status: 400 });
        }
        await connectMongoDB();

        let unique;
        if (alias && alias.trim()) {
            const existingUrl = await Url.findOne({ unique: alias.trim() });
    
            if (existingUrl) {
                return NextResponse.json(
                    { message: "Custom unique already exists" },
                    { status: 400 }
                );
            }
    
            unique = alias.trim();
        } else {
            do { unique = nanoid(5); } while (!validAlias(unique));
        }
    
        const query = await Url.create({ 
            url: destination,
            unique: unique
        });
    
        return NextResponse.json(
            { message: "Success shorten URL", data: query },
            { status: 200 }
        );
    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ message: "Alias already exists. Please choose another." }, { status: 409 });
        console.error("Error in POST /shorten:", error.name);
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