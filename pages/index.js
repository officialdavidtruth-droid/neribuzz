import Head from "next/head";
import NeriBuzz from "../components/NeriBuzz";

export default function Home() {
  return (
    <>
      <Head>
        <title>NeriBuzz — Your Nigerian News Pulse</title>
        <meta name="description" content="NeriBuzz aggregates top headlines from Punch, Vanguard, BBC Africa, Al Jazeera, ESPN and more — all in one place." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Open Graph */}
        <meta property="og:title"       content="NeriBuzz — Your Nigerian News Pulse" />
        <meta property="og:description" content="Top headlines from Nigeria and the world, aggregated in real time." />
        <meta property="og:type"        content="website" />
      </Head>
      <NeriBuzz />
    </>
  );
}
