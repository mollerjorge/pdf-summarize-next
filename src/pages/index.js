import React, { useState } from "react";

import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  React.useEffect(() => {
    document
      .getElementById("file-input")
      .addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file.type !== "application/pdf") {
          console.error(file.name, "is not a PDF file.");
          return;
        }

        const fileReader = new FileReader();

        fileReader.onload = function () {
          const typedarray = new Uint8Array(this.result);

          // Load the PDF file.
          pdfjsLib.getDocument({ data: typedarray }).promise.then((pdf) => {
            console.log("PDF loaded");

            // Fetch the first page
            pdf.getPage(1).then((page) => {
              console.log("Page loaded");

              // Get text from the page
              page.getTextContent().then((textContent) => {
                let text = "";
                textContent.items.forEach((item) => {
                  text += item.str + " ";
                });

                // Display text content
                document.getElementById("pdfContent").innerText = text;
                setIsLoading(true);
                const response = fetch("http://localhost:3000/api/hello", {
                  method: "POST",
                  body: JSON.stringify({
                    text,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log('***', data)
                    setIsLoading(false)
                    setSummary(data.message.content);
                  });
              });
            });
          });
        };

        fileReader.readAsArrayBuffer(file);
      });
  }, []);
  return (
    <main
      className={`flex min-h-screen bg-gray-100 flex-col items-center p-24 ${inter.className}`}
    >
      <input className="hidden" id="file-input" type="file" />

      <button
        onClick={() => {
          document.getElementById("file-input").click();
        }}
        className="flex items-center gap-4 rounded-xl active:bg-slate-700 focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 px-8 py-4  bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
            clip-rule="evenodd"
          />
        </svg>
        Upload PDF
      </button>

      <div className="flex mt-20 w-full">
        <div className="w-1/2">
          <h2 className="text-center mb-4 text-3xl text-black">Raw text</h2>
          <div className="text-black" id="pdfContent"></div>
        </div>

        <div className="w-1/2">
          <h2 className="text-center mb-4 text-3xl text-black">Summarized text</h2>
          {isLoading && <p className="text-black text-center">Connecting to Octo AI...</p>}
          {!isLoading && (
            <>
              <div className="text-black">{summary}</div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
