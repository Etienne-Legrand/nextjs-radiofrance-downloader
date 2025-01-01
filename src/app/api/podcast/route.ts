import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { Podcast } from "@/app/types/podcast";

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
    // Étape 1 : Récupérer le contenu HTML de la page
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch the page content" },
        { status: response.status }
      );
    }
    const html = await response.text();

    // Étape 2 : Extraire l'ID de diffusion depuis la balise <meta>
    const $ = cheerio.load(html);
    const metaContent = $('meta[property="al:ios:url"]').attr("content");
    const diffusionIdMatch = metaContent?.match(/diffusionId=([\w-]+)/);
    const diffusionId = diffusionIdMatch ? diffusionIdMatch[1] : null;

    if (!diffusionId) {
      return NextResponse.json(
        { error: "Diffusion ID not found in the page" },
        { status: 404 }
      );
    }

    // Étape 3 : Récupérer les données du podcast via l'API de Radio France
    const apiResponse = await fetch(
      `https://www.radiofrance.fr/api/expressions?ids=${diffusionId}`
    );
    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch podcast data from the API" },
        { status: apiResponse.status }
      );
    }
    const apiData = await apiResponse.json();

    const podcastData = apiData.items?.[0];
    if (!podcastData) {
      return NextResponse.json(
        { error: "Podcast data not found in the API response" },
        { status: 404 }
      );
    }

    // Étape 4 : Construire l'objet Podcast
    const podcast: Podcast = {
      title: podcastData.title || "Untitled Podcast",
      imageUrl: podcastData.visual?.webpSrc || "",
      audioUrl: podcastData.playerInfo?.media?.sources?.[0]?.url || "",
      playlistImageUrl:
        podcastData.playerInfo?.playerMetadata?.cover?.src || "",
      playlistTitle: podcastData.playerInfo?.playerMetadata?.firstLine || "",
      playlistUrl: `https://radiofrance.fr/${podcastData.playerInfo?.playerMetadata?.firstLinePath}`,
    };

    if (!podcast.audioUrl) {
      return NextResponse.json(
        { error: "Audio URL not found in podcast data" },
        { status: 404 }
      );
    }

    // Retourner les informations
    return NextResponse.json(podcast);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
