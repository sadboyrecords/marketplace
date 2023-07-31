import Head from "next/head";
import { globalMeta } from "@/utils/constants";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImgUrl?: string;
  structuredData?: string;
  children?: React.ReactNode;
}

export default function Home({
  title = globalMeta.siteName,
  description = globalMeta.description,
  canonicalUrl = globalMeta.siteUrl,
  ogType,
  ogImgUrl = globalMeta.siteLogo,
  structuredData,
  children,
}: SeoHeadProps) {
  const sd =
    structuredData ||
    JSON.stringify({
      "@context": globalMeta.siteUrl,
      description: globalMeta.description,
    });
  return (
    <Head>
      <title>{title} </title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/*
        	Open graph meta tags.
    	*/}
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={globalMeta.siteName} />
      <meta property="og:type" content={ogType} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImgUrl} />
      <meta property="og:url" content={canonicalUrl} />

      {/*
        	Structured data.
    	*/}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sd }}
        key="item-jsonld"
      />
      {children}
    </Head>
  );
}
