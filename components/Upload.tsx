import { CheckCircle, ImageIcon, UploadIcon } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router'
import { REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS, PROGRESS_STEP } from '../lib/constants'

interface UploadProps {
    onComplete?: (base64: string) => void
}

function Upload({ onComplete }: UploadProps) {
    // 3 separate states for checking : 
    // if file is there in the component or not, 
    // if the file is being currently dragged or not,
    // the file upload progress after being dragged  
    const [file,setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [progress,setProgress] = useState(0)
    const progressRef = useRef<number>(0)
    const intervalRef = useRef<any>(null)
    const {isSignedIn} =useOutletContext<AuthContext>()
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    const processFile = (fileToProcess: File) => {
        if (!isSignedIn) return
        setFile(fileToProcess)
        setProgress(0)
        progressRef.current = 0

        const reader = new FileReader()
        reader.onload = () => {
            const result = String(reader.result || '')

            // start fake progress
            intervalRef.current = setInterval(() => {
                progressRef.current = Math.min(100, progressRef.current + PROGRESS_STEP)
                setProgress(progressRef.current)

                if (progressRef.current >= 100) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                        intervalRef.current = null
                    }
                    // give a small delay before calling onComplete (simulate redirect)
                    setTimeout(() => {
                        onComplete?.(result)
                    }, REDIRECT_DELAY_MS)
                }
            }, PROGRESS_INTERVAL_MS)
        }

        reader.readAsDataURL(fileToProcess)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return
        const f = e.target.files?.[0]
        if (f) processFile(f)
    }

    const handleDrop = (fileDropped?: File) => {
        if (!isSignedIn) return
        if (fileDropped) processFile(fileDropped)
    }

    return (
    <div className='upload'>
        {/* if there is no file then activate the dropzone to accept files */}
                {!file ? (
                        <div
                            className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                            onDragEnter={(e) => { e.preventDefault(); if (!isSignedIn) return; setIsDragging(true) }}
                            onDragOver={(e) => { e.preventDefault(); if (!isSignedIn) return; setIsDragging(true) }}
                            onDragLeave={(e) => { e.preventDefault(); if (!isSignedIn) return; setIsDragging(false) }}
                            onDrop={(e) => { e.preventDefault(); if (!isSignedIn) return; setIsDragging(false); const dropped = e.dataTransfer?.files?.[0]; if (dropped) handleDrop(dropped) }}
                        >
                {/* the dropzone div also accepts 2 classes based on whether a file is being dragged or not  */}
                {/* input accepts the file and is disabled on not being signedIn */}
                <input
                    type="file"
                    className='drop-input'
                    accept=".jpg,.jpeg,.png"
                    disabled={!isSignedIn}
                    onChange={handleInputChange}
                />
                <div className="drop-content">
                    <div className="drop-icon">
                        <UploadIcon size={20}/>
                    </div>
                    <p>
                        {isSignedIn ? (
                            "Click to upload or just drag and drop the image"
                        ):(
                            "Sign in or Sign Up with puter to upload images"
                        )}
                    </p>
                    <p className='help'>Maximum file size 50MB</p>
                </div>
            </div>
        ):(
            <div className='upload-status'>
                <div className="status-content">
                    <div className="status-icon">
                        {progress===100 ? (
                            <CheckCircle className='check'/>
                        ):(
                            <ImageIcon className='image'/>
                        )}
                    </div>
                    <h3>{file.name}</h3>
                    <div className="progress">
                        <div className="bar" style={{width: `${progress}%`}}/>
                        <p className="status-text">
                            {progress < 100 ? 'Analyzing floor plan...' : 'Redirecting...'}
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Upload