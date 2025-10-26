import type { MutableRefObject } from 'react';
import type { SimulationConfig, LogEntry, SummaryData, Detection, Domain } from '../types';
import { DETECTIONS_LIBRARY, gen_azure_ad_audit_log, gen_mde_log, gen_zscaler_log, gen_defender_for_identity_log, gen_meraki_ids_alert_log, gen_panos_log, gen_cisco_asa_log, gen_fortinet_fortigate_log, gen_sentinelone_log, gen_cortex_xdr_log, gen_gcp_audit_log, gen_azure_activity_log, gen_m365_audit_log } from '../constants';
import { sendToXsiam } from './transportService';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const APEX_FINANCIAL_PROFILE = {
    domains: ['apex-financial.net', 'apexfin.local'],
    user_prefixes: ['c.brooks', 'd.evans', 's.patel', 'l.morgan', 'j.chen', 't.rodriguez', 'm.alvarez'],
    // Host prefixes are grouped by physical location to ensure hostnames and IPs are correlated.
    host_prefixes: {
        'nyc': ['trading', 'wealthmgmt', 'risk', 'corp-dev'], // New York City HQ
        'chi': ['analytics', 'finance', 'hr', 'support'],   // Chicago Office
        'sfo': ['app-dev', 'qa', 'prod-support', 'it-ops'], // San Francisco Office
    },
    host_suffixes: ['-ws', '-srv'],
    // Network subnets are tied to the same physical locations.
    private_subnets: {
        'nyc': '10.10.0.0/16',
        'chi': '10.20.0.0/16',
        'sfo': '10.30.0.0/16',
        'branch': '192.168.5.0/24'
    },
    app_names: ['ApexTrade', 'ApexInvest', 'ClientPortal', 'RiskEngine', 'WealthManagerPro'],
    db_names: ['apex-db-prod', 'customer-data-sql', 'trade-ledger-db', 'analytics-warehouse'],
    server_roles: ['api-gateway', 'web-server', 'app-server', 'db-server', 'k8s-node', 'load-balancer', 'firewall-appliance']
};

export const generatePlaceholderValues = () => {
    const choice = <T,>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];
    const public_ipv4 = () => `${randomInt(1, 254)}.${randomInt(1, 254)}.${randomInt(1, 254)}.${randomInt(1, 254)}`;

    // 1. Select a random office location to ensure consistency between hostname and IP.
    const locations = Object.keys(APEX_FINANCIAL_PROFILE.private_subnets) as (keyof typeof APEX_FINANCIAL_PROFILE.private_subnets)[];
    const location = choice(locations);

    // 2. Generate location-specific assets (hostname and IP).
    const hostname_prefix_list = APEX_FINANCIAL_PROFILE.host_prefixes[location];
    const hostname_prefix = choice(hostname_prefix_list);
    const hostname_suffix = choice(APEX_FINANCIAL_PROFILE.host_suffixes);
    const hostname = `${hostname_prefix}${hostname_suffix}${randomInt(10, 99)}`;

    const subnet = APEX_FINANCIAL_PROFILE.private_subnets[location];
    let victim_ip = '';
    if (subnet.startsWith('10.10.'))      victim_ip = `10.10.${randomInt(1, 254)}.${randomInt(1, 254)}`;
    else if (subnet.startsWith('10.20.')) victim_ip = `10.20.${randomInt(1, 254)}.${randomInt(1, 254)}`;
    else if (subnet.startsWith('10.30.')) victim_ip = `10.30.${randomInt(1, 254)}.${randomInt(1, 254)}`;
    else                                  victim_ip = `192.168.5.${randomInt(1, 254)}`;

    // 3. Generate other general assets from the consistent profile.
    return {
        attacker_ip: public_ipv4(),
        victim_user: choice(APEX_FINANCIAL_PROFILE.user_prefixes),
        attacker_domain: `evil-corp-${randomInt(100,999)}.net`,
        hostname: hostname,
        victim_hostname: hostname, // victim_hostname should always mirror hostname
        src_ip: victim_ip,         // For many logs, the source of the event is the victim machine itself.
        victim_ip: victim_ip,
        attacker_port: `${choice([443, 80, 8080, 22])}`,
        victim_port: `${randomInt(49152, 65535)}`,
        email_subject: `${choice(['Urgent Request','Invoice Attached','Security Alert: Action Required','FW: Funny Video'])}`,
        file_name: `${choice(['document','report','setup','invoice'])}_${randomInt(100,999)}.exe`,
        hostname_domain: choice(APEX_FINANCIAL_PROFILE.domains),
        app_name: choice(APEX_FINANCIAL_PROFILE.app_names),
        db_name: choice(APEX_FINANCIAL_PROFILE.db_names),
        server_role: choice(APEX_FINANCIAL_PROFILE.server_roles)
    };
};

const logGenerators: Record<string, (params: Record<string, any>) => Record<string, any>> = {
  gen_azure_ad_audit_log,
  gen_mde_log,
  gen_zscaler_log,
  gen_defender_for_identity_log,
  gen_meraki_ids_alert_log,
  gen_panos_log,
  gen_cisco_asa_log,
  gen_fortinet_fortigate_log,
  gen_sentinelone_log,
  gen_cortex_xdr_log,
  gen_gcp_audit_log,
  gen_azure_activity_log,
  gen_m365_audit_log,
};

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


function flattenObject(ob: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  for (const i in ob) {
    if (Object.prototype.hasOwnProperty.call(ob, i)) {
      if ((typeof ob[i]) === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
        Object.assign(result, flattenObject(ob[i], prefix + i + '_'));
      } else {
        result[prefix + i] = ob[i];
      }
    }
  }
  return result;
}

/**
 * Creates a fully formatted CEF log line from a detection object and its extensions.
 * This is the centralized function for creating all CEF-formatted logs.
 * @param detection The detection object providing metadata.
 * @param extensions An object of key-value pairs for the CEF extension field.
 * @param context An object with placeholder values like IPs and hostnames.
 * @returns A single string representing the full syslog message.
 */
function createCefLog(detection: Detection, extensions: Record<string, any>, context: Record<string, string>): string {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const day = String(now.getDate()).padStart(2, ' ');
    const time = now.toTimeString().split(' ')[0];
    const hostname = context.victim_hostname || 'localhost';
    const syslogHeader = `${month} ${day} ${time} ${hostname}`;
    
    // --- CEF Header Construction ---
    const cefVersion = '0';
    const vendor = detection.productType;
    const product = detection.dataSource;
    const version = '1.0';
    
    // Prioritize header fields from extensions for greater flexibility (e.g., for MDI logs).
    // Fall back to detection metadata if not provided.
    const signatureId = extensions.signatureId || detection.id;
    const name = extensions.name || detection.name;
    const severity = extensions.severity || '5';

    const cefHeader = `CEF:${cefVersion}|${vendor}|${product}|${version}|${signatureId}|${name}|${severity}`;
    
    // Remove fields used in the header from the extension payload to avoid duplication.
    const { 
        name: _name, 
        signatureId: _signatureId, 
        severity: _severity, 
        ...remainingExtensions 
    } = extensions;
    
    let finalExtensions = remainingExtensions;

    // --- Extension Custom Mapping ---
    // Custom mapping for richer MDE logs to standard CEF fields.
    if (detection.productType === 'MDE') {
        const { 
            Timestamp, DeviceId, DeviceName, FolderPath, FileName, 
            SHA1, SHA256,
            ProcessId, ProcessCommandLine, 
            InitiatingProcessId, InitiatingProcessFileName, 
            InitiatingProcessSHA1, InitiatingProcessSHA256,
            InitiatingProcessAccountDomain, InitiatingProcessAccountName, 
            ...rest 
        } = remainingExtensions;

        finalExtensions = {
            ...rest,
            filePath: FolderPath,
            fileHash: SHA256 || SHA1, // Prioritize SHA256
            dvc: context.victim_ip,
            dhost: DeviceName,
            dpid: ProcessId,
            dproc: FileName,
            spid: InitiatingProcessId,
            sproc: InitiatingProcessFileName,
            suser: InitiatingProcessAccountName,
            request: ProcessCommandLine,
            shash: InitiatingProcessSHA256 || InitiatingProcessSHA1, // Prioritize SHA256
            sntdom: InitiatingProcessAccountDomain,
        };
    }
    
    const { deviceVendor, deviceProduct, ...restExtensions } = finalExtensions;
    
    const tacticName = detection.tactic.split(' - ')[1];
    
    const allExtensions = {
        ...restExtensions,
        deviceVendor: vendor,
        deviceProduct: product,
        cat: tacticName, // MITRE Tactic Name
        externalId: detection.mitre_technique, // MITRE Technique ID
        // Explicitly include productType and dataSource as custom fields for better downstream analysis.
        cs1Label: "productType",
        cs1: detection.productType,
        cs2Label: "dataSource",
        cs2: detection.dataSource,
    };

    const extString = Object.entries(allExtensions)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => {
            const escapedValue = String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/=/g, '\\=');
            return `${key}=${escapedValue}`;
        })
        .join(' ');
    
    return `${syslogHeader} ${cefHeader}|${extString}`;
}

async function handleLogGenerationAndDispatch(
    logEntry: LogEntry,
    config: SimulationConfig,
    onLog: (log: LogEntry) => void
) {
    // Show pending status immediately
    onLog({ ...logEntry, status: 'pending' });

    // Asynchronously send the log
    try {
        await sendToXsiam(config, logEntry.rawLog);
        onLog({ ...logEntry, status: 'sent' });
    } catch (error) {
        console.error("Failed to send log to XSIAM:", error);
        onLog({ ...logEntry, status: 'failed' });
    }
}

const PACING_DELAYS = {
    fast: { stage: { min: 200, max: 500 }, noise: { min: 100, max: 300 } },
    normal: { stage: { min: 500, max: 1000 }, noise: { min: 100, max: 300 } },
    slow: { stage: { min: 2000, max: 5000 }, noise: { min: 500, max: 1000 } },
};

async function checkPause(isPausedRef: MutableRefObject<boolean>, signal: AbortSignal) {
    while (isPausedRef.current) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        await delay(200); // Check every 200ms
    }
}

export async function runSimulation(
    config: SimulationConfig,
    onLog: (log: LogEntry) => void,
    signal: AbortSignal,
    isPausedRef: MutableRefObject<boolean>
): Promise<SummaryData> {
    const summary: SummaryData = {
        storyName: config.story.name,
        storyDescription: config.story.description || 'No description provided for this story.',
        entities: config.entities,
        stages: [],
    };
    
    const delays = PACING_DELAYS[config.pacing] || PACING_DELAYS.normal;

    let logIdCounter = 0;

    for (const [index, stage] of (config.story.stages || []).entries()) {
        await checkPause(isPausedRef, signal);
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        
        const stageName = `${index + 1}. ${stage.name}`;
        const stageEvents: LogEntry[] = [];
        
        const infoLog: LogEntry = { id: logIdCounter++, timestamp: new Date().toISOString(), rawLog: `--- Starting Stage: ${stageName} ---`, type: 'info' };
        onLog(infoLog);

        const chosenDetectionId = config.stageDetectionChoices[index];
        let detection: Detection | undefined;

        if (chosenDetectionId) {
            detection = config.detectionsById[chosenDetectionId];
        } else {
            // Fallback: pick the first available detection for the stage.
            const possibleDetections = DETECTIONS_LIBRARY.filter(d => 
                d.domain === stage.domain && d.mitre_technique.startsWith(stage.techniqueId)
            );

            // Custom sort to prioritize vendors for default story execution.
            possibleDetections.sort((a, b) => {
                const getPriority = (productType: string): number => {
                    // Prioritize Palo Alto Networks products for relevant domains.
                    if (productType === 'Cortex XDR' || productType === 'PAN-OS') {
                        return 1; // Highest priority
                    }
                    return 99; // Lower priority for other vendors.
                };

                const priorityA = getPriority(a.productType);
                const priorityB = getPriority(b.productType);

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                // If priorities are the same, fallback to alphabetical for consistency.
                return a.productType.localeCompare(b.productType);
            });
            
            detection = possibleDetections.length > 0 ? possibleDetections[0] : undefined;
        }

        if (detection) {
            const params = processParams(detection.simulation.params, config.entities);
            
            const generatorFn = logGenerators[detection.simulation.generator];
            let logData: Record<string, any>;

            if (generatorFn) {
                // All custom generators return an object payload for CEF extensions.
                logData = generatorFn(params);
            } else {
                // For "generic_cef" or unhandled generators, the params themselves are the extensions.
                logData = { ...params };
            }
            
            const flattenedData = flattenObject(logData);
            const rawLog = createCefLog(detection, flattenedData, config.entities);
            
            const logEntry: LogEntry = {
                id: logIdCounter++,
                timestamp: new Date().toISOString(),
                rawLog,
                type: 'alert',
                detection,
            };

            stageEvents.push(logEntry);
            handleLogGenerationAndDispatch(logEntry, config, onLog);

            if (config.addNoise) {
                const noiseCount = randomInt(2, 5);
                const noisePool = DETECTIONS_LIBRARY.filter(d => d.id !== 'panos_001');
                for (let i = 0; i < noiseCount; i++) {
                    await checkPause(isPausedRef, signal);
                    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                    await delay(randomInt(delays.noise.min, delays.noise.max));
                    
                    const noiseDetection = noisePool[randomInt(0, noisePool.length - 1)];
                    const noiseParams = processParams(noiseDetection.simulation.params, config.entities);
                    const noiseGeneratorFn = logGenerators[noiseDetection.simulation.generator];

                    let noiseLogData: Record<string, any>;
                    if (noiseGeneratorFn) {
                        noiseLogData = noiseGeneratorFn(noiseParams);
                    } else {
                        noiseLogData = { ...noiseParams };
                    }
                    
                    const flattenedNoiseData = flattenObject(noiseLogData);
                    const noiseRawLog = createCefLog(noiseDetection, flattenedNoiseData, config.entities);

                    const noiseLogEntry: LogEntry = {
                        id: logIdCounter++,
                        timestamp: new Date().toISOString(),
                        rawLog: noiseRawLog,
                        type: 'benign',
                        detection: noiseDetection,
                    };
                     stageEvents.push(noiseLogEntry);
                    handleLogGenerationAndDispatch(noiseLogEntry, config, onLog);
                }
            }
        } else {
             const noDetectionLog: LogEntry = { id: logIdCounter++, timestamp: new Date().toISOString(), rawLog: `No suitable detection found for ${stage.domain} with technique ${stage.techniqueId}`, type: 'error' };
             stageEvents.push(noDetectionLog);
             onLog(noDetectionLog);
        }

        summary.stages.push({ name: stageName, events: stageEvents });
        await checkPause(isPausedRef, signal);
        await delay(randomInt(delays.stage.min, delays.stage.max));
    }

    onLog({ id: logIdCounter++, timestamp: new Date().toISOString(), rawLog: '--- Simulation Complete ---', type: 'info' });
    return summary;
}