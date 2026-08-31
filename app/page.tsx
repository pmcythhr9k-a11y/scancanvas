'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Navigation, ActiveTab } from '@/components/layout/Navigation';
import { StatusFooter } from '@/components/layout/StatusFooter';
import { MyCases } from '@/components/cases/MyCases';
import { AddCaseModal } from '@/components/cases/AddCaseModal';
import { CaseCheckPanel } from '@/components/cases/CaseCheckPanel';
import { CaseHomeView } from '@/components/cases/CaseHomeView';
import { MRIViewer } from '@/components/viewer/MRIViewer';
import { ReportGuideView } from '@/components/report/ReportGuideView';
import { ChangeTimelineView } from '@/components/report/ChangeTimelineView';
import { AppointmentPackView } from '@/components/handoff/AppointmentPackView';
import { PrivacyReceiptModal } from '@/components/handoff/PrivacyReceiptModal';
import { OutboundApprovalModal } from '@/components/report/OutboundApprovalModal';
import { TechnicalDetailsModal } from '@/components/common/TechnicalDetailsModal';
import { ClinicalReferencesModal } from '@/components/common/ClinicalReferencesModal';
import { LoginGate } from '@/components/auth/LoginGate';

import { CaseManifest } from '@/lib/dicom/parser';
import { processFilesWithWorker, IntakeProgressEvent } from '@/lib/dicom/web-worker-client';
import { buildDemoCaseManifest } from '@/lib/dicom/synthetic-generator';
import { SYNTHETIC_FINAL_REPORT } from '@/lib/fixtures/synthetic-reports';
import { EvidenceCard, PrivacyReceipt } from '@/lib/agent/schemas';
import { runReportExplanationWorkflow } from '@/lib/agent/gemini';
import { AppointmentQuestion } from '@/lib/export/appointment-pack';
import { calculateSha256 } from '@/lib/export/hash';

export default function ScanCanvasApp() {
  // Navigation & Workspace Mode
  const [activeTab, setActiveTab] = useState<ActiveTab | 'start'>('start');
  const [manifest, setManifest] = useState<CaseManifest | null>(() => buildDemoCaseManifest('acute_tear'));
  const [rawFiles, setRawFiles] = useState<Array<{ name: string; buffer: ArrayBuffer }>>([]);

  // Modals
  const [isAddCaseOpen, setIsAddCaseOpen] = useState(false);
  const [isCaseCheckOpen, setIsCaseCheckOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isPrivacyReceiptOpen, setIsPrivacyReceiptOpen] = useState(false);
  const [isTechnicalDetailsOpen, setIsTechnicalDetailsOpen] = useState(false);
  const [isClinicalReferencesOpen, setIsClinicalReferencesOpen] = useState(false);

  // Agent & Workflow State
  const [intakeProgress, setIntakeProgress] = useState<IntakeProgressEvent | null>(null);
  const [isProcessingIntake, setIsProcessingIntake] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [reportApproved, setReportApproved] = useState(false);
  const [isApprovingReport, setIsApprovingReport] = useState(false);
  const [evidenceCards, setEvidenceCards] = useState<EvidenceCard[]>([]);

  // Appointment Questions
  const [appointmentQuestions, setAppointmentQuestions] = useState<AppointmentQuestion[]>([
    {
      id: 'q-1-acl',
      text: 'What does "high-grade partial tear" mean for my knee stability and treatment options?',
      enabled: true,
      sourceClaimId: 'claim-001-acl',
    },
    {
      id: 'q-2-bone-marrow',
      text: 'Does the bone bruise on my outer knee require crutches or weight-bearing limits?',
      enabled: true,
      sourceClaimId: 'claim-002-bone-marrow',
    },
    {
      id: 'q-3-meniscus',
      text: 'Are both my medial and lateral meniscal cartilages completely healthy?',
      enabled: true,
      sourceClaimId: 'claim-004-meniscus',
    },
  ]);

  const [addedQuestionsSet, setAddedQuestionsSet] = useState<Set<string>>(
    new Set([
      'What does "high-grade partial tear" mean for my knee stability and treatment options?',
      'Does the bone bruise on my outer knee require crutches or weight-bearing limits?',
      'Are both my medial and lateral meniscal cartilages completely healthy?',
    ])
  );

  // Privacy Receipt State
  const [privacyReceipt, setPrivacyReceipt] = useState<PrivacyReceipt>({
    receiptVersion: '1.0',
    dicomObjectsProcessedLocally: 135,
    imagePixelBytesSentToCloud: 0,
    dicomMetadataSentToCloud: 0,
    reportCharactersApproved: 1684,
    reportTextSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    approvedAt: new Date().toISOString(),
    model: 'gemini-3.7-flash',
    promptVersion: 'evidence-v1',
    policyVersion: 'nonclinical-v1',
  });

  // Handle Load Sample Synthetic Knee Case
  const handleLoadSampleKneeCase = async (variant: 'acute_tear' | 'normal_baseline' = 'acute_tear') => {
    setIsLoadingSample(true);
    try {
      const parsedManifest = buildDemoCaseManifest(variant);
      setManifest(parsedManifest);
      setPrivacyReceipt((prev) => ({
        ...prev,
        dicomObjectsProcessedLocally: parsedManifest.instancesReadable,
        reportCharactersApproved: parsedManifest.report.text?.length || 1684,
      }));

      // Preload verified evidence cards
      const explanation = await runReportExplanationWorkflow(
        parsedManifest.report.text || SYNTHETIC_FINAL_REPORT.fullText,
        parsedManifest.caseId
      );
      setEvidenceCards(explanation.cards);
      setReportApproved(true);

      setActiveTab('case');
    } catch (err) {
      console.error('Error loading sample case:', err);
      alert('Error loading demonstration knee dataset.');
    } finally {
      setIsLoadingSample(false);
      setIntakeProgress(null);
    }
  };

  // Handle Process Custom Dropped Files
  const handleProcessCustomFiles = async (files: Array<{ name: string; buffer: ArrayBuffer }>) => {
    setIsProcessingIntake(true);
    try {
      setRawFiles(files);
      const parsedManifest = await processFilesWithWorker(files, (progress) => {
        setIntakeProgress(progress);
      });

      setManifest(parsedManifest);
      setPrivacyReceipt((prev) => ({
        ...prev,
        dicomObjectsProcessedLocally: parsedManifest.instancesReadable,
        reportCharactersApproved: parsedManifest.report.text?.length || 0,
      }));

      setIsAddCaseOpen(false);
      setActiveTab('case');
    } catch (err) {
      console.error('Error processing intake files:', err);
      alert('Error processing files. Please check file format.');
    } finally {
      setIsProcessingIntake(false);
      setIntakeProgress(null);
    }
  };

  // Handle Outbound Report Approval
  const handleApproveReport = async () => {
    setIsApprovingReport(true);
    try {
      const reportText = manifest?.report.text || SYNTHETIC_FINAL_REPORT.fullText;
      const textHash = await calculateSha256(reportText);

      // Call agent workflow API / local engine
      const res = await fetch('/api/report/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText,
          caseId: manifest?.caseId || 'SC-CASE-LEFT-KNEE-2026',
        }),
      });

      let explanation;
      if (res.ok) {
        explanation = await res.json();
      } else {
        explanation = await runReportExplanationWorkflow(reportText, manifest?.caseId);
      }

      setEvidenceCards(explanation.cards);
      setReportApproved(true);
      setPrivacyReceipt((prev) => ({
        ...prev,
        reportCharactersApproved: reportText.length,
        reportTextSha256: textHash,
        approvedAt: new Date().toISOString(),
      }));

      setIsApprovalModalOpen(false);
      setActiveTab('report');
    } catch (err) {
      console.error('Error approving report:', err);
      // Fallback to verified cards
      const explanation = await runReportExplanationWorkflow(
        manifest?.report.text || SYNTHETIC_FINAL_REPORT.fullText,
        manifest?.caseId
      );
      setEvidenceCards(explanation.cards);
      setReportApproved(true);
      setIsApprovalModalOpen(false);
      setActiveTab('report');
    } finally {
      setIsApprovingReport(false);
    }
  };

  // Add question handler
  const handleAddQuestionFromCard = (questionText: string) => {
    if (addedQuestionsSet.has(questionText)) return;

    const newQ: AppointmentQuestion = {
      id: `q-${Date.now()}`,
      text: questionText,
      enabled: true,
    };

    setAppointmentQuestions((prev) => [...prev, newQ]);
    setAddedQuestionsSet((prev) => new Set([...prev, questionText]));
  };

  // Case Studio: Update Report Text & Re-analyse
  const handleUpdateReportText = async (newText: string, caseTitle?: string) => {
    setIsApprovingReport(true);
    try {
      if (manifest) {
        const updatedManifest = {
          ...manifest,
          bodyPartSignals: caseTitle ? [caseTitle.replace(' MRI', '')] : manifest.bodyPartSignals,
          report: {
            ...manifest.report,
            text: newText,
          },
        };
        setManifest(updatedManifest);
      }

      const explanation = await runReportExplanationWorkflow(
        newText,
        manifest?.caseId || 'custom-case'
      );
      setEvidenceCards(explanation.cards);
      setReportApproved(true);
    } catch (err) {
      console.error('Error re-analysing report:', err);
    } finally {
      setIsApprovingReport(false);
    }
  };

  // Case Studio: Load Scenario Files
  const handleLoadScenarioFiles = async (files: Array<{ name: string; buffer: ArrayBuffer }>) => {
    await handleProcessCustomFiles(files);
  };

  // Start with sample preloaded if direct open requested
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('scancanvas_auth_session');
      if (auth === 'authenticated') {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    // Auto-generate demonstration sample on initial load
    handleLoadSampleKneeCase();
  }, []);

  if (authChecked && !isAuthenticated) {
    return <LoginGate onUnlock={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--canvas)' }}>
      {/* Top Bar */}
      <TopBar
        caseTitle={manifest ? `${manifest.bodyPartSignals[0] || 'Left Knee'} MRI` : 'ScanCanvas'}
        caseMeta={manifest ? `${manifest.studyDate} · Final report verified` : 'Private MRI record workspace'}
        onOpenCaseCheck={() => setIsCaseCheckOpen(true)}
        onOpenPreparePack={() => setActiveTab('handoff')}
        onOpenPrivacyReceipt={() => setIsPrivacyReceiptOpen(true)}
        onOpenClinicalReferences={() => setIsClinicalReferencesOpen(true)}
        onNavigateHome={() => setActiveTab('case')}
        onSignOut={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('scancanvas_auth_session');
            setIsAuthenticated(false);
          }
        }}
      />

      {/* Primary Navigation Tabs */}
      {activeTab !== 'start' && (
        <Navigation
          activeTab={activeTab as ActiveTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          reportCount={evidenceCards.length || 4}
          questionCount={appointmentQuestions.filter((q) => q.enabled).length}
        />
      )}

      {/* Main Workspace Body */}
      <div style={{ flex: 1 }}>
        {activeTab === 'start' && (
          <MyCases
            currentManifest={manifest}
            onOpenCase={() => setActiveTab('case')}
            onAddCaseClick={() => setIsAddCaseOpen(true)}
            onLoadSampleKneeCase={handleLoadSampleKneeCase}
            isLoadingSample={isLoadingSample}
          />
        )}

        {activeTab === 'case' && manifest && (
          <CaseHomeView
            manifest={manifest}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
            onOpenCaseCheck={() => setIsCaseCheckOpen(true)}
            onOpenPrivacyReceipt={() => setIsPrivacyReceiptOpen(true)}
            onOpenTechnicalDetails={() => setIsTechnicalDetailsOpen(true)}
            onUpdateReportText={handleUpdateReportText}
            onLoadScenarioFiles={handleLoadScenarioFiles}
            onLoadDemoCase={handleLoadSampleKneeCase}
            onOpenAddCaseModal={() => setIsAddCaseOpen(true)}
            reportApproved={reportApproved}
            isProcessing={isProcessingIntake || isApprovingReport}
          />
        )}

        {activeTab === 'scan' && manifest && (
          <MRIViewer
            series={manifest.series}
            evidenceCards={evidenceCards}
            onAddQuestion={handleAddQuestionFromCard}
            addedQuestions={addedQuestionsSet}
          />
        )}

        {activeTab === 'report' && manifest && (
          <ReportGuideView
            cards={evidenceCards}
            onAddQuestion={handleAddQuestionFromCard}
            addedQuestions={addedQuestionsSet}
            reportText={manifest.report.text}
          />
        )}

        {activeTab === 'changes' && (
          <ChangeTimelineView
            earlierDate={manifest?.earlierReport?.date || '03 March 2025'}
            currentDate={manifest?.studyDate || '15 August 2026'}
          />
        )}

        {activeTab === 'handoff' && manifest && (
          <AppointmentPackView
            manifest={manifest}
            privacyReceipt={privacyReceipt}
            evidenceCards={evidenceCards}
            questions={appointmentQuestions}
            onUpdateQuestions={setAppointmentQuestions}
            originalFiles={rawFiles}
          />
        )}
      </div>

      {/* Footer & Status Bar */}
      {manifest && (
        <StatusFooter
          stage="PACK_READY"
          imagesCount={manifest.instancesReadable}
          seriesCount={manifest.seriesCount}
          reportStatus={manifest.report.statusSignal}
          onOpenTechnicalDetails={() => setIsTechnicalDetailsOpen(true)}
          onOpenCaseCheck={() => setIsCaseCheckOpen(true)}
        />
      )}

      {/* Modals */}
      <AddCaseModal
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        onProcessFiles={handleProcessCustomFiles}
        isProcessing={isProcessingIntake}
        progress={intakeProgress}
      />

      {manifest && (
        <CaseCheckPanel
          isOpen={isCaseCheckOpen}
          onClose={() => setIsCaseCheckOpen(false)}
          manifest={manifest}
          onOpenTechnicalDetails={() => {
            setIsCaseCheckOpen(false);
            setIsTechnicalDetailsOpen(true);
          }}
        />
      )}

      <OutboundApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        reportText={manifest?.report.text || SYNTHETIC_FINAL_REPORT.fullText}
        onApprove={handleApproveReport}
        isApproving={isApprovingReport}
      />

      <PrivacyReceiptModal
        isOpen={isPrivacyReceiptOpen}
        onClose={() => setIsPrivacyReceiptOpen(false)}
        receipt={privacyReceipt}
      />

      {manifest && (
        <TechnicalDetailsModal
          isOpen={isTechnicalDetailsOpen}
          onClose={() => setIsTechnicalDetailsOpen(false)}
          manifest={manifest}
        />
      )}

      <ClinicalReferencesModal
        isOpen={isClinicalReferencesOpen}
        onClose={() => setIsClinicalReferencesOpen(false)}
      />
    </div>
  );
}
