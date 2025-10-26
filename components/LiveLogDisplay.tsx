

import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';
import { LiveLogIcon, CheckCircleIcon, XCircleIcon, CloudUploadIcon, DownloadIcon, PauseIcon, PlayIcon, StopIcon, TrashIcon } from './icons';

interface LiveLogDisplayProps {
    logs: LogEntry[];
    simulationState: 'running' | 'paused' | 'finished';
    isStorySelected: boolean;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onStart: () => void;
    onNewSession: () => void;
    showControls?: boolean;
}

const LogStatusIndicator: React.FC<{ status: LogEntry['status'] }> = ({ status }) => {
    if (!status) return null;

    switch (status) {
        case 'pending':
            return <span title="Sending..."><CloudUploadIcon className="w-3 h-3 text-gray-500 animate-pulse" /></span>;
        case 'sent':
            return <span title="Sent successfully"><CheckCircleIcon className="w-3 h-3 text-green-500" /></span>;
        case 'failed':
            return <span title="Failed to send"><XCircleIcon className="w-3 h-3 text-red-500" /></span>;
        default:
            return null;
    }
}

export const LiveLogDisplay: React.FC<LiveLogDisplayProps> = ({ logs, simulationState, isStorySelected, onPause, onResume, onStop, onStart, onNewSession, showControls = true }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            const isScrolledToBottom = logContainerRef.current.scrollHeight - logContainerRef.current.clientHeight <= logContainerRef.current.scrollTop + 1;
            if (isScrolledToBottom) {
                 logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
        }
    }, [logs]);

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'alert': return 'text-red-400';
            case 'benign': return 'text-gray-400';
            case 'info': return 'text-blue-400';
            case 'error': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    };

    const escapeCsvCell = (cell: any): string => {
        if (cell === null || cell === undefined) {
            return '';
        }
        const str = String(cell);
        if (str.search(/("|,|\n)/g) >= 0) {
            const escapedStr = str.replace(/"/g, '""');
            return `"${escapedStr}"`;
        }
        return str;
    };

    const downloadLogsAsCsv = () => {
        if (logs.length === 0) return;
        
        const headers = ['timestamp', 'type', 'status', 'detection_name', 'detection_id', 'mitre_technique', 'product', 'raw_log'];
        const csvRows = [headers.join(',')];

        logs.forEach(log => {
            const row = [
                log.timestamp,
                log.type,
                log.status || '',
                log.detection?.name || '',
                log.detection?.id || '',
                log.detection?.mitre_technique || '',
                log.detection?.productType || '',
                log.rawLog
            ].map(escapeCsvCell);
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `logweaver_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const secondaryButtonClass = "flex items-center justify-center py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors";

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex-grow flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <LiveLogIcon className="w-6 h-6 mr-2 text-green-400" />
                    Live Log Display
                </h2>
                {showControls && (
                    <div className="flex items-center gap-2">
                        {simulationState === 'finished' && (
                            <button onClick={onStart} disabled={!isStorySelected} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">
                                <PlayIcon className="w-4 h-4 mr-2" /> Start Simulation
                            </button>
                        )}
                        {simulationState === 'running' && (
                            <button onClick={onPause} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors">
                                <PauseIcon className="w-4 h-4 mr-2" /> Pause
                            </button>
                        )}
                        {simulationState === 'paused' && (
                            <button onClick={onResume} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors">
                                <PlayIcon className="w-4 h-4 mr-2" /> Resume
                            </button>
                        )}
                        {(simulationState === 'running' || simulationState === 'paused') && (
                            <button onClick={onStop} className="flex items-center justify-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">
                                <StopIcon className="w-4 h-4 mr-2" /> Stop
                            </button>
                        )}
                        <button onClick={downloadLogsAsCsv} disabled={logs.length === 0} className={secondaryButtonClass}>
                            <DownloadIcon className="w-4 h-4 mr-2" /> Export
                        </button>
                        <button onClick={onNewSession} disabled={simulationState !== 'finished'} className={secondaryButtonClass}>
                            <TrashIcon className="w-4 h-4 mr-2" /> Reset
                        </button>
                    </div>
                )}
            </div>
            <div ref={logContainerRef} className="flex-grow p-4 overflow-y-auto font-mono text-xs bg-[#0d1117] rounded-b-lg">
                {logs.length === 0 ? (
                    <div className="text-gray-500 h-full flex items-center justify-center">
                        <p>Logs will appear here once a simulation starts...</p>
                    </div>
                ) : (
                    logs.map((log) => (
                         <div key={log.id} className="flex items-start">
                            <div className="flex-shrink-0 w-4 pt-0.5">
                                <LogStatusIndicator status={log.status} />
                            </div>
                            <div className={`flex-grow whitespace-pre-wrap break-all ${getLogColor(log.type)}`}>
                               <span className="text-gray-500 select-none mr-2">{log.timestamp.split('T')[1].replace('Z','')}</span>
                               <span>{log.rawLog}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};