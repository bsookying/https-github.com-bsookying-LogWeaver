


export interface Detection {
    id: string;
    name: string;
    tactic: string;
    mitre_technique: string;
    dataSource: string;
    productType: string;
    domain: Domain;
    simulation: {
        type: 'single' | 'loop';
        count?: number;
        generator: string;
        params: Record<string, any>;
    };
}

export type Domain = "Network" | "Identity" | "Cloud" | "Endpoint" | "Email";

export interface StoryStage {
    name: string;
    domain: Domain;
    techniqueId: string;
    index?: number;
}

export interface Story {
    id: string;
    name: string;
    description?: string;
    actors?: string[];
    stages: StoryStage[];
}

export type LogStatus = 'pending' | 'sent' | 'failed';

export interface LogEntry {
    id: number;
    timestamp: string;
    rawLog: string;
    type: 'alert' | 'benign' | 'info' | 'error';
    detection?: Detection;
    status?: LogStatus;
}

export interface SimulationConfig {
    story: Story;
    stageDetectionChoices: Record<number, string>;
    entities: Record<string, string>;
    addNoise: boolean;
    detectionsById: Record<string, Detection>;
    detectionsLibrary: Detection[];
    xsiamUrl: string;
    xsiamApiKey: string;
    pacing: 'fast' | 'normal' | 'slow';
}

export interface SummaryData {
    storyName: string;
    storyDescription: string;
    entities: Record<string, string>;
    stages: {
        name: string;
        events: LogEntry[];
    }[];
}
export interface SelectedTechnique {
    id: string;
    name: string;
    tacticName: string;
    domain: Domain;
    productType: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ImportedStoryStage {
    techniqueId: string;
    techniqueName: string;
    tactic: string;
    domain: Domain;
}

export interface ImportedStory {
    name: string;
    description: string;
    stages: ImportedStoryStage[];
}
