import { useState, useMemo } from "react";
import { RECIPES, CAT_COLORS } from "./data/recipes.js";
import { WINDMILL_GOODS, WINDMILL_COLORS } from "./data/windmill.js";

const CATS = ["All", "Salad", "Soup", "Side", "Main Dish", "Dessert", "Other"];
const WINDMILL_CATS = ["All", "Red", "Blue", "Yellow"];

const CAT_EMOJI = {
  All: "🍽️", Salad: "🥗", Soup: "🍲", Side: "🍞",
  "Main Dish": "🍛", Dessert: "🍰", Other: "✨",
};

const WINDMILL_EMOJI = { All: "⚙️", Red: "🔴", Blue: "🔵", Yellow: "🟡" };

const CAT_COLOR_MAP = {
  All: "#e07b39", Salad: "#1e5c2f", Soup: "#1a4a6b", Side: "#5c3d00",
  "Main Dish": "#6b1a1a", Dessert: "#5a1a6b", Other: "#2e1a6b",
};

const WINDMILL_BTN_COLOR = { All: "#555", Red: "#991b1b", Blue: "#1e40af", Yellow: "#854d0e" };

// Extract unique effect categories for kitchen mode
const EFFECT_CATEGORIES = (() => {
  const cats = new Set();
  RECIPES.forEach(r => {
    if (r.effect) {
      const cat = r.effect.replace(/\s+Lv\.\s*\d+$/, "").trim();
      cats.add(cat);
    }
  });
  return ["All Effects", ...Array.from(cats).sort()];
})();

const NO_PRICE_KEY = "NO_PRICE";
const NO_PRICE_LABEL = "No Price";

function getPriceSortValue(price) {
  if (!price || price === "N/A" || price === "Unique") return Number.NEGATIVE_INFINITY;
  const parsed = parseInt(price.replace(/,/g, "").replace(" G", ""), 10);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function getDisplayPrice(price) {
  if (!price || price === "N/A" || price === "Unique") return NO_PRICE_LABEL;
  return price;
}

function getPriceSortKey(price) {
  return (!price || price === "N/A" || price === "Unique") ? NO_PRICE_KEY : price;
}

function norm(s) { return s.toLowerCase().trim(); }
function ingMatch(ing, q) { return norm(ing).includes(norm(q)); }

export default function App() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState([]);
  const [cat, setCat] = useState("All");
  const [effectFilter, setEffectFilter] = useState("All Effects");
  const [sortOrder, setSortOrder] = useState("none");
  const [mode, setMode] = useState("all"); // "kitchen" | "windmill" | "all"
  const [windmillCat, setWindmillCat] = useState("All");

  const switchMode = (m) => {
    setMode(m);
    setText("");
    setSelected([]);
    setCat("All");
    setWindmillCat("All");
    setEffectFilter("All Effects");
    setSortOrder("none");
  };

  const addIngredient = (ing) => {
    const trimmed = ing.trim();
    if (!trimmed) return;
    setSelected(prev =>
      prev.some(s => norm(s) === norm(trimmed)) ? prev : [...prev, trimmed]
    );
    setText("");
  };

  const removeIngredient = (i) => {
    setSelected(prev => prev.filter((_, idx) => idx !== i));
  };

  const filteredKitchen = useMemo(() => {
    let result = RECIPES.filter(r => {
      if (cat !== "All" && r.cat !== cat) return false;
      for (const s of selected) {
        if (!r.ingredients.some(i => ingMatch(i, s))) return false;
      }
      if (text && !r.ingredients.some(i => ingMatch(i, text)) && !norm(r.name).includes(norm(text))) return false;
      if (effectFilter !== "All Effects") {
        const effectCat = r.effect.replace(/\s+Lv\.\s*\d+$/, "").trim();
        if (effectCat !== effectFilter) return false;
      }
      return true;
    });
    if (sortOrder !== "none") {
      result = [...result].sort((a, b) => {
        const diff = getPriceSortValue(a.price) - getPriceSortValue(b.price);
        return sortOrder === "asc" ? diff : -diff;
      });
    }
    return result;
  }, [text, selected, cat, effectFilter, sortOrder]);

  const filteredWindmill = useMemo(() => {
    let result = WINDMILL_GOODS.filter(r => {
      if (windmillCat !== "All" && r.windmill !== windmillCat) return false;
      for (const s of selected) {
        if (!r.ingredients.some(i => ingMatch(i, s))) return false;
      }
      if (text && !r.ingredients.some(i => ingMatch(i, text)) && !norm(r.name).includes(norm(text))) return false;
      return true;
    });
    if (sortOrder !== "none") {
      result = [...result].sort((a, b) => {
        const diff = getPriceSortValue(a.price) - getPriceSortValue(b.price);
        return sortOrder === "asc" ? diff : -diff;
      });
    }
    return result;
  }, [text, selected, windmillCat, sortOrder]);

  const isWindmill = mode === "windmill";
  const isAll = mode === "all";

  const filteredAll = useMemo(() => {
    if (!isAll) return [];
    const kitchen = RECIPES.filter(r => {
      if (cat !== "All" && r.cat !== cat) return false;
      if (effectFilter !== "All Effects") {
        const effectCat = r.effect.replace(/\s+Lv\.\s*\d+$/, "").trim();
        if (effectCat !== effectFilter) return false;
      }
      for (const s of selected) {
        if (!r.ingredients.some(i => ingMatch(i, s))) return false;
      }
      if (text && !r.ingredients.some(i => ingMatch(i, text)) && !norm(r.name).includes(norm(text))) return false;
      return true;
    }).map(r => ({ ...r, _type: "kitchen" }));
    const wm = WINDMILL_GOODS.filter(r => {
      if (windmillCat !== "All" && r.windmill !== windmillCat) return false;
      for (const s of selected) {
        if (!r.ingredients.some(i => ingMatch(i, s))) return false;
      }
      if (text && !r.ingredients.some(i => ingMatch(i, text)) && !norm(r.name).includes(norm(text))) return false;
      return true;
    }).map(r => ({ ...r, _type: "windmill" }));
    let result = [...kitchen, ...wm];
    if (sortOrder !== "none") {
      result = result.sort((a, b) => {
        const diff = getPriceSortValue(a.price) - getPriceSortValue(b.price);
        return sortOrder === "asc" ? diff : -diff;
      });
    }
    return result;
  }, [text, selected, sortOrder, isAll, cat, windmillCat, effectFilter]);

  const filtered = isAll ? filteredAll : isWindmill ? filteredWindmill : filteredKitchen;
  const totalCount = isAll ? RECIPES.length + WINDMILL_GOODS.length : isWindmill ? WINDMILL_GOODS.length : RECIPES.length;
  const hasActiveFilters = selected.length > 0
    || (!isWindmill && effectFilter !== "All Effects")
    || (!isWindmill && cat !== "All")
    || ((isWindmill || isAll) && windmillCat !== "All");

  const WONDERSTONE_ITEM_PATTERN = /(Windmill Churn|Jewelry Stand|Sun Stone|Travel Stone)/i;
  const requiresPurpleWonderstone = (item) => WONDERSTONE_ITEM_PATTERN.test(item.name);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "linear-gradient(160deg,#c8e6f5 0%,#e8f5d0 50%,#fdf6e3 100%)", color: "#3a2e1f" }}>
      <div style={{ background: "linear-gradient(135deg,#4a9e4a,#3a7e3a)", padding: "18px 20px 14px", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
        <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
          🌾 Grand Bazaar Recipe Finder
        </div>
        <div style={{ color: "#c8f0c8", fontSize: "0.85rem", marginTop: 2, fontWeight: 600 }}>
          Story of Seasons: Grand Bazaar · All 266 recipes · Search by ingredient
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 14px 48px" }}>

        {/* ── Mode toggle ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "center" }}>
          {[
            { key: "kitchen",  label: "🍳 Kitchen Recipes", count: RECIPES.length },
            { key: "windmill", label: "⚙️ Windmill Goods",  count: WINDMILL_GOODS.length },
            { key: "all",      label: "🔍 Search All",       count: RECIPES.length + WINDMILL_GOODS.length },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              style={{
                padding: "9px 22px", borderRadius: 50, fontSize: "0.9rem", fontWeight: 800,
                cursor: "pointer", fontFamily: "inherit",
                border: mode === m.key ? "2.5px solid transparent" : "2.5px solid #ccc",
                background: mode === m.key ? (m.key === "windmill" ? "linear-gradient(135deg,#b91c1c,#1d4ed8,#a16207)" : m.key === "all" ? "linear-gradient(135deg,#6b21a8,#1d4ed8)" : "linear-gradient(135deg,#4a9e4a,#3a7e3a)") : "#fff",
                color: mode === m.key ? "#fff" : "#777",
                boxShadow: mode === m.key ? "0 3px 10px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {m.label} <span style={{ opacity: 0.75, fontWeight: 600, fontSize: "0.8rem" }}>({m.count})</span>
            </button>
          ))}
        </div>

        {/* ── Ingredient / name search ── */}
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "2.5px solid #c8e0b0", borderRadius: 50, padding: "10px 18px", boxShadow: "0 4px 14px rgba(58,46,31,0.1)", marginBottom: 12 }}>
          <span style={{ fontSize: "1.2rem", marginRight: 10 }}>🔍</span>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && text.trim()) addIngredient(text); }}
            placeholder={isWindmill ? "Search windmill goods or inputs…" : isAll ? "Search recipes and windmill goods…" : "Type an ingredient or recipe name, press Enter to lock…"}
            style={{ border: "none", outline: "none", fontSize: "1rem", fontWeight: 600, color: "#3a2e1f", width: "100%", background: "transparent", fontFamily: "inherit" }}
          />
          {text && <button onClick={() => setText("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#aaa" }}>×</button>}
        </div>

        {/* ── Locked ingredient badges ── */}
        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {selected.map((s, i) => (
              <span key={i} onClick={() => removeIngredient(i)} style={{ background: "#fff3d0", border: "1.5px solid #f0c060", color: "#7a4e00", borderRadius: 50, padding: "4px 12px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                🌿 {s} <span style={{ fontSize: "1rem" }}>×</span>
              </span>
            ))}
            <span onClick={() => setSelected([])} style={{ background: "#fee", border: "1.5px solid #faa", color: "#a00", borderRadius: 50, padding: "4px 12px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Clear all</span>
          </div>
        )}

        {!hasActiveFilters && !text && (
          <div style={{ background: "#fffbe8", border: "1.5px solid #f5c842", borderRadius: 10, padding: "7px 14px", fontSize: "0.82rem", color: "#7a5c00", fontWeight: 600, marginBottom: 12 }}>
            💡 Press <strong>Enter</strong> to lock in an ingredient and filter by multiple at once. Click any ingredient badge on a card to add it!
          </div>
        )}

        {/* ── Category filters ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {!isWindmill && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 2 }}>
                Category:
              </span>
              {CATS.map(c2 => {
                const active = cat === c2;
                return (
                  <button key={c2} onClick={() => setCat(c2)} style={{ padding: "6px 14px", borderRadius: 50, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: active ? "2px solid transparent" : "2px solid #ddd", background: active ? CAT_COLOR_MAP[c2] : "#fff", color: active ? "#fff" : "#777", fontFamily: "inherit" }}>
                    {CAT_EMOJI[c2]} {c2}
                  </button>
                );
              })}
            </div>
          )}

          {(isWindmill || isAll) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 2 }}>
                Windmill:
              </span>
              {WINDMILL_CATS.map(w => {
                const active = windmillCat === w;
                const col = WINDMILL_BTN_COLOR[w];
                return (
                  <button key={w} onClick={() => setWindmillCat(w)} style={{ padding: "6px 14px", borderRadius: 50, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: active ? "2px solid transparent" : "2px solid #ddd", background: active ? col : "#fff", color: active ? "#fff" : "#777" }}>
                    {WINDMILL_EMOJI[w]} {w === "All" ? "All" : `${w} Windmill`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Effect filter + Sort (kitchen only for effect) ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, alignItems: "center" }}>
          {!isWindmill && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.06em" }}>Effect:</span>
              <select
                value={effectFilter}
                onChange={e => setEffectFilter(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 700, border: effectFilter !== "All Effects" ? "2px solid #9b59b6" : "2px solid #ddd", background: effectFilter !== "All Effects" ? "#f3d9f8" : "#fff", color: effectFilter !== "All Effects" ? "#5a1a6b" : "#777", cursor: "pointer", fontFamily: "inherit" }}
              >
                {EFFECT_CATEGORIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.06em" }}>Sort price:</span>
            {[
              { value: "none", label: "Default" },
              { value: "asc",  label: "↑ Cheapest" },
              { value: "desc", label: "↓ Priciest" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortOrder(opt.value)}
                style={{ padding: "6px 12px", borderRadius: 50, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: sortOrder === opt.value ? "2px solid transparent" : "2px solid #ddd", background: sortOrder === opt.value ? "#7a4e00" : "#fff", color: sortOrder === opt.value ? "#fff" : "#777", fontFamily: "inherit" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Result count ── */}
        <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#8B5E3C", marginBottom: 12 }}>
          {filtered.length === totalCount
            ? `Showing all ${totalCount} ${isAll ? "items" : isWindmill ? "windmill goods" : "recipes"}`
            : `${filtered.length} ${isAll ? "item" : isWindmill ? "item" : "recipe"}${filtered.length !== 1 ? "s" : ""} found`}
        </div>

        {/* ── Cards ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#bbb" }}>
            <div style={{ fontSize: "3.5rem" }}>{isWindmill ? "⚙️" : "🌾"}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 10 }}>
              No results found — try a different ingredient or name!
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {filtered.map(item => {
              if (isWindmill || item._type === "windmill") {
                const wc = WINDMILL_COLORS[item.windmill];
                return (
                  <div key={item.name + item.windmill} style={{ background: "#fffdf6", border: "2px solid #e0d4b8", borderRadius: 14, padding: 14, boxShadow: "0 3px 10px rgba(58,46,31,0.1)", display: "flex", flexDirection: "column", gap: 9 }}>
                    {item.img && (
                      <div style={{ textAlign: "center" }}>
                        <img src={`${import.meta.env.BASE_URL}${item.img}`} alt={item.name} style={{ height: 80, objectFit: "contain" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.25 }}>{item.name}</div>
                      <span style={{ background: wc.bg, color: wc.text, border: `1.5px solid ${wc.border}`, borderRadius: 50, padding: "3px 9px", fontSize: "0.7rem", fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {WINDMILL_EMOJI[item.windmill]} {item.windmill}
                      </span>
                    </div>
                    {requiresPurpleWonderstone(item) && (
                      <div style={{ marginTop: -2, fontSize: "0.73rem", fontWeight: 800, color: "#6b21a8", display: "flex", alignItems: "center", gap: 5 }}>
                        🟣 Purple Wonderstone Required
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {item.ingredients.map((ing, idx) => {
                        const isSelected = selected.some(s => ingMatch(ing, s));
                        const isTyped = text && ingMatch(ing, text);
                        return (
                          <span key={idx} onClick={() => addIngredient(ing)} title={ing} style={{ fontSize: "0.76rem", fontWeight: 700, padding: "3px 8px", borderRadius: 7, cursor: "pointer", background: isSelected ? "#c8f7c5" : isTyped ? "#ffe082" : "#f0ede4", border: isSelected ? "1.5px solid #5cb85c" : isTyped ? "1.5px solid #f5c842" : "1.5px solid transparent", color: "#3a2e1f" }}>
                            {ing}
                          </span>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px solid #f0ede4", paddingTop: 8, fontSize: "0.76rem" }}>
                      <span style={{ fontWeight: 800, color: "#7a4e00" }} title={getPriceSortKey(item.price)}>💰 {getDisplayPrice(item.price)}</span>
                      <span style={{ color: "#999", fontStyle: "italic", fontSize: "0.7rem" }}>⏱ {item.time}</span>
                    </div>
                  </div>
                );
              }

              // Kitchen recipe card
              const recipe = item;
              const colors = CAT_COLORS[recipe.cat] || CAT_COLORS.Other;
              return (
                <div key={recipe.name} style={{ background: "#fffdf6", border: "2px solid #e0d4b8", borderRadius: 14, padding: 14, boxShadow: "0 3px 10px rgba(58,46,31,0.1)", display: "flex", flexDirection: "column", gap: 9 }}>
                  {recipe.img && (
                    <div style={{ textAlign: "center" }}>
                      <img src={`${import.meta.env.BASE_URL}${recipe.img}`} alt={recipe.name} style={{ height: 80, objectFit: "contain" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.25 }}>{recipe.name}</div>
                    <span style={{ background: colors.bg, color: colors.text, border: `1.5px solid ${colors.border}`, borderRadius: 50, padding: "3px 9px", fontSize: "0.7rem", fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {recipe.cat}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {recipe.ingredients.map((ing, idx) => {
                      const isSelected = selected.some(s => ingMatch(ing, s));
                      const isTyped = text && ingMatch(ing, text);
                      return (
                        <span key={idx} onClick={() => addIngredient(ing)} title={ing} style={{ fontSize: "0.76rem", fontWeight: 700, padding: "3px 8px", borderRadius: 7, cursor: "pointer", background: isSelected ? "#c8f7c5" : isTyped ? "#ffe082" : "#f0ede4", border: isSelected ? "1.5px solid #5cb85c" : isTyped ? "1.5px solid #f5c842" : "1.5px solid transparent", color: "#3a2e1f" }}>
                          {ing}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px solid #f0ede4", paddingTop: 8, fontSize: "0.76rem" }}>
                    <span style={{ fontWeight: 800, color: "#7a4e00" }} title={getPriceSortKey(recipe.price)}>💰 {getDisplayPrice(recipe.price)}</span>
                    {recipe.effect && <span style={{ color: "#999", fontStyle: "italic", fontSize: "0.7rem" }}>✨ {recipe.effect}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
