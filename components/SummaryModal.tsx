import React, { Fragment, useMemo } from 'react';
import type { SummaryData, Detection, LogEntry } from '../types';
import { ATTACK_MATRIX } from '../constants/mitre';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: SummaryData;
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="border border-gray-700 rounded-md">
            <h2>
                <button
                    type="button"
                    className={`flex items-center justify-between w-full p-4 font-medium text-left text-gray-200 ${isOpen ? 'bg-green-800/50' : 'bg-gray-700 hover:bg-gray-600'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{title}</span>
                    <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </h2>
            {isOpen && (
                <div className="p-4 bg-gray-800">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- Helper functions for dynamic mapping generation ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function processParams(params: Record<string, any>, context: Record<string, string>): Record<string, any> {
    const processed: Record<string, any> = {};
    for (const key in params) {
        let value = params[key];
        if (typeof value === 'string') {
            value = value.replace(/{([a-zA-Z0-9_]+)}/g, (match, placeholder) => {
                return context[placeholder] || match;
            });
            if (value.includes('{random_choice:')) {
                const options = value.match(/\{random_choice:(.*)\}/)?.[1].split(',') || [];
                value = options[randomInt(0, options.length - 1)];
            }
             if (value.includes('{random_int:')) {
                const [min, max] = value.match(/\{random_int:(.*)\}/)?.[1].split(',').map(Number) || [0, 1000];
                value = randomInt(min, max).toString();
            }
        }
        processed[key] = value;
    }
    return processed;
}

const getCefSeverity = (rawLog: string): string => {
    const cefSeverityMatch = rawLog.match(/CEF:0\|.*?\|.*?\|.*?\|.*?\|.*?\|(\d+)\|/);
    return cefSeverityMatch ? cefSeverityMatch[1] : '5'; // Default to 5 if not found
};

const CORTEX_MAPPINGS: { cortexField: string; sourceKeys: string[]; isDetectionProperty?: keyof Detection }[] = [
    { cortexField: 'SOURCE IP', sourceKeys: ['attacker_ip', 'src_ip', 'sourceIPAddress', 'shost', 'client_ipAddress', 'srcip', 'src'] },
    { cortexField: 'SOURCE PORT', sourceKeys: ['spt', 'src_port', 'srcport'] },
    { cortexField: 'DESTINATION IP', sourceKeys: ['victim_ip', 'dest_ip', 'dst_ip', 'dstip', 'dst'] },
    { cortexField: 'DESTINATION PORT', sourceKeys: ['dpt', 'dest_port', 'dstport'] },
    { cortexField: 'HOSTNAME', sourceKeys: ['hostname', 'victim_hostname', 'DeviceName', 'ComputerName', 'agent_hostname', 'dvchost'] },
    { cortexField: 'USERNAME', sourceKeys: ['victim_user', 'user_name', 'actor_displayName', 'suser', 'user', 'caller', 'principalEmail', 'UserId', 'actor_user_name'] },
    { cortexField: 'DOMAIN', sourceKeys: ['attacker_domain', 'hostname_domain', 'dntdom'] },
    { cortexField: 'PROCESS COMMAND LINE', sourceKeys: ['ProcessCommandLine', 'CommandLine', 'actor_process_command_line', 'process_commandline', 'process_cmdline'] },
    { cortexField: 'PROCESS SHA256', sourceKeys: ['SHA256', 'actor_process_image_sha256', 'shash', 'filedigest'] },
    { cortexField: 'PROCESS FILE PATH', sourceKeys: ['actor_process_image_path', 'FilePath', 'process_name'] },
    { cortexField: 'ACTION', sourceKeys: ['action', 'Action'] },
    { cortexField: 'CATEGORY', sourceKeys: ['category', 'catdesc', 'threat_category'] },
    { cortexField: 'EXTERNAL ID', sourceKeys: [], isDetectionProperty: 'mitre_technique' },
    { cortexField: 'DESCRIPTION', sourceKeys: ['msg', 'message', 'threat_name'] },
];

const generateMappingsForAlert = (alert: LogEntry, entities: Record<string, string>) => {
    if (!alert.detection) return [];
    
    const processedParams = processParams(alert.detection.simulation.params, entities);
    const mappings: { cortexField: string; sourceKey: string; value: string }[] = [];

    CORTEX_MAPPINGS.forEach(mapping => {
        if (mapping.isDetectionProperty) {
            const value = alert.detection![mapping.isDetectionProperty];
            if (value) {
                mappings.push({ cortexField: mapping.cortexField, sourceKey: `detection.${mapping.isDetectionProperty}`, value: String(value) });
            }
            return;
        }

        for (const key of mapping.sourceKeys) {
            if (processedParams[key] !== undefined) {
                mappings.push({ cortexField: mapping.cortexField, sourceKey: key, value: String(processedParams[key]) });
                return; // Found a value, move to the next Cortex field
            }
        }
    });

    return mappings;
};
// --- End Helper Functions ---

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, summary }) => {
    if (!isOpen) return null;

    const techniqueMap = useMemo(() => {
        const map = new Map<string, { name: string; description: string }>();
        ATTACK_MATRIX.forEach(tactic => {
            tactic.techniques.forEach(tech => {
                map.set(tech.id, { name: tech.name, description: tech.description });
            });
        });
        return map;
    }, []);

    const allAlerts = useMemo(() => 
        summary.stages.flatMap(stage => stage.events.filter(event => event.type === 'alert')),
        [summary.stages]
    );

    const downloadSummary = () => {
        let content = `# ${summary.storyName}\n\n`;
        content += `${summary.storyDescription}\n\n`;
        content += "## Key Entities\n";
        for (const [key, value] of Object.entries(summary.entities)) {
            content += `- ${key}: ${value}\n`;
        }
        content += "\n";

        summary.stages.forEach(stage => {
            content += `## Stage: ${stage.name}\n`;
            stage.events.forEach(event => {
                content += `### ${event.detection?.name || 'Benign Event'} (${event.type})\n`;
                content += `**Tactic:** ${event.detection?.tactic || 'N/A'}\n`;
                content += `**Technique:** ${event.detection?.mitre_technique || 'N/A'}\n\n`;
                content += "```\n" + event.rawLog + "\n```\n\n";
            });
        });

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logweaver-summary-${summary.storyName.replace(/\s/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white">Simulation Summary</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <h3 className="text-xl font-semibold text-green-400 text-center">{summary.storyName}</h3>
                    {summary.storyDescription && (
                        <p className="text-base font-semibold text-gray-300 my-4">{summary.storyDescription}</p>
                    )}
                    
                    <div className="bg-gray-700 p-4 rounded-md">
                        <h4 className="font-semibold text-lg mb-2 text-white">Key Entities</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {Object.entries(summary.entities).map(([key, value]) => (
                                <div key={key}><span className="text-gray-400">{key}:</span> <span className="font-mono text-gray-200">{value}</span></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {summary.stages.map((stage, index) => {
                            const alertEvent = stage.events.find(event => event.type === 'alert');
                            const techniqueId = alertEvent?.detection?.mitre_technique?.split('.')[0];
                            const techniqueInfo = techniqueId ? techniqueMap.get(techniqueId) : null;

                            return (
                                <AccordionItem key={index} title={stage.name.replace(/^\d+\.\s/, '')} defaultOpen={false}>
                                    {techniqueInfo && (
                                        <div className="mb-4 p-3 bg-gray-900 rounded-md">
                                            <h5 className="font-semibold text-green-400">{techniqueInfo.name} ({techniqueId})</h5>
                                            <p className="text-sm text-gray-300 mt-1">{techniqueInfo.description}</p>
                                        </div>
                                    )}
                                    <ul className="space-y-2">
                                        {stage.events.map(event => (
                                            <li key={event.id} className="bg-gray-900 p-3 rounded-md">
                                                <p className={`font-semibold ${event.type === 'alert' ? 'text-red-400' : 'text-gray-300'}`}>{event.detection?.name || 'Benign Event'}</p>
                                                <p className="text-xs text-gray-400">{event.detection?.tactic} - {event.detection?.mitre_technique}</p>
                                                <pre className="mt-2 p-2 bg-black rounded-md text-xs font-mono text-gray-300 overflow-x-auto">{event.rawLog}</pre>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionItem>
                            );
                        })}
                    </div>

                    <div className="bg-gray-700 p-4 rounded-md">
                        <h4 className="font-semibold text-lg mb-2 text-white">Recommended Mappings</h4>
                         <div className="space-y-4">
                           {allAlerts.length > 0 ? allAlerts.map(alert => {
                               if (!alert.detection) return null;
                               const optionalMappings = generateMappingsForAlert(alert, summary.entities);

                               return (
                                   <div key={alert.id} className="border border-gray-600 rounded-lg overflow-hidden">
                                        <h3 className="p-3 font-semibold bg-gray-700/70 text-green-300">{alert.detection.name}</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm text-left">
                                                <thead className="bg-gray-700 text-xs text-gray-300 uppercase">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-2">Cortex XDR Field</th>
                                                        <th scope="col" className="px-4 py-2">Source Log Field</th>
                                                        <th scope="col" className="px-4 py-2">Example Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-900/50">
                                                    <tr className="border-b border-gray-700 font-semibold text-green-300"><td colSpan={3} className="px-4 py-1.5 bg-gray-700/50">Required Mappings</td></tr>
                                                    <tr className="border-b border-gray-700">
                                                        <td className="px-4 py-2 font-medium text-gray-200">TIMESTAMP</td>
                                                        <td className="px-4 py-2 font-mono text-gray-400">(from log header)</td>
                                                        <td className="px-4 py-2 font-mono text-gray-200">{alert.timestamp}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-700">
                                                        <td className="px-4 py-2 font-medium text-gray-200">SEVERITY</td>
                                                        <td className="px-4 py-2 font-mono text-gray-400">(from log header)</td>
                                                        <td className="px-4 py-2 font-mono text-gray-200">{getCefSeverity(alert.rawLog)}</td>
                                                    </tr>
                                                    <tr className="border-b border-gray-700">
                                                        <td className="px-4 py-2 font-medium text-gray-200">ALERT NAME</td>
                                                        <td className="px-4 py-2 font-mono text-gray-400">detection.name</td>
                                                        <td className="px-4 py-2 font-mono text-gray-200">{alert.detection.name}</td>
                                                    </tr>
                                                    
                                                    {optionalMappings.length > 0 && (
                                                        <tr className="font-semibold text-green-300"><td colSpan={3} className="px-4 py-1.5 bg-gray-700/50">Optional Mappings</td></tr>
                                                    )}
                                                    {optionalMappings.map(mapping => (
                                                         <tr key={mapping.cortexField} className="border-b border-gray-700">
                                                            <td className="px-4 py-2 font-medium text-gray-200">{mapping.cortexField}</td>
                                                            <td className="px-4 py-2 font-mono text-gray-400">{mapping.sourceKey}</td>
                                                            <td className="px-4 py-2 font-mono text-gray-200 break-all">{mapping.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                               );
                           }) : <p className="text-gray-400 p-2">No alerts were generated in this simulation to create mappings for.</p>}
                       </div>
                    </div>
                </div>
                <div className="flex justify-between items-center p-4 border-t border-gray-700">
                    <button onClick={downloadSummary} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500">
                        Download Summary (MD)
                    </button>
                    <button onClick={onClose} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Close</button>
                </div>
            </div>
        </div>
    );
};