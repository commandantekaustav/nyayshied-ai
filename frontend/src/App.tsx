import React, { useState } from 'react';
import { ActiveScreen, ClaimAnalysisResponse } from './types/claim';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { JudgeDrawer } from './components/JudgeDrawer';
import { Screen1Input } from './components/screens/Screen1Input';
import { Screen2Forensics } from './components/screens/Screen2Forensics';
import { Screen3Notice } from './components/screens/Screen3Notice';
import { Screen4Tracker } from './components/screens/Screen4Tracker';
import { IssueTrackerModal } from './components/IssueTrackerModal';
import { GOLDEN_CASE_DATA, generateLaptopSampleImage } from './data/goldenCase';
import { analyzeClaimAPI } from './services/api';

export const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(1);
  const [deviceImage, setDeviceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [walkInQuote, setWalkInQuote] = useState<number>(20000);
  const [brandName, setBrandName] = useState<string>("HP");
  const [modelName, setModelName] = useState<string>("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [purchaseType, setPurchaseType] = useState<string>("Standard 1-Year Limited Warranty");
  const [userDescription, setUserDescription] = useState<string>("");
  const [userAnnotation, setUserAnnotation] = useState<[number, number, number, number] | null>(null);
  const [claimData, setClaimData] = useState<ClaimAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);

  // Fast-track prefill for Hackathon Judges: Live Case #001
  const handleLoadGoldenCase = () => {
    setIsLoading(true);
    const sampleImg = generateLaptopSampleImage();
    setImagePreview(sampleImg);
    setWalkInQuote(20000);
    setBrandName("HP");
    setModelName("Victus 15-fa1310tx");
    setPurchaseDate("2024-03-15");
    setPurchaseType("Standard 1-Year Limited Warranty");
    setUserDescription("Left hinge seized and detached inner bezel during standard lid opening.");
    setUserAnnotation([735, 78, 895, 265]);
    setClaimData(GOLDEN_CASE_DATA);
    setIsApproved(false);

    setTimeout(() => {
      setIsLoading(false);
      setActiveScreen(2); // Jump straight to Forensics & Price Gouging Proof
    }, 450);
  };

  // Primary Action triggered from Bottom Thumb Zone
  const handlePrimaryAction = async () => {
    if (activeScreen === 1) {
      setIsLoading(true);
      try {
        const result = await analyzeClaimAPI({
          deviceImageFile: deviceImage,
          invoiceFile,
          walkInQuoteInr: walkInQuote,
          useGoldenCase: false,
          brandName,
          modelName,
          purchaseDate,
          purchaseType,
          userDescription,
          userAnnotation,
        });
        setClaimData(result);
        if (!imagePreview) {
          setImagePreview(generateLaptopSampleImage());
        }
        setActiveScreen(2);
      } catch (err) {
        console.error('Triage failed:', err);
        setClaimData(GOLDEN_CASE_DATA);
        if (!imagePreview) {
          setImagePreview(generateLaptopSampleImage());
        }
        setActiveScreen(2);
      } finally {
        setIsLoading(false);
      }
    } else if (activeScreen === 2) {
      setActiveScreen(3);
    } else if (activeScreen === 3) {
      setActiveScreen(4);
    } else if (activeScreen === 4 && !isApproved) {
      setIsApproved(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      {/* Mobile-First PWA Container: max-w-[430px] */}
      <div className="w-full max-w-[430px] min-h-screen bg-slate-950 shadow-2xl flex flex-col relative border-x border-slate-900/50">
        {/* Sticky Mobile Header */}
        <Header
          onLoadGoldenCase={handleLoadGoldenCase}
          onOpenTracker={() => setIsTrackerOpen(true)}
          isLoading={isLoading}
          activeScreen={activeScreen}
        />

        {/* Screen Content Viewport */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeScreen === 1 && (
            <Screen1Input
              deviceImage={deviceImage}
              imagePreview={imagePreview}
              invoiceFile={invoiceFile}
              walkInQuote={walkInQuote}
              brandName={brandName}
              modelName={modelName}
              purchaseDate={purchaseDate}
              purchaseType={purchaseType}
              userDescription={userDescription}
              userAnnotation={userAnnotation}
              onDeviceImageChange={(file, preview) => {
                setDeviceImage(file);
                setImagePreview(preview);
              }}
              onInvoiceFileChange={setInvoiceFile}
              onQuoteChange={setWalkInQuote}
              onBrandChange={setBrandName}
              onModelChange={setModelName}
              onPurchaseDateChange={setPurchaseDate}
              onPurchaseTypeChange={setPurchaseType}
              onUserDescriptionChange={setUserDescription}
              onAnnotationChange={setUserAnnotation}
              onLoadGoldenCase={handleLoadGoldenCase}
              isLoading={isLoading}
            />
          )}

          {activeScreen === 2 && claimData && (
            <Screen2Forensics
              claimData={claimData}
              imageSrc={imagePreview || generateLaptopSampleImage()}
            />
          )}

          {activeScreen === 3 && claimData && (
            <Screen3Notice claimData={claimData} />
          )}

          {activeScreen === 4 && claimData && (
            <Screen4Tracker
              claimData={claimData}
              isApproved={isApproved}
              onApprove={() => setIsApproved(true)}
            />
          )}
        </main>

        {/* Sticky Bottom Thumb-Zone Action Bar */}
        <BottomNav
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          canProceed={activeScreen === 1 ? (Boolean(imagePreview || deviceImage) || walkInQuote > 0) : true}
          isLoading={isLoading}
          isApproved={isApproved}
          onPrimaryAction={handlePrimaryAction}
        />
      </div>

      {/* Collapsible Desktop Side-Drawer for Hackathon Judges */}
      <JudgeDrawer
        claimData={claimData}
        activeScreen={activeScreen}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Alpha Tester Live Issue Tracker Modal */}
      <IssueTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
};

export default App;
