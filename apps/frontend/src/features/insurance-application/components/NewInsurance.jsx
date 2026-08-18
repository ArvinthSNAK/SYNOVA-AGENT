import React from 'react';
import UserNavbar from '../../../components/layout/UserNavbar.jsx';
import useInsuranceApplication from '../hooks/useInsuranceApplication.js';
import InsuranceStepper from './InsuranceStepper.jsx';
import EulerWorkspace from './EulerWorkspace.jsx';
import VehicleInformation from './VehicleInformation.jsx';
import ApplicationReview from './ApplicationReview.jsx';
import QuotePreparation from './QuotePreparation.jsx';
import ResumeDraft from './ResumeDraft.jsx';

import './EulerWorkspace.css';
import './EulerInput.css';
import './VehicleInformation.css';
import './VehicleDocumentUpload.css';
import './ApplicationReview.css';
import './QuotePreparation.css';
import './NewInsurance.css';

export default function NewInsurance() {
  const app = useInsuranceApplication();
  const { state, draftAvailable, vehicleComplete, estimatedPremium } = app;

  // ─── Step content for the action panel ────────────────────────────────────
  const renderActionPanel = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <VehicleInformation
            vehicle={state.vehicle}
            onUpdateVehicle={app.updateVehicle}
            onSetVehicle={app.setVehicle}
            inputMode={state.inputMode}
            extractionData={state.extraction.data}
            documentExtraction={state.documentExtraction}
            onDocumentUpload={app.handleDocumentUpload}
            onContinue={app.nextStep}
            vehicleComplete={vehicleComplete}
          />
        );
      case 2:
        return (
          <ApplicationReview
            vehicle={state.vehicle}
            applicationId={state.applicationId}
            estimatedPremium={estimatedPremium}
            userConfirmed={state.userConfirmed}
            onConfirmChange={app.setUserConfirmed}
            onGetQuotes={() => { app.nextStep(); app.submitForQuotes(); }}
            onEditVehicle={() => app.goToStep(1)}
            onBack={app.prevStep}
          />
        );
      case 3:
        return (
          <QuotePreparation
            quoteState={state.quote}
            onRetry={app.submitForQuotes}
          />
        );
      default:
        return null;
    }
  };

  // Euler panel is active during vehicle information collection
  const showEuler = state.currentStep === 1;

  return (
    <div className="ins-layout mesh-ambient-bg">
      {/* Top Glass Navbar with Overview, Wallet, Policies, Applications */}
      <UserNavbar />

      {/* Main content */}
      <div className="ins-main">
        {/* Unified Page Header containing Title, Subtitle, and Embedded Stepper */}
        <div className="ins-page-header">
          <div className="ins-page-header-inner">
            <div className="ins-page-header-text">
              <h1 className="ins-page-title">Get your auto insurance</h1>
              <p className="ins-page-sub">
                Provide your vehicle details manually or upload your RC document. Euler will prepare your application.
              </p>
            </div>
            <div className="ins-page-header-stepper">
              <InsuranceStepper
                currentStep={state.currentStep}
                onStepClick={app.goToStep}
              />
            </div>
          </div>
        </div>

        {/* Draft recovery banner */}
        {draftAvailable && (
          <div className="ins-draft-banner-wrap">
            <ResumeDraft onResume={app.resumeDraft} onDiscard={app.discardDraft} />
          </div>
        )}

        {/* Workspace: Form LEFT · Euler RIGHT */}
        <div className={`ins-workspace${showEuler ? ' ins-workspace--split' : ' ins-workspace--single'}`}>
          {/* LEFT: Action / form panel */}
          <div className={`ins-action-col${!showEuler ? ' ins-action-col--full' : ''}`}>
            <div className="ins-action-panel">
              {renderActionPanel()}
            </div>
          </div>

          {/* RIGHT: Euler assistant */}
          {showEuler && (
            <div className="ins-euler-col">
              <EulerWorkspace
                conversation={state.eulerConversation}
                inputMode={state.inputMode}
                extractionStatus={state.extraction.status}
                documentExtractionStatus={state.documentExtraction?.status}
                onQuickAction={app.setInputMode}
                onSendMessage={app.sendEulerMessage}
                onDocumentUpload={app.handleDocumentUpload}
                currentStep={state.currentStep}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
