"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaImage, FaTags, FaArrowUp, FaTimes } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa";

export default function Home() {
  // For loading animation
  const [isLoading, setIsLoading] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const img = localStorage.getItem("uploadedImage");
    setImageUploaded(!!img);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,$/, "");
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  async function compareImageToUploaded(scrapedImageUrls: string[]) {
    const res = await fetch(
      "http://cnn-backend-oixx.onrender.com//api/compare",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ URLS: scrapedImageUrls }),
      }
    );

    const data = await res.json();
    console.log("Comparison Results:", data);
    localStorage.setItem("compareResults", JSON.stringify(data));

    router.push("/check");
  }

  async function scrapeImagesFromTags(tags: string[]) {
    const first_img_base64 = localStorage.getItem("uploadedImage");
    if (!first_img_base64) {
      alert("Please upload an image first.");
      return;
    }

    setIsLoading(true);

    const base64_data = first_img_base64.substring(
      first_img_base64.indexOf("base64,") + 7
    );

    const res = await fetch(
      "http://cnn-backend-oixx.onrender.com//api/scrape",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      }
    );

    const data = await res.json();

    const URLs = [base64_data, ...data];
    await compareImageToUploaded(URLs);

    setIsLoading(false);
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">
            Has Your Work Been Stolen Online?
          </h1>
          <p className="text-lg my-[3vh]">
            Check if your work has been stolen online with our free tool.
          </p>

          <div className="flex flex-row gap-4 p-5 bg-white w-[50vw] min-h-[50vh] mx-auto mt-6 mb-10 rounded md shadow-sm">
            <div className="w-1/2">
              <h2 className="text-xl text-black font-semibold mb-2 text-center flex items-center justify-center gap-2">
                <FaImage className="text-black" /> Image Preview
              </h2>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg min-h-[40vh] mb-[2vh]">
                <div className="h-full flex items-center justify-center text-gray-500">
                  Image Preview Area
                </div>
                <img id="preview" className="" />
              </div>
              <input
                type="file"
                className="absolute right-[9999px]"
                disabled={isUploading}
                ref={fileInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  setIsUploading(true);

                  if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                      const img = document.getElementById(
                        "preview"
                      ) as HTMLImageElement;
                      if (img && e.target?.result) {
                        img.src = e.target.result as string;
                        img.style.display = "block";
                        localStorage.setItem("uploadedImage", img.src);
                        setImageUploaded(true);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                  setIsUploading(false);
                }}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                disabled={isUploading}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <FaArrowUp className="mr-2 inline text-white" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </button>
            </div>

            {/* Tags Section */}
            <div className="w-1/2">
              <h2 className="text-xl text-black font-semibold mb-2 text-center flex items-center justify-center gap-2">
                <FaTags className="text-black" /> Tags
              </h2>
              <div className="p-4 border-2 border-gray-300 rounded-lg min-h-[40vh]">
                <div className="h-full flex flex-col items-center justify-start text-gray-500">
                  <input
                    className="w-full h-[5vh] border-solid border-2 border-gray-300 rounded-md p-2"
                    type="text"
                    placeholder="Enter your tags here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center mb-4">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        )}
        <button
          className={`px-4 py-2 rounded-md ${
            imageUploaded && tags.length > 0
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!imageUploaded || isLoading}
          onClick={() => {
            if (imageUploaded) {
              scrapeImagesFromTags(tags);
            }
          }}
        >
          Check Now
        </button>
      </main>
    </>
  );
}
