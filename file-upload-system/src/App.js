import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const S3Uploader = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [textInput, setTextInput] = useState('');
    const [apiResponse, setApiResponse] = useState(null);
    const [fileSubmitted, setFileSubmitted] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setFileSubmitted(false);
    };

    const handleTextChange = (e) => {
        setTextInput(e.target.value);
    };

    const uploadFile = async () => {
        if (!selectedFile) {
            setFileSubmitted(true);
            return;
        }

        setUploading(true);

        const s3 = new S3Client({
            region: process.env.REACT_APP_AWS_REGION,
            credentials: {
                accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
            }
        });

        const params = {
            Bucket: process.env.REACT_APP_BUCKET_NAME,
            Key: selectedFile.name,
            Body: selectedFile,
        };

        try {
            const command = new PutObjectCommand(params);
            const response = await s3.send(command);
            console.log('File uploaded successfully:', response);

            const apiUrl = process.env.REACT_APP_API_GATEWAY;
            const apiParams = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input_text: textInput,
                    input_file_path: `${process.env.REACT_APP_BUCKET_NAME}/${selectedFile.name}`
                })
            };

            const responseFromApi = await fetch(apiUrl, apiParams);
            const responseData = await responseFromApi.json();
            setApiResponse(responseData);
            setFileSubmitted(true);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container">
            <div className='input-container'>
                <div style={{ color: 'white', marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Text input:</label>
                    <input type='text' value={textInput} onChange={handleTextChange} style={{ color: 'black' }} />
                </div>
                <div style={{ color: 'white', marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>File input:</label>
                    <input type="file" required onChange={handleFileChange} />
                </div>
                <button onClick={uploadFile} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Submit'}
                </button>
            </div>
            {uploadProgress > 0 && <div style={{ marginTop: '20px' }}>Progress: {uploadProgress}%</div>}
            {apiResponse && (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'white' }}>File submitted successfully.</p>
                </div>
            )}
            {fileSubmitted && !selectedFile && (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'white' }}>Please upload the file.</p>
                </div>
            )}
        </div>
    );
};

export default S3Uploader;
