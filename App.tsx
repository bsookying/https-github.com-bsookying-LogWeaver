

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
// Fix: Corrected typo in import from DETEctions_BY_ID to DETECTIONS_BY_ID.
import { DETECTIONS_BY_ID, STORIES, DETECTIONS_LIBRARY, DOMAINS } from './constants';
import type { Story, SimulationConfig, LogEntry, SummaryData, SelectedTechnique, ToastMessage, ImportedStory } from './types';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { CustomizeStoryPanel } from './components/CustomizeStoryPanel';
import { LiveLogDisplay } from './components/LiveLogDisplay';
import { SummaryModal } from './components/SummaryModal';
import { runSimulation, generatePlaceholderValues } from './services/simulationService';
import { Header } from './components/Header';
import { Tab, Tabs } from './components/Tabs';
import { GlobalConfiguration } from './components/GlobalConfiguration';
import { SaveConfirmationModal } from './components/SaveConfirmationModal';
import { ToastContainer } from './components/Toast';

// Dynamically import the StoryBuilder component for code splitting
const StoryBuilder = lazy(() => import('./components/StoryBuilder').then(module => ({ default: module.StoryBuilder })));

const App: React.FC = () => {
    const [syslogIp, setSyslogIp] = useState<string>(() => localStorage.getItem('logweaver_syslogIp') || '127.0.0.1');
    const [xsiamUrl, setXsiamUrl] = useState<string>(() => localStorage.getItem('logweaver_xsiamUrl') || '');
    const [xsiamApiKey, setXsiamApiKey] = useState<string>(() => localStorage.getItem('logweaver_xsiamApiKey') || '');

    const [selectedStoryId, setSelectedStoryId] = useState<string>('');
    const [stageDetectionChoices, setStageDetectionChoices] = useState<Record<number, string>>({});
    const [customEntities, setCustomEntities] = useState<Record<string, string>>({});
    const [addNoise, setAddNoise] = useState<boolean>(true);
    const [simulationPacing, setSimulationPacing] = useState<'fast' | 'normal' | 'slow'>('normal');

    const [simulationState, setSimulationState] = useState<'running' | 'paused' | 'finished'>('finished');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
    
    const [activeTab, setActiveTab] = useState(0);
    const [customStories, setCustomStories] = useState<Story[]>(() => {
        try {
            const saved = localStorage.getItem('logweaver_customStories');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load custom stories:", e);
            return [];
        }
    });
    
    const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
    const [storyToEdit, setStoryToEdit] = useState<Story | null>(null);
    
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [lastSavedStory, setLastSavedStory] = useState<Story | null>(null);

    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isPausedRef = useRef<boolean>(false);
    
    const allStories = useMemo(() => {
        const baseStories = [...STORIES, ...customStories];
        if (generatedStory && !baseStories.find(s => s.id === generatedStory.id)) {
            return [...baseStories, generatedStory];
        }
        return baseStories;
    }, [customStories, generatedStory]);

    useEffect(() => {
        isPausedRef.current = simulationState === 'paused';
    }, [simulationState]);
    
    useEffect(() => { localStorage.setItem('logweaver_syslogIp', syslogIp); }, [syslogIp]);
    useEffect(() => { localStorage.setItem('logweaver_xsiamUrl', xsiamUrl); }, [xsiamUrl]);
    useEffect(() => { localStorage.setItem('logweaver_xsiamApiKey', xsiamApiKey); }, [xsiamApiKey]);
    
    useEffect(() => {
        try {
            localStorage.setItem('logweaver_customStories', JSON.stringify(customStories));
        } catch (e) {
            console.error("Failed to save custom stories:", e);
        }
    }, [customStories]);

    useEffect(() => {
        setStageDetectionChoices({});
        setGeneratedStory(null);
    }, [selectedStoryId]);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleStoryChange = (storyId: string) => {
        setGeneratedStory(null);
        setSelectedStoryId(storyId);
    };

    const handleStart = useCallback(async (storyOverride?: Story) => {
        const story = storyOverride || allStories.find(s => s.id === selectedStoryId);
        if (!story) {
            addToast('Please select a story to run.', 'error');
            return;
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLogs([]);
        setSummary(null);
        setSimulationState('running');

        const placeholders = generatePlaceholderValues();
        const finalEntities = {
            ...placeholders,
            attacker_ip: customEntities.attacker_ip || placeholders.attacker_ip,
            victim_user: customEntities.victim_user || placeholders.victim_user,
            attacker_domain: customEntities.attacker_domain || placeholders.attacker_domain,
            hostname: customEntities.hostname || placeholders.hostname,
            victim_hostname: customEntities.hostname || placeholders.hostname,
            victim_ip: customEntities.victim_ip || placeholders.victim_ip,
            file_name: customEntities.file_name || placeholders.file_name,
            dest_ip: syslogIp,
        };

        const config: SimulationConfig = {
            story,
            stageDetectionChoices,
            entities: finalEntities,
            addNoise,
            detectionsById: DETECTIONS_BY_ID,
            detectionsLibrary: DETECTIONS_LIBRARY,
            xsiamUrl,
            xsiamApiKey,
            pacing: simulationPacing,
        };
        
        const onLogUpdate = (logEntry: LogEntry) => {
            setLogs(prev => {
                const existingIndex = prev.findIndex(l => l.id === logEntry.id);
                if (existingIndex > -1) {
                    const newLogs = [...prev];
                    newLogs[existingIndex] = logEntry;
                    return newLogs;
                }
                return [...prev, logEntry];
            });

            if (logEntry.status === 'failed') {
                const detectionName = logEntry.detection?.name || 'event';
                addToast(`Failed to send log for: "${detectionName}". Check XSIAM URL/Key in Configuration tab.`, 'error');
            }
        };

        try {
            const summaryResult = await runSimulation(
                config,
                onLogUpdate,
                signal,
                isPausedRef
            );
            setSummary(summaryResult);
            setIsSummaryModalOpen(true);
            setSimulationState('finished');
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Simulation stopped by user.');
            } else {
                console.error('Simulation failed:', error);
                const errorLog: LogEntry = { id: Date.now(), timestamp: new Date().toISOString(), rawLog: `ERROR: Simulation failed. ${error.message}`, type: 'error' };
                setLogs(prev => [...prev, errorLog]);
            }
            setSimulationState('finished');
        }
    }, [selectedStoryId, allStories, stageDetectionChoices, customEntities, addNoise, syslogIp, xsiamUrl, xsiamApiKey, simulationPacing, addToast]);


    const handleSimulateStoryFromBuilder = (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => {
         const newStory: Story = {
            id: `custom_simulation_${Date.now()}`,
            name: storyName || `Unsaved Custom Story`,
            description: storyDescription,
            stages: techniques.map(t => ({ name: t.name, domain: t.domain, techniqueId: t.id })),
            actors: ["victim_user", "attacker_ip", "victim_ip", "attacker_domain", "hostname", "file_name"],
        };
        handleStart(newStory);
    };
    
    const handleSaveStory = (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => {
        const newStory: Story = {
            id: `custom_${Date.now()}`,
            name: storyName || `Custom Story ${customStories.length + 1}`,
            description: storyDescription,
            stages: techniques.map(t => ({ name: t.name, domain: t.domain, techniqueId: t.id })),
            actors: [],
        };
        setCustomStories(prev => [...prev, newStory]);
        setLastSavedStory(newStory);
        setIsSaveConfirmOpen(true);
    };

    const handleImportStory = (importedData: ImportedStory) => {
        if (!importedData || !importedData.name || !Array.isArray(importedData.stages)) {
            addToast("Import failed: Invalid story data format.", 'error');
            return;
        }

        const areStagesValid = importedData.stages.every((stage: any) => 
            typeof stage.techniqueId === 'string' &&
            typeof stage.techniqueName === 'string' &&
            typeof stage.domain === 'string' && DOMAINS.includes(stage.domain)
        );

        if (!areStagesValid) {
            addToast("Import failed: One or more stages have missing or invalid data.", 'error');
            return;
        }

        const newStory: Story = {
            id: `custom_${Date.now()}`,
            name: importedData.name,
            description: importedData.description || '',
            stages: importedData.stages.map(stage => ({
                name: stage.techniqueName,
                domain: stage.domain,
                techniqueId: stage.techniqueId,
            })),
            actors: [],
        };
        setCustomStories(prev => [...prev, newStory]);
        
        // Switch to Story Mode and select the newly imported story
        setSelectedStoryId(newStory.id);
        setActiveTab(0);

        addToast(`Story "${newStory.name}" imported successfully!`, 'success');
    };
    
    const handleConfirmSimulate = () => {
        if (lastSavedStory) {
            setSelectedStoryId(lastSavedStory.id);
            setActiveTab(0);
        }
        setIsSaveConfirmOpen(false);
        setLastSavedStory(null);
    };

    const handleConfirmContinue = () => {
        setIsSaveConfirmOpen(false);
        setLastSavedStory(null);
    };


    const handleEditStory = (storyId: string) => {
        const story = allStories.find(s => s.id === storyId);
        if (story) {
            setStoryToEdit(story);
            setActiveTab(1);
        }
    };
    
    const handleDeleteStory = (storyId: string) => {
        if (window.confirm('Are you sure you want to delete this story permanently?')) {
            setCustomStories(prev => prev.filter(s => s.id !== storyId));
            if (selectedStoryId === storyId) {
                setSelectedStoryId('');
            }
        }
    };

    const handleUpdateStory = (storyName: string, storyDescription: string, techniques: SelectedTechnique[]) => {
        if (!storyToEdit) return;
        const updatedStory: Story = {
            ...storyToEdit,
            name: storyName,
            description: storyDescription,
            stages: techniques.map(t => ({ name: t.name, domain: t.domain, techniqueId: t.id })),
            actors: storyToEdit.actors || [],
        };
        setCustomStories(prev => prev.map(s => s.id === storyToEdit.id ? updatedStory : s));
        setStoryToEdit(null);
        setActiveTab(0);
        addToast(`Story "${updatedStory.name}" updated successfully!`, 'success');
    };

    const handleCancelEdit = () => {
        setStoryToEdit(null);
        setActiveTab(0);
    };

    const handlePause = useCallback(() => {
        setSimulationState('paused');
    }, []);
    
    const handleResume = useCallback(() => {
        setSimulationState('running');
    }, []);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setSimulationState('finished');
    }, []);

    const handleNewSession = useCallback(() => {
        handleStop();
        setLogs([]);
        setSummary(null);
        setSelectedStoryId('');
        setStageDetectionChoices({});
        setCustomEntities({});
        setAddNoise(true);
        setStoryToEdit(null);
        setActiveTab(0);
    }, [handleStop]);
    
    const selectedStory = allStories.find(s => s.id === selectedStoryId);

    return (
        <div className="min-h-screen p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
                 <Tabs activeTab={activeTab} setActiveTab={setActiveTab}>
                    <Tab label="Story Mode">
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className={`self-start ${simulationState === 'finished' ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                                <ConfigurationPanel
                                    syslogIp={syslogIp}
                                    setSyslogIp={setSyslogIp}
                                    selectedStoryId={selectedStoryId}
                                    setSelectedStoryId={handleStoryChange}
                                    stories={allStories}
                                    simulationState={simulationState}
                                />
                            </div>
                            {simulationState === 'finished' && (
                                <div className="lg:col-span-5">
                                    {selectedStory ? (
                                        <CustomizeStoryPanel
                                            selectedStory={selectedStory}
                                            addNoise={addNoise}
                                            setAddNoise={setAddNoise}
                                            simulationPacing={simulationPacing}
                                            setSimulationPacing={setSimulationPacing}
                                            customEntities={customEntities}
                                            setCustomEntities={setCustomEntities}
                                            simulationState={simulationState}
                                            stageDetectionChoices={stageDetectionChoices}
                                            setStageDetectionChoices={setStageDetectionChoices}
                                        />
                                    ) : (
                                        <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full flex items-center justify-center">
                                            <p className="text-gray-500 text-center">Select a story to customize and run.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="lg:col-span-12">
                                <LiveLogDisplay
                                    logs={logs}
                                    simulationState={simulationState}
                                    isStorySelected={!!selectedStory}
                                    onPause={handlePause}
                                    onResume={handleResume}
                                    onStop={handleStop}
                                    onStart={() => handleStart()}
                                    onNewSession={handleNewSession}
                                />
                            </div>
                        </div>
                    </Tab>
                    <Tab label="Build Your Own Story">
                        <Suspense fallback={
                            <div className="flex justify-center items-center h-96 bg-gray-800 rounded-lg shadow-lg mt-6">
                                <p className="text-gray-500 text-lg animate-pulse">Loading Story Builder...</p>
                            </div>
                        }>
                            <StoryBuilder 
                                onSimulateCustomStory={handleSimulateStoryFromBuilder}
                                storyToEdit={storyToEdit}
                                onUpdateStory={handleUpdateStory}
                                onCancelEdit={handleCancelEdit}
                                onSaveStory={handleSaveStory}
                                onImportStory={handleImportStory}
                                simulationState={simulationState}
                                logs={logs}
                                onPause={handlePause}
                                // Fix: Pass handleResume function to the onResume prop.
                                onResume={handleResume}
                                onStop={handleStop}
                                onNewSession={handleNewSession}
                            />
                        </Suspense>
                    </Tab>
                    <Tab label="Configuration">
                        <GlobalConfiguration
                            xsiamUrl={xsiamUrl}
                            setXsiamUrl={setXsiamUrl}
                            xsiamApiKey={xsiamApiKey}
                            setXsiamApiKey={setXsiamApiKey}
                            addToast={addToast}
                        />
                    </Tab>
                </Tabs>
            </div>
            {summary && (
                <SummaryModal
                    isOpen={isSummaryModalOpen}
                    onClose={() => setIsSummaryModalOpen(false)}
                    summary={summary}
                />
            )}
            {lastSavedStory && (
                <SaveConfirmationModal
                    isOpen={isSaveConfirmOpen}
                    onSimulate={handleConfirmSimulate}
                    onContinue={handleConfirmContinue}
                    storyName={lastSavedStory.name}
                />
            )}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default App;