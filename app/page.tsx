"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface InputData {
  line: string;
  name: string;
}

interface FormattedData {
  line: string;
  uuid: string;
  name: string;
  title: string;
  type: string;
  expanded: boolean;
  children?: FormattedData[];
  is_mandatory: boolean;
}

interface ParentSection {
  text: string;
  id: string;
  uuid: string;
  children: FormattedData[];
}

const typeOptions = ["number_type2", "passfail", "passfail_decline", "text_type2"];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("Inspection List");
  const [parsedData, setParsedData] = useState<InputData[]>([]);
  const [formattedData, setFormattedData] = useState<FormattedData[]>([]);
  const [documentId] = useState(uuidv4());
  const [sectionId] = useState(uuidv4().substring(0, 10));

  const handleInputPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (!e.target.value.trim()) {
      setParsedData([]);
      return;
    }

    try {
      const parsed = JSON.parse(e.target.value);
      if (!Array.isArray(parsed)) {
        alert("Input must be an array of objects");
        return;
      }

      // Validate structure of each object
      const isValid = parsed.every((item) => item && typeof item === "object" && "line" in item && "name" in item);

      if (!isValid) {
        alert('Each item must have "line" and "name" properties');
        return;
      }

      setParsedData(parsed);
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
      console.error("JSON parsing error:", error);
    }
  };

  const handleTypeChange = (index: number, type: string) => {
    const newData = [...formattedData];
    newData[index].type = type;
    setFormattedData(newData);
  };

  const generateFormattedJSON = () => {
    if (!parsedData.length) {
      alert("Please paste valid JSON input first");
      return;
    }

    if (!documentTitle.trim()) {
      alert("Please enter a document title");
      return;
    }

    if (!sectionTitle.trim()) {
      alert("Please enter a section title");
      return;
    }

    const formatted = parsedData.map((item) => ({
      line: item.line,
      uuid: uuidv4(),
      name: item.name,
      title: `<p>${item.name}</p>`,
      type: "number_type2",
      expanded: true,
      is_mandatory: false,
      children: [],
    }));
    setFormattedData(formatted);
  };

  const getFinalJSON = () => {
    const section: ParentSection = {
      text: sectionTitle,
      id: sectionId,
      uuid: uuidv4(),
      children: formattedData,
    };

    return [
      {
        id: documentId,
        text: documentTitle,
        uuid: uuidv4(),
        children: [section],
      },
    ];
  };

  const handleCopyToClipboard = async () => {
    if (!formattedData.length) {
      alert("No data to copy. Please process some data first.");
      return;
    }

    try {
      const jsonString = JSON.stringify(getFinalJSON(), null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert("JSON copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">JSON Data Formatter</h1>

      <div className="mb-4">
        <label className="block mb-2">Document Title:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Enter document title"
        />

        <label className="block mb-2">Section Title:</label>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="Enter section title"
        />

        <label className="block mb-2">Paste JSON Input:</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={5}
          value={inputText}
          onChange={handleInputPaste}
          placeholder="Paste your JSON input here"
        />
        <button onClick={generateFormattedJSON} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Process Input
        </button>
      </div>

      {formattedData.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Data Table</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Line</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">UUID</th>
                <th className="border p-2">Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {formattedData.map((item, index) => (
                <tr key={item.uuid}>
                  <td className="border p-2">{item.line}</td>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">
                    <select value={item.type} onChange={(e) => handleTypeChange(index, e.target.value)} className="w-full p-1 border rounded">
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">{item.uuid}</td>
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={item.is_mandatory}
                      onChange={(e) => {
                        const newData = [...formattedData];
                        newData[index].is_mandatory = e.target.checked;
                        setFormattedData(newData);
                      }}
                      className="form-checkbox h-5 w-5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formattedData.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Generated JSON</h2>
            <button onClick={handleCopyToClipboard} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              Copy JSON
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(getFinalJSON(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
