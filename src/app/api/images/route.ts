import { NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        // Use a real user agent
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        await page.setViewport({ width: 1280, height: 800 });

        const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safe=active`;
        await page.goto(searchUrl, { waitUntil: "networkidle2" });

        // Scrape high-quality image URLs from Bing
        const images = await page.evaluate((queryText: string) => {
            interface ImageResult {
                id: string;
                url: string;
                title: string;
            }
            const results: ImageResult[] = [];
            // Bing stores image metadata in an attribute 'm' within 'a.iusc' elements
            const imageLinks = Array.from(document.querySelectorAll("a.iusc"));

            for (const a of imageLinks) {
                if (results.length >= 12) break;

                const mAttr = a.getAttribute("m");
                if (mAttr) {
                    try {
                        const mData = JSON.parse(mAttr);
                        const imgUrl = mData.murl; // high-resolution URL
                        const title = mData.t || queryText;

                        if (imgUrl && typeof imgUrl === "string" && imgUrl.startsWith("http")) {
                            results.push({
                                id: `bing-${results.length}-${Date.now()}`,
                                url: imgUrl,
                                title: title as string,
                            });
                        }
                    } catch {
                        // Ignore parse errors for individual items
                    }
                }
            }

            return results;
        }, query);

        await browser.close();

        return NextResponse.json(images);
    } catch (err) {
        if (browser) await browser.close();
        console.error("Scraping error:", err);
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}
