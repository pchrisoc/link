import connectMongoDB from "/src/config/database";
import Url from "/src/models/url";
import { notFound, redirect } from "next/navigation";
import { safeDestination } from '../../lib/security.mjs';

// Shared links must remain public, including when the visitor has no session.
export const dynamic = 'force-dynamic';
export default async function RedirectPage({ params }) {
    await connectMongoDB();
    const result = await Url.findOne({ unique: params.unique }).lean();
    const destination = safeDestination(result?.url);
    if (!destination) notFound();
    redirect(destination);
}
