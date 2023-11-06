import React, { ChangeEvent, useState } from 'react';

interface UploadResponse {
    data: {
        id: string;
    };
    message?: string; // Optional message property for error cases
}

interface ConversionResponse {
    data: {
        id: string;
    };
    message?: string; // Optional message property for error cases
}

interface StatusResponse {
    data: {
        status: string;
        url?: string;
    };
    message?: string; // Optional message property for error cases
}

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoX2lkIjozNDA1NTA1LCJ3c2lkIjoiNDk2NDY4NzA4IiwiZW1haWwiOiJibHVld29uZGVyMDkyOUBnbWFpbC5jb20iLCJhdWQiOiIzYTQ2NGUyODIxNTQ4YjU1NWJmY2ZiMmFiMmRiNjUzMiIsImV4cCI6MjAxNDQ0NjQ3NCwianRpIjoiMjMyNjNiNzMwZDZjMzFlOTc1YmI3NGE0NTI5Y2UxYjkiLCJpYXQiOjE2OTkwODY0NzQsImlzcyI6Im1lZGlhLmlvIiwibmJmIjoxNjk5MDg1NDc0LCJzdWIiOiI1YzJhZGM1NDM1MDRjZjA1MmY5OTQwYTY0MDY4YmY1OSJ9.rl-tglF5hU8I5kJE4IQ_s59M9bW7ej5ix3Up2stFo1A'; // Replace with your actual API key
const API_BASE_URL = 'https://api.media.io/v2';

const VideoConverter = () => {
    const [file, setFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<string>('avi');
    const [downloadLink, setDownloadLink] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const uploadFile = async (): Promise<string | void> => {
        if (!file) {
            throw new Error('No file selected');
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadResponse = await fetch(`${API_BASE_URL}/import/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
                body: formData,
            });

            const uploadResult: UploadResponse = await uploadResponse.json();
            if (uploadResponse.ok && uploadResult.data) {
                return uploadResult.data.id; // Return the file ID from the upload response
            } else {
                throw new Error(uploadResult.message || 'File upload failed');
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(`Upload error: ${error.message}`);
            } else {
                setError('Upload error: An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const initiateConversion = async (file: File): Promise<UploadResponse> => {
        const base64 = await toBase64(file);
        const response = await fetch(`${API_BASE_URL}/convert`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: base64,
                file_name: file.name,
            }),
        });

        return response.json();
    };

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const uploadToStorage = async (formDetails: FormDetails) => {
        const formData = new FormData();
        Object.entries(formDetails.parameters).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append('file', file!);

        setIsLoading(true);
        try {
            const uploadResponse = await fetch(formDetails.url, {
                method: 'POST',
                body: formData,
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.text(); // Assuming the server responds with text
                console.log('File uploaded successfully', result);
            } else {
                throw new Error(`File upload failed: ${uploadResponse.statusText}`);
            }
        } catch (error: any) {
            setError(`Error during the upload: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const startConversion = async (inputId: string): Promise<string | void> => {
        try {
            const conversionResponse = await fetch(`${API_BASE_URL}/convert`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: inputId, // Ensure this ID is the one received from the upload response
                    output_format: outputFormat, // Ensure this format is one of the accepted formats by the API
                }),
            });

            const conversionResult: ConversionResponse = await conversionResponse.json();
            if (conversionResponse.ok && conversionResult.data) {
                return conversionResult.data.id; // Return the task ID from the conversion response
            } else {
                // The error message is now constructed to include the entire server response for better debugging
                const errorMessage = conversionResult.message || `Conversion failed with status ${conversionResponse.status}: ${JSON.stringify(conversionResult)}`;
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            setError(`Conversion error: ${error.message}`);
            setIsLoading(false);
        }
    };

    const pollStatus = async (taskId: string): Promise<StatusResponse | void> => {
        const statusResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });
        const statusResult: StatusResponse = await statusResponse.json();
        if (statusResponse.ok && statusResult.data && statusResult.data.status === 'success') {
            return statusResult.data; // Return the successful status response
        } else if (statusResult.data.status === 'error') {
            throw new Error(statusResult.message || 'Conversion task failed');
        } else {
            // Poll again after a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            return pollStatus(taskId);
        }
    };

    const downloadFile = async (taskId: string): Promise<void> => {
        const downloadResponse = await fetch(`${API_BASE_URL}/export/url`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                input: taskId,
            }),
        });
        const downloadResult: StatusResponse = await downloadResponse.json();
        if (downloadResponse.ok && downloadResult.data) {
            setDownloadLink(downloadResult.data.url); // Set the download link for the user to click
        } else {
            throw new Error(downloadResult.message || 'Failed to get download URL');
        }
        setIsLoading(false);
    };

    const handleConversion = async () => {
        try {
            setError('');
            setIsLoading(true);

            // Step 1: User selects file
            if (!file) {
                throw new Error('No file selected');
            }

            // Step 2: Upload file and get inputId
            const inputId = await uploadFile(); // This should be the ID returned from the upload response
            if (!inputId) {
                throw new Error('Failed to upload file');
            }

            // Step 3: Start conversion with the obtained inputId
            const taskId = await startConversion(inputId);
            if (!taskId) {
                throw new Error('Failed to start conversion');
            }

            // Step 4: Poll for status until conversion is complete
            const statusResult = await pollStatus(taskId);
            if (statusResult && statusResult.url) {
                // Step 5: Download file with the provided URL
                setDownloadLink(statusResult.url);
            }
        } catch (error: any) {
            setError(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {error && <p>Error: {error}</p>}
            <input type="file" onChange={handleFileChange} disabled={isLoading} />
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} disabled={isLoading}>
                <option value="avi">AVI</option>
                <option value="mp4">MP4</option>
                {/* Add more options as needed */}
            </select>
            <button onClick={handleConversion} disabled={isLoading || !file}>
                {isLoading ? 'Converting...' : 'Convert'}
            </button>
            {downloadLink && (
                <a href={downloadLink} download={`converted.${outputFormat}`}>
                    Download Converted File
                </a>
            )}
        </div>
    );
};

export default VideoConverter;
