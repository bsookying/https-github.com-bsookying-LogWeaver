export interface MitreTechnique {
  id: string;
  name: string;
  description: string;
}

export interface MitreTactic {
  id: string;
  name: string;
  techniques: MitreTechnique[];
}

export const ATTACK_MATRIX: MitreTactic[] = [
  {
    id: "TA0043",
    name: "Reconnaissance",
    techniques: [
      { id: "T1595", name: "Active Scanning", description: "Adversaries may execute active scans of victim hosts to gather information. Active scanning is a method of probing a network to discover hosts, services, and vulnerabilities." },
      { id: "T1592", name: "Gather Victim Host Information", description: "Adversaries may gather detailed information about the victim's hosts. This information can include operating system, patches, running services, and installed software." },
      { id: "T1590", name: "Gather Victim Network Information", description: "Adversaries may gather information about the victim's network, including topology, trusted relationships, and network services, to inform their targeting." },
    ],
  },
  {
    id: "TA0001",
    name: "Initial Access",
    techniques: [
      { id: "T1566", name: "Phishing", description: "Adversaries may send phishing messages to recipients to gain access to victim systems. Phishing can be used to gain execution, collect information, or steal credentials." },
      { id: "T1189", name: "Drive-by Compromise", description: "Adversaries may gain initial access to a system through a drive-by compromise, where a user's web browser is targeted to execute malicious code by visiting a compromised website." },
      { id: "T1078", name: "Valid Accounts", description: "Adversaries may obtain and abuse credentials of existing accounts as a means of gaining initial access, persistence, privilege escalation, or defense evasion." },
      { id: "T1190", name: "Exploit Public-Facing Application", description: "Adversaries may exploit weaknesses in internet-facing applications (e.g., web servers, databases) to gain initial access to a network." },
    ],
  },
  {
    id: "TA0002",
    name: "Execution",
    techniques: [
      { id: "T1059", name: "Command and Scripting Interpreter", description: "Adversaries may abuse command and scripting interpreters (e.g., PowerShell, Bash) to execute arbitrary commands on a local or remote system." },
      { id: "T1204", name: "User Execution", description: "Adversaries may rely on user execution of malicious content to gain initial access. This may be through clicking a link, opening a document, or running an executable." },
      { id: "T1053", name: "Scheduled Task/Job", description: "Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code." },
      { id: "T1047", name: "Windows Management Instrumentation", description: "Adversaries may abuse WMI to execute malicious commands and payloads. WMI is a standard Windows administration feature that provides a uniform environment for local and remote access to Windows system components." },
    ],
  },
  {
    id: "TA0003",
    name: "Persistence",
    techniques: [
      { id: "T1098", name: "Account Manipulation", description: "Adversaries may manipulate accounts to maintain access to victim systems. This can include modifying credentials, permissions, or other account attributes." },
      { id: "T1547", name: "Boot or Logon Autostart Execution", description: "Adversaries may configure systems to automatically execute malicious code on boot or user logon to achieve persistence." },
      { id: "T1136", name: "Create Account", description: "Adversaries may create new accounts on a system or in a domain to maintain access." },
    ],
  },
  {
    id: "TA0004",
    name: "Privilege Escalation",
    techniques: [
        { id: "T1611", name: "Escape to Host", description: "Adversaries may break out of a container or virtualized environment to gain access to the underlying host, which can lead to privilege escalation." },
    ]
  },
  {
    id: "TA0005",
    name: "Defense Evasion",
    techniques: [
        { id: "T1027", name: "Obfuscated Files or Information", description: "Adversaries may attempt to make their files and commands more difficult to discover or analyze by encrypting, encoding, or otherwise obfuscating them." },
        { id: "T1070", name: "Indicator Removal", description: "Adversaries may delete or modify files, logs, or other artifacts to conceal their activity." },
        { id: "T1562", name: "Impair Defenses", description: "Adversaries may attempt to disable or circumvent security controls to avoid detection." },
    ]
  },
  {
    id: "TA0006",
    name: "Credential Access",
    techniques: [
      { id: "T1003", name: "OS Credential Dumping", description: "Adversaries may attempt to dump credentials from the operating system to obtain plaintext passwords or password hashes for use in lateral movement." },
      { id: "T1110", name: "Brute Force", description: "Adversaries may attempt to guess login credentials through a systematic, trial-and-error approach." },
      { id: "T1555", name: "Credentials from Password Stores", description: "Adversaries may steal credentials from password managers or web browsers." },
      { id: "T1557", name: "Adversary-in-the-Middle", description: "Adversaries may position themselves between two or more networked devices to intercept and potentially alter communications to steal credentials or other sensitive information." },
      { id: "T1558", name: "Steal or Forge Kerberos Tickets", description: "Adversaries may steal or forge Kerberos tickets to authenticate to systems as other users. This can include Golden Tickets (T1558.001) or Silver Tickets (T1558.002)." },
    ],
  },
  {
    id: "TA0007",
    name: "Discovery",
    techniques: [
      { id: "T1087", name: "Account Discovery", description: "Adversaries may attempt to get a list of local or domain accounts." },
      { id: "T1082", name: "System Information Discovery", description: "Adversaries may attempt to gather information about a system's configuration, hardware, and software." },
      { id: "T1049", name: "System Network Connections Discovery", description: "Adversaries may check for existing network connections to understand network topology and identify potential targets." },
    ],
  },
  {
    id: "TA0011",
    name: "Command and Control",
    techniques: [
      { id: "T1071", name: "Application Layer Protocol", description: "Adversaries may use common application layer protocols (e.g., HTTP, DNS) for command and control to blend in with normal traffic." },
      { id: "T1095", name: "Non-Application Layer Protocol", description: "Adversaries may use protocols that operate at lower layers of the network stack (e.g., ICMP) for command and control." },
      { id: "T1105", name: "Ingress Tool Transfer", description: "Adversaries may transfer tools or other files from an external system into a compromised environment." },
    ],
  },
  {
    id: "TA0010",
    name: "Exfiltration",
    techniques: [
      { id: "T1041", name: "Exfiltration Over C2 Channel", description: "Adversaries may steal data by exfiltrating it over an existing command and control channel." },
      { id: "T1048", name: "Exfiltration Over Alternative Protocol", description: "Adversaries may steal data by exfiltrating it over a different protocol from the primary command and control channel." },
      { id: "T1567", name: "Exfiltration Over Web Service", description: "Adversaries may exfiltrate data to a cloud storage service or other web service to evade detection." },
    ],
  },
  {
    id: "TA0009",
    name: "Collection",
    techniques: [
        { id: "T1119", name: "Automated Collection", description: "Adversaries may use scripts or tools to automatically search for and collect data of interest." },
        { id: "T1005", name: "Data from Local System", description: "Adversaries may steal data from the local file system." },
        { id: "T1560", name: "Archive Collected Data", description: "Adversaries may compress or encrypt collected data before exfiltration to reduce its size and evade detection." },
    ]
  },
  {
    id: "TA0040",
    name: "Impact",
    techniques: [
      { id: "T1486", name: "Data Encrypted for Impact", description: "Adversaries may encrypt data on target systems or on-demand to interrupt availability to system and network resources. This is commonly known as ransomware." },
      { id: "T1490", name: "Inhibit System Recovery", description: "Adversaries may delete or remove built-in data recovery mechanisms to inhibit system recovery. This can include deleting shadow copies or backups." },
    ]
  }
];