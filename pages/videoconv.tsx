"use client";

import converter from "@/config/converter.json"
import { RegularPage } from "@/types";
import { useState, ChangeEvent, useEffect } from "react";
import SeoMeta from "@/partials/SeoMeta";
import PageHeader from "@/partials/PageHeader";
import "@/styles/converter.scss"
import { Alert } from "@chakra-ui/react";
import ConvertApi from 'convertapi-js'

const videoFormats = [
    "3GP", "3GPP", "ASF", "AVI", "DAV", "FLV", "M2TS", "M4V", "MKV", "MOV",
    "MP4", "MPEG", "MPG", "MTS", "MXF", "OGG", "OGV", "SWF", "TS", "VIDEO",
    "VOB", "WEBM", "WMV"
];

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoX2lkIjozNDA1NTA1LCJ3c2lkIjoiNDk2NDY4NzA4IiwiZW1haWwiOiJibHVld29uZGVyMDkyOUBnbWFpbC5jb20iLCJhdWQiOiIzYTQ2NGUyODIxNTQ4YjU1NWJmY2ZiMmFiMmRiNjUzMiIsImV4cCI6MjAxNDQ0NjQ3NCwianRpIjoiMjMyNjNiNzMwZDZjMzFlOTc1YmI3NGE0NTI5Y2UxYjkiLCJpYXQiOjE2OTkwODY0NzQsImlzcyI6Im1lZGlhLmlvIiwibmJmIjoxNjk5MDg1NDc0LCJzdWIiOiI1YzJhZGM1NDM1MDRjZjA1MmY5OTQwYTY0MDY4YmY1OSJ9.rl-tglF5hU8I5kJE4IQ_s59M9bW7ej5ix3Up2stFo1A'; // Replace with your actual API key
const API_BASE_URL = 'https://api.media.io/v2';

const VideoConverter = () => {
    
    const data: RegularPage = converter.videoConverter;
    const { title, description, meta_title } = data.frontmatter;

    const [sourceFormat, setSourceFormat] = useState("JPEG");
    const [targetFormat, setTargetFormat] = useState("PNG");
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            console.log("File chosen:", event.target.files[0]);
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setAlertMessage("Please select a file.");
            return;
        }

        setIsLoading(true);
        setAlertMessage(null); // Clear any existing messages

        try {
            let convertApi = ConvertApi.auth('IMpTWyVtOk73ZYWN'); // This should be kept secret
            let params = convertApi.createParams();
            params.add('file', file);

            // Perform the conversion based on selected source and target formats
            let result = await convertApi.convert(sourceFormat.toLowerCase(), targetFormat.toLowerCase(), params);

            // Access the URL of the converted file
            const fileUrl = result.files[0].Url;

            // Set the download link state to the URL for the converted file
            setDownloadLink(fileUrl);
        } catch (error) {
            console.error("Conversion error:", error);
            setAlertMessage("There was an error converting the file."); // Set error message
        }

        setIsLoading(false);
    };

    return (
        <>
            <SeoMeta
                title={title}
                meta_title={meta_title}
                description={description}
            // image={image}
            />
            <PageHeader title={title} />
            <section className="section-sm">
                <div className="container">
                    <div className="row">
                        <div className="mx-auto md:col-10 lg:col-6">
                            {/* <h2 className="text-center mb-6">Image Converter</h2> */}

                            {/* Source Format */}
                            <div className="mb-6">
                                <label htmlFor="sourceFormat" className="form-label">
                                    Source Format
                                </label>
                                <select
                                    id="sourceFormat"
                                    value={sourceFormat}
                                    onChange={(e) => setSourceFormat(e.target.value)}
                                    className="form-input"
                                >
                                    {videoFormats.map(format => (
                                        <option key={format} value={format}>
                                            {format}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Format */}
                            <div className="mb-6">
                                <label htmlFor="targetFormat" className="form-label">
                                    Target Format
                                </label>
                                <select
                                    id="targetFormat"
                                    value={targetFormat}
                                    onChange={(e) => setTargetFormat(e.target.value)}
                                    className="form-input"
                                >
                                    {videoFormats.map(format => (
                                        <option key={format} value={format}>
                                            {format}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Input */}
                            <div className="mb-6">
                                <label htmlFor="file" className="form-label">
                                    Select File
                                </label>
                                <input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="form-input"
                                />
                            </div>

                            {/* Convert Button */}
                            <div className="mb-6">
                                {isLoading ? (
                                    <div className="flex justify-center items-center">
                                        <div className="loader"></div> {/* This will show the spinning circle when loading */}
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                    >
                                        Convert
                                    </button>
                                )}
                            </div>

                            {/* Download Link */}
                            {/* {downloadLink && (
                                <div className="text-center">
                                    <button onClick={DownloadButton} className="btn btn-success">
                                        <h4>Download Converted File</h4>
                                    </button>
                                </div>
                            )} */}

                            {downloadLink && (
                                <div className="text-center">
                                    <u>
                                        <a
                                            href={downloadLink}
                                            download
                                            target="_blank" // Added this line
                                            rel="noopener noreferrer" // Added this line for security
                                            className="btn btn-success"
                                        >
                                            <h4>Download Converted File</h4>
                                        </a>
                                    </u>
                                </div>
                            )}

                            {/* {alertMessage && (
                                <Alert message={alertMessage} onClose={() => setAlertMessage(null)} />
                            )} */}
                        </div>
                    </div>
                </div>
            </section>
        </>
          );
};

export default VideoConverter;
