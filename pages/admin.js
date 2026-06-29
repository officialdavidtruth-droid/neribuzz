import Head from "next/head";
import dynamic from "next/dynamic";

// Load admin panel client-side only (uses localStorage)
const AdminPanel = dynamic(() => import("../components/AdminPanel"), { ssr: false });

export default function AdminPage() {
  return (
    <>
      <Head>
        <title>Admin — NeriBuzz</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <AdminPanel />
    </>
  );
}
