"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { analyzeReceipt, type AnalyzeReceiptOutput } from "@/ai/flows"
import { recordCategoryFeedback } from "@/lib/category-feedback"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, Camera, Upload, Sparkles, Wand2 } from "lucide-react"
import Image from "next/image"
import { logger } from "@/lib/logger"

export default function ScanReceiptPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalyzeReceiptOutput | null>(null)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCamera = async () => {
      if (hasCameraPermission) {
          // Turn off camera
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setHasCameraPermission(false);
            setImagePreview(null);
          }
          return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        logger.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser settings.",
        });
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          setImagePreview(dataUri);
        }
      }
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) {
       toast({ title: "No Image", description: "Please upload or capture an image first.", variant: "destructive" });
       return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeReceipt({ receiptImage: imagePreview });
      setAnalysisResult(result);
      setSuggestedCategory(result.category);
      } catch (error) {
        logger.error("Error analyzing receipt:", error);
        toast({ title: "Analysis Failed", description: "Could not analyze the receipt. Please try again.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  const saveTransaction = () => {
    // This is where you would typically call a function passed via props
    // to save the transaction to the main state in the parent page.
    // For this example, we'll just show a toast and navigate back.
    if(analysisResult){
        if(suggestedCategory && analysisResult.category !== suggestedCategory){
            recordCategoryFeedback(analysisResult.description, analysisResult.category)
        }
        toast({
            title: "Transaction Saved (Simulated)",
            description: `${analysisResult.description} for $${analysisResult.amount.toFixed(2)}`,
        });
        router.push("/transactions");
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scan Receipt</h1>
        <p className="text-muted-foreground">Use your camera or upload a file to automatically log a transaction.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Capture or Upload</CardTitle>
            <CardDescription>Provide an image of your receipt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Use Camera</Label>
                <div className="space-y-2">
                    <Button onClick={requestCamera} variant="outline" className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        {hasCameraPermission ? "Turn Off Camera" : "Turn On Camera"}
                    </Button>
                    <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                         <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         <canvas ref={canvasRef} className="hidden" />
                         {hasCameraPermission === false && (
                             <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                                <p className="text-muted-foreground">Camera is off or permission was denied.</p>
                             </div>
                         )}
                    </div>
                     {hasCameraPermission && (
                         <Button onClick={captureImage} className="w-full">Capture Image</Button>
                     )}
                </div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-upload">Upload File</Label>
              <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Analyze & Confirm</CardTitle>
            <CardDescription>Review the AI-extracted details and save.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imagePreview && (
              <div className="space-y-4">
                  <div className="relative aspect-video w-full bg-muted rounded-md overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Receipt preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                    />
                  </div>
                  <Button onClick={analyzeImage} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                    ) : (
                        <><Wand2 className="mr-2 h-4 w-4" />Analyze Receipt</>
                    )}
                </Button>
              </div>
            )}
            
            {analysisResult && (
                <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={analysisResult.description} onChange={(e) => setAnalysisResult({...analysisResult, description: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={analysisResult.amount} onChange={(e) => setAnalysisResult({...analysisResult, amount: parseFloat(e.target.value) || 0})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={analysisResult.category} onChange={(e) => setAnalysisResult({...analysisResult, category: e.target.value})} />
                    </div>
                    <Button onClick={saveTransaction} size="lg" className="w-full">Save Transaction</Button>
                </div>
            )}

            {!imagePreview && !analysisResult && (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6 rounded-md border-2 border-dashed h-full">
                    <Sparkles className="h-10 w-10 mb-4" />
                    <p className="font-semibold">Analysis will appear here</p>
                    <p className="text-sm">First, provide an image to get started.</p>
                </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
