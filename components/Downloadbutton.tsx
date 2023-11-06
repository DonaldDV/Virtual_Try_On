// components/DownloadButton.tsx
import { useState } from 'react';

const DownloadButton = ({ filename }: { filename: string }) => {
    const [isLoading, setIsLoading] = useState(false);

    const downloadFileFromUrl = async (downloadUrl: string, filename: string) => {
        try {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
      
          // Create a blob URL for the downloaded file
          const blobUrl = URL.createObjectURL(blob);
      
          // Create an invisible anchor element to trigger the download
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = blobUrl;
          a.download = filename;
      
          // Append the anchor element to the document body and trigger the click event
          document.body.appendChild(a);
          a.click();
      
          // Remove the anchor element and revoke the blob URL
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error('Error downloading file:', error);
          // Handle the error, show an error message, etc.
        }
      };
      

      const handleDownloadClick = async () => {
        setIsLoading(true);
      
        try {
          const response = await fetch(`/api/download?filename=${filename}`, {
            method: 'GET',
          });
      
          if (response.ok) {
            const data = await response.json();
            const downloadURL = data.downloadLink; // Get the download URL from the API response
            downloadFileFromUrl(downloadURL, filename); // Call the function to download the file
          } else {
            throw new Error('Failed to initiate download');
          }
        } catch (error) {
          console.error(error);
          // Handle the error, show an error message, etc.
        } finally {
          setIsLoading(false);
        }
      };
      
    
    return (
        <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadClick}
            disabled={isLoading}
        >
            {isLoading ? 'Downloading...' : 'Download'}
        </button>
    );
};

export default DownloadButton;
