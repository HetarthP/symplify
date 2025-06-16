"use client";
import { useState } from "react";

export default function MedMatePage() {
  const [allSymptoms] = useState<string[]>([
    "itching", "vomiting", "fatigue", "nausea", "headache", "cough"
    // Add full list later
  ]);
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [results, setResults] = useState<{ disease: string; confidence: number }[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    const combinedInput = customInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    const allSelected = Array.from(new Set([...selected, ...combinedInput]));
    if (allSelected.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: allSelected }),
      });

      const data = await res.json();
      setResults([{ disease: data.prediction, confidence: data.confidence }]);
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-6xl font-extrabold text-red-500 drop-shadow-lg">Symplify</h1>
        <p className="text-lg text-gray-300 mt-4">
          Real-Time Symptom-to-Disease Prediction powered by Dataset Intelligence.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur rounded-2xl shadow-lg p-6">
        <p className="text-gray-300 text-sm mb-2">
          Enter your symptoms (comma-separated) or use the symptom selector below:
        </p>

        <textarea
          rows={3}
          placeholder="e.g. chills, shivering, fatigue"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-white text-black placeholder:text-gray-500"
        />

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded transition"
          >
            {showDropdown ? "Hide Symptom List" : "Show Symptom List"}
          </button>
        </div>

        {showDropdown && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {allSymptoms.map((symptom) => (
              <label key={symptom} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(symptom)}
                  onChange={() => handleToggle(symptom)}
                  className="accent-red-500"
                />
                <span className="capitalize">{symptom.replaceAll("_", " ")}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Predict"}
          </button>
        </div>
      </div>

      {results && (
        <div className="max-w-md mx-auto mt-10 p-6 rounded-xl bg-green-100 text-green-800 text-center shadow-md animate-fade-in">
          <h2 className="text-2xl font-semibold">🧬 Prediction: {results[0].disease}</h2>
          <p className="mt-2 text-lg">Confidence: {results[0].confidence}%</p>
        </div>
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm">
        Built using Next.js & FastAPI · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
