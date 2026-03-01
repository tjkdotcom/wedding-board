"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_CATEGORIES = ["General", "Venue", "Florals", "Dress", "Music", "Food & Drink", "Photography", "Decor", "Pool Party", "Experiences", "Ceremony"];

export default function SharePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Saving...");
  const [category, setCategory] = useState("General");
  const [url, setUrl] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sharedUrl = searchParams.get("url") || searchParams.get("text") || "";
    setUrl(sharedUrl);
    setReady(true);
  }, [searchParams]);

  async function handleSave() {
    if (!url) {
      setStatus("No link found.");
      return;
    }

    setStatus("Fetching preview...");

    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      const { title, description, image, url: cleanUrl } = data.data;

      await supabase.from("items").insert([{
        title: title || "Untitled",
        description: description || "",
        image: image?.url || null,
        url: cleanUrl || url,
        category,
      }]);

      setStatus("Saved! Redirecting...");
      setTimeout(() => router.push("/"), 1500);
    } catch (e) {
      setStatus("Something went wrong. Try again.");
    }
  }

  if (!ready) return <p style={{ padding: "40px", fontFamily: "sans-serif" }}>Loading...</p>;

  return (
    <main style={{ fontFamily: "sans-serif", padding: "40px", backgroundColor: "#fdf8f4", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "1.8rem", color: "#7c4f6e", marginBottom: "8px" }}>💍 Save to Wedding Board</h1>
      <p style={{ color: "#888", marginBottom: "24px" }}>Choose a category and save this link.</p>

      <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "16px", wordBreak: "break-all" }}>{url}</p>

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", backgroundColor: "white", marginBottom: "16px" }}
      >
        {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>

      <button
        onClick={handleSave}
        style={{ width: "100%", padding: "14px", backgroundColor: "#7c4f6e", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}
      >
        Save to Board
      </button>

      <p style={{ color: "#aaa", marginTop: "16px", textAlign: "center" }}>{status}</p>
    </main>
  );
}