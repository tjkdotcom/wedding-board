"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DEFAULT_CATEGORIES = ["General", "Venue", "Florals", "Dress", "Music", "Food & Drink", "Photography", "Decor", "Pool Party", "Experiences", "Ceremony"];

export default function Home() {
  const [url, setUrl] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newItemCategory, setNewItemCategory] = useState("General");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
  }

  async function handleSave() {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      const { title, description, image, url: cleanUrl } = data.data;

      const newItem = {
        title: title || "Untitled",
        description: description || "",
        image: image?.url || null,
        url: cleanUrl || url,
        category: newItemCategory,
      };

      const { data: inserted } = await supabase.from("items").insert([newItem]).select();
      if (inserted) setItems(prev => [...inserted, ...prev]);
      setUrl("");
    } catch (e) {
      alert("Couldn't fetch that link. Try another!");
    }

    setLoading(false);
  }

  async function handleTitleSave(item) {
    await supabase.from("items").update({ title: editingTitle }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, title: editingTitle } : i));
    setEditingId(null);
  }

  async function handleCategoryChange(item, category) {
    await supabase.from("items").update({ category }).eq("id", item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, category } : i));
  }

  async function handleDelete(id) {
    await supabase.from("items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const categories = ["All", ...DEFAULT_CATEGORIES];
  const filteredItems = selectedCategory === "All" ? items : items.filter(i => i.category === selectedCategory);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "40px", backgroundColor: "#fdf8f4", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#7c4f6e" }}>💍 Our Wedding Board</h1>
      <p style={{ color: "#888", marginBottom: "30px" }}>Save ideas, videos, and inspiration all in one place.</p>

      {/* Save bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          placeholder="Paste a YouTube, TikTok, or any link..."
          style={{ flex: 1, minWidth: "200px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem" }}
        />
        <select
          value={newItemCategory}
          onChange={e => setNewItemCategory(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem", backgroundColor: "white" }}
        >
          {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{ padding: "12px 24px", backgroundColor: "#7c4f6e", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              backgroundColor: selectedCategory === cat ? "#7c4f6e" : "#ede0e8",
              color: selectedCategory === cat ? "white" : "#7c4f6e",
              fontWeight: selectedCategory === cat ? "600" : "400",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p style={{ color: "#bbb", textAlign: "center", marginTop: "80px" }}>Nothing saved here yet ✨</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", position: "relative" }}>

            <button
              onClick={() => handleDelete(item.id)}
              style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.4)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "0.75rem", zIndex: 1 }}
            >✕</button>

            {item.image && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }} />
              </a>
            )}

            <div style={{ padding: "16px" }}>
              {editingId === item.id ? (
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <input
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTitleSave(item)}
                    style={{ flex: 1, padding: "4px 8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                    autoFocus
                  />
                  <button onClick={() => handleTitleSave(item)} style={{ padding: "4px 10px", backgroundColor: "#7c4f6e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>✓</button>
                </div>
              ) : (
                <p
                  onClick={() => { setEditingId(item.id); setEditingTitle(item.title); }}
                  style={{ fontWeight: "600", color: "#333", margin: "0 0 8px 0", fontSize: "0.95rem", cursor: "pointer" }}
                  title="Click to edit title"
                >
                  {item.title}
                </p>
              )}

              <select
                value={item.category || "General"}
                onChange={e => handleCategoryChange(item, e.target.value)}
                style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "12px", border: "1px solid #ddd", backgroundColor: "#fdf8f4", color: "#7c4f6e", cursor: "pointer" }}
              >
                {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <p style={{ color: "#999", fontSize: "0.8rem", margin: "8px 0 0 0", lineHeight: "1.4" }}>
                {item.description?.slice(0, 100)}{item.description?.length > 100 ? "..." : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}