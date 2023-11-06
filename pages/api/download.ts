import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const BACKEND_BASE_URL = "http://135.148.26.44:5001";

    try {
        const filename = req.query.filename as string; // Use TypeScript type assertion

        // Construct the download link (use HTTPS here)
        const downloadLink = `${BACKEND_BASE_URL}${filename}`;

        res.status(200).json({ success: true, downloadLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
