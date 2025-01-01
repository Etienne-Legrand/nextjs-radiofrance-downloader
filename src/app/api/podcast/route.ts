import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

type PodcastInfo = {
  name: string;
  imageUrl: string;
  audioUrl: string;
};

type Episode = {
  "@type": string;
  name: string;
  image: {
    "@type": string;
    url: string;
  };
  mainEntity: {
    "@type": string;
    contentUrl: string;
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    let podcastData: Episode | undefined;

    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonContent = JSON.parse($(element).html() ?? "{}");
        const graph = jsonContent["@graph"] || [jsonContent];

        for (const item of graph) {
          if (item["@type"] === "RadioEpisode") {
            podcastData = item as Episode;
            break;
          }
        }
      } catch (err) {
        console.error("Error parsing JSON-LD:", err);
      }
    });

    if (!podcastData) {
      return NextResponse.json(
        { error: "Podcast data not found" },
        { status: 404 }
      );
    }

    const podcastInfo: PodcastInfo = {
      name: podcastData.name,
      imageUrl: podcastData.image.url,
      audioUrl: podcastData.mainEntity.contentUrl,
    };

    return NextResponse.json(podcastInfo);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch podcast info" },
      { status: 500 }
    );
  }
}
