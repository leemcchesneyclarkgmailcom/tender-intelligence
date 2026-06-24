/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '../src/lib/db'

const INDUSTRIES = ['construction', 'consulting', 'defence', 'technology', 'mining', 'infrastructure', 'healthcare']
const COUNTRIES = ['United States', 'United Kingdom', 'Australia', 'Canada', 'Germany', 'Singapore', 'United Arab Emirates', 'Japan', 'Brazil', 'South Africa']

interface TenderSeed {
  reference: string
  title: string
  description: string
  buyer: string
  buyerType: string
  country: string
  region?: string
  industry: string
  category: string
  procurementType: string
  budgetMin: number
  budgetMax: number
  budgetCurrency: string
  publishedDaysAgo: number
  deadlineDaysFromNow: number
  durationDays: number
  status: string
  url?: string
  contactEmail?: string
}

const TENDERS: TenderSeed[] = [
  // ─── Construction ───────────────────────────────────────────────
  {
    reference: 'DOT-2025-4471',
    title: 'Construction of Regional Highway Interchange and Overpass Structures',
    description:
      'The Department of Transportation invites qualified civil construction contractors to design and construct a grade-separated highway interchange including three pre-stressed concrete overpass bridges, 8.4 km of dual carriageway realignment, drainage systems, intelligent transport systems (ITS) infrastructure, and associated road furniture. The works must comply with AASHTO LRFD Bridge Design Specifications. Mandatory requirements include: minimum 10 years demonstrated experience in highway bridge construction, ISO 9001 certification, and a pre-qualification bond of 5% of the contract value. The project spans 28 months with phased handover. Bidders must demonstrate capacity to mobilise within 60 days of contract award and maintain a minimum local content of 35%.',
    buyer: 'Department of Transportation',
    buyerType: 'government',
    country: 'United States',
    region: 'Midwest',
    industry: 'construction',
    category: 'civil-works',
    procurementType: 'open',
    budgetMin: 145000000,
    budgetMax: 185000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 9,
    deadlineDaysFromNow: 38,
    durationDays: 840,
    status: 'open',
    url: 'https://sam.gov/procurement/dot-2025-4471',
    contactEmail: 'procurement@dot.gov',
  },
  {
    reference: 'TFL-CIV-2025-118',
    title: 'London Bridge Station Refurbishment — Civil & Structural Works Package',
    description:
      'Transport for London seeks a principal contractor for the comprehensive refurbishment of London Bridge Station concourse, including structural strengthening of existing platform slabs, installation of new escalator wells, MEP upgrades, and heritage façade restoration. Works must be delivered under a NEC4 Engineering and Construction Contract (Option C: Target Cost with activity schedule). CDM Regulations 2015 compliance is mandatory. The contractor must hold Constructionline Gold membership, CHAS accreditation, and demonstrate Net Zero Carbon delivery plan aligned with TfL Sustainability Strategy 2030. Night-time and weekend possession windows apply; penalties for overrun apply at £45,000 per hour.',
    buyer: 'Transport for London',
    buyerType: 'agency',
    country: 'United Kingdom',
    region: 'London',
    industry: 'construction',
    category: 'civil-works',
    procurementType: 'selective',
    budgetMin: 62000000,
    budgetMax: 78000000,
    budgetCurrency: 'GBP',
    publishedDaysAgo: 14,
    deadlineDaysFromNow: 26,
    durationDays: 540,
    status: 'open',
    url: 'https://tfl.gov.uk/procurement/tfl-civ-2025-118',
    contactEmail: 'tenders@tfl.gov.uk',
  },
  {
    reference: 'AU-NSW-INFRA-3321',
    title: 'Sydney Metro West — Station Box Construction & Tunneling Works',
    description:
      'NSW Transport Infrastructure Delivery Authority requests registrations of interest from joint ventures for the construction of two underground station boxes (28m depth), 6.2km twin-bore tunnel excavation using TBMs, and associated geotechnical works for the Sydney Metro West line. Package includes diaphragm wall construction, dewatering, ground reinforcement, and interfacing with existing rail infrastructure. Minimum JV requirements: lead partner with AUD 500M+ annual turnover, demonstrated TBM experience on projects exceeding 5km, and NSW Government Infrastructure Skills Legacy Program compliance. Indigenous participation target 4%, apprenticeship ratio 1:15, local workforce 75% within 50km.',
    buyer: 'NSW Transport Infrastructure Delivery Authority',
    buyerType: 'agency',
    country: 'Australia',
    region: 'New South Wales',
    industry: 'construction',
    category: 'civil-works',
    procurementType: 'selective',
    budgetMin: 1800000000,
    budgetMax: 2400000000,
    budgetCurrency: 'AUD',
    publishedDaysAgo: 21,
    deadlineDaysFromNow: 52,
    durationDays: 1460,
    status: 'open',
    contactEmail: 'metro.procurement@transport.nsw.gov.au',
  },
  {
    reference: 'UAE-ADQ-2025-7711',
    title: 'Abu Dhabi Stormwater Drainage Network — Phase 4 Construction',
    description:
      'Abu Dhabi Quality and Conformity Council invites contractors to construct 142 km of reinforced concrete stormwater drainage pipelines (DN1200–DN2400), 18 vortex manholes, 4 stormwater retention tanks (10,000 m³ each), and 3 pumping stations with SCADA integration. Materials must be locally certified. Bidders must demonstrate experience in GCC desert-environment utility works, ISO 14001 environmental management, and submit a HSE plan achieving TRIR < 0.3. The contract is FIDIC Red Book with a 10% performance bond and 24-month defects liability period.',
    buyer: 'Abu Dhabi Quality and Conformity Council',
    buyerType: 'government',
    country: 'United Arab Emirates',
    region: 'Abu Dhabi',
    industry: 'construction',
    category: 'utilities',
    procurementType: 'open',
    budgetMin: 95000000,
    budgetMax: 120000000,
    budgetCurrency: 'AED',
    publishedDaysAgo: 5,
    deadlineDaysFromNow: 44,
    durationDays: 720,
    status: 'open',
  },
  // ─── Consulting ─────────────────────────────────────────────────
  {
    reference: 'EU-DG-REGIO-2025-44',
    title: 'Framework Agreement — Regional Economic Development Advisory Services',
    description:
      'European Commission Directorate-General for Regional and Urban Policy seeks a multi-lot framework agreement for advisory services supporting Cohesion Policy programmes across Member States. Lots cover: (1) smart specialisation strategies, (2) green transition roadmaps, (3) digital transformation of public services, (4) financial instruments design. Each lot requires a team of minimum 8 senior experts with 15+ years regional policy experience, fluency in two EU languages, and demonstrated experience with ESI Funds 2021-2027. Framework duration 48 months with estimated call-off value of €38M. Lots may be bid individually or combined.',
    buyer: 'European Commission — DG REGIO',
    buyerType: 'government',
    country: 'Germany',
    region: 'EU',
    industry: 'consulting',
    category: 'advisory',
    procurementType: 'framework',
    budgetMin: 28000000,
    budgetMax: 38000000,
    budgetCurrency: 'EUR',
    publishedDaysAgo: 11,
    deadlineDaysFromNow: 33,
    durationDays: 1440,
    status: 'open',
    contactEmail: 'regio-procurement@ec.europa.eu',
  },
  {
    reference: 'SG-MOH-2025-CONS-09',
    title: 'Healthcare System Digital Transformation Strategy & Programme Management',
    description:
      'Singapore Ministry of Health requires a consulting consortium to develop a 5-year digital health transformation strategy and provide programme management office (PMO) services for the national Electronic Health Record refresh, AI clinical decision support rollout, and population health analytics platform. The engagement includes current-state assessment, target operating model design, vendor evaluation support, change management, and benefits realisation tracking. Bidders must include a certified TOGAF enterprise architect, PMP-certified programme manager, and demonstrate prior national-scale health IT strategy delivery. IP rights retained by MOH; staff security clearance required.',
    buyer: 'Singapore Ministry of Health',
    buyerType: 'government',
    country: 'Singapore',
    industry: 'consulting',
    category: 'strategy',
    procurementType: 'open',
    budgetMin: 8500000,
    budgetMax: 12000000,
    budgetCurrency: 'SGD',
    publishedDaysAgo: 7,
    deadlineDaysFromNow: 29,
    durationDays: 1095,
    status: 'open',
  },
  {
    reference: 'CA-TBS-2025-ORG-12',
    title: 'Organisational Design & Workforce Planning Advisory — Federal Departments',
    description:
      'Treasury Board of Canada Secretariat seeks consultants to provide organisational design, workforce planning, and change management services across 12 federal departments undergoing modernisation. Task-based SOA with estimated annual spend CAD 4.5M. Mandatory: holders of Government of Canada Security Clearance (Reliability minimum), experience with GC Workplace 2.0, and bilingual (EN/FR) delivery capability for Quebec-based engagements. Evaluation: 70% technical, 30% price. Indigenous Business Initiative — qualified Aboriginal suppliers encouraged.',
    buyer: 'Treasury Board of Canada Secretariat',
    buyerType: 'government',
    country: 'Canada',
    industry: 'consulting',
    category: 'advisory',
    procurementType: 'open',
    budgetMin: 12000000,
    budgetMax: 16000000,
    budgetCurrency: 'CAD',
    publishedDaysAgo: 18,
    deadlineDaysFromNow: 15,
    durationDays: 730,
    status: 'closing',
  },
  // ─── Defence ────────────────────────────────────────────────────
  {
    reference: 'UK-MOD-DASA-2025-228',
    title: 'Provision of Cyber Resilience Services for Defence Digital Estate',
    description:
      'UK Ministry of Defence (Defence Digital) requires a prime contractor to deliver managed cyber resilience services across the MOD digital estate, including 24/7 SOC operations, threat hunting, red-teaming, incident response retainer, and secure supply chain assurance. The service must achieve Cyber Essentials Plus, ISO 27001, and comply with FedRAMP-equivalent controls for cloud-hosted workloads. SC cleared personnel minimum; DV clearance required for nuclear-related systems. Contract includes transition from incumbent with zero downtime. Defence and Security Public Contracts Regulations 2011 apply. Single-source justification under review.',
    buyer: 'UK Ministry of Defence — Defence Digital',
    buyerType: 'defence',
    country: 'United Kingdom',
    industry: 'defence',
    category: 'cyber-security',
    procurementType: 'negotiated',
    budgetMin: 145000000,
    budgetMax: 210000000,
    budgetCurrency: 'GBP',
    publishedDaysAgo: 16,
    deadlineDaysFromNow: 41,
    durationDays: 1825,
    status: 'open',
  },
  {
    reference: 'AU-DEF-2025-ARM-77',
    title: 'Supply of Armoured Vehicle Survivability Upgrade Kits',
    description:
      'Australian Department of Defence (Capability Acquisition & Sustainment Group) requests proposals for the design, manufacture, and integration of enhanced survivability upgrade kits for the existing fleet of 110 Boxer CRVs. Kits include modular appliqué armour, active protection system integration, upgraded C-IED electronic warfare suite, and improved blast-attenuating seating. ITAR and Defence Export Controls apply; Sovereign Industrial Capability Priority — Land Combat Vehicle. Bidders must be ASDEFCON-compliant, hold DEFCON 5000 accreditation, and provide an Australian Industry Capability plan demonstrating 60% local content.',
    buyer: 'Australian Department of Defence — CASG',
    buyerType: 'defence',
    country: 'Australia',
    industry: 'defence',
    category: 'vehicle-systems',
    procurementType: 'selective',
    budgetMin: 480000000,
    budgetMax: 620000000,
    budgetCurrency: 'AUD',
    publishedDaysAgo: 23,
    deadlineDaysFromNow: 67,
    durationDays: 1095,
    status: 'open',
  },
  {
    reference: 'US-DOD-DARPA-2025-19',
    title: 'R&D — Autonomous Swarm Logistics for Distributed Operations',
    description:
      'DARPA Tactical Technology Office solicits proposals for a 42-month R&D programme developing autonomous multi-domain logistics swarms supporting contested logistics operations. Phase 1 (18 months): architecture & simulation; Phase 2 (15 months): prototype demonstration; Phase 3 (9 months): operational experiment. Mandatory: SECRET facility clearance, key personnel with prior DARPA/ONR programme delivery, and a transition partner identified. Small business set-aside consideration for Phase 1. White paper required prior to full proposal; downselect expected within 60 days of white paper submission.',
    buyer: 'DARPA — Tactical Technology Office',
    buyerType: 'defence',
    country: 'United States',
    industry: 'defence',
    category: 'rd',
    procurementType: 'open',
    budgetMin: 32000000,
    budgetMax: 48000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 12,
    deadlineDaysFromNow: 21,
    durationDays: 1260,
    status: 'closing',
  },
  {
    reference: 'DE-BAAINBw-2025-442',
    title: 'NATO-standard Secure Tactical Communications Network — Design & Build',
    description:
      'Bundesamt für Ausrüstung, Informationstechnik und Nutzung der Bundeswehr (BAAINBw) seeks a systems integrator to design, build, and support a NATO-interoperable secure tactical communications network (EDR-tier), comprising 380 nodes, mobile command posts, and crypto key management infrastructure. Requirements include STANAG compliance, EDIVEL integration, and sovereign sovereignty of cryptographic material. Bidders must be NATO SECRET cleared entities. Evaluation weighted 60% technical, 30% sovereignty, 10% price. Programme includes 10-year in-service support option.',
    buyer: 'BAAINBw',
    buyerType: 'defence',
    country: 'Germany',
    industry: 'defence',
    category: 'comms-systems',
    procurementType: 'selective',
    budgetMin: 580000000,
    budgetMax: 740000000,
    budgetCurrency: 'EUR',
    publishedDaysAgo: 27,
    deadlineDaysFromNow: 58,
    durationDays: 2190,
    status: 'open',
  },
  // ─── Technology ─────────────────────────────────────────────────
  {
    reference: 'US-GSA-2025-IT-3398',
    title: 'Cloud Migration & Modernisation — Federal Agency ERP Platform',
    description:
      'U.S. General Services Administration requests proposals to migrate a legacy on-premise ERP platform (Oracle EBS 12.1) to a cloud-native SaaS architecture across 14 sub-agencies. Scope: application assessment, data migration (8.2TB), API integration with 47 downstream systems, FedRAMP High authorised landing zone, CMMC Level 3 controls, and 24-month hypercare. Bidders must hold an active GSA IT Schedule 70 MAS contract and FedRAMP High authorisation for proposed services. Transition SLA: 99.95% availability. FISMA compliance reporting required quarterly.',
    buyer: 'U.S. General Services Administration',
    buyerType: 'government',
    country: 'United States',
    industry: 'technology',
    category: 'cloud-services',
    procurementType: 'open',
    budgetMin: 88000000,
    budgetMax: 124000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 4,
    deadlineDaysFromNow: 47,
    durationDays: 730,
    status: 'open',
  },
  {
    reference: 'JP-DIGA-2025-55',
    title: 'AI-Powered Public Service Chatbot & Citizen Analytics Platform',
    description:
      'Japan Digital Agency seeks a technology partner to design, develop, and operate a national citizen-service chatbot leveraging LLM technology, integrated with 220 municipality services. Platform must support Japanese language NLU with 96%+ accuracy, accessibility (JIS X 8341), multi-channel delivery (web, LINE, kiosk), and real-time analytics dashboard for service improvement. Data sovereignty: all processing in Japan-based data centres. Vendor must provide model governance framework, bias auditing, and human-in-the-loop escalation. 5-year contract with renewal options; Open API standards required.',
    buyer: 'Japan Digital Agency',
    buyerType: 'government',
    country: 'Japan',
    industry: 'technology',
    category: 'ai-platform',
    procurementType: 'open',
    budgetMin: 22000000,
    budgetMax: 31000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 8,
    deadlineDaysFromNow: 35,
    durationDays: 1825,
    status: 'open',
  },
  {
    reference: 'BR-GOVBR-2025-121',
    title: 'National Identity & Authentication Platform — Modernisation',
    description:
      'Brazilian Federal Government (Dataprev) requires a technology consortium to modernise the national digital identity platform (gov.br), implementing passwordless authentication (FIDO2/WebAuthn), biometric onboarding via mobile, and interoperability with ICP-Brasil PKI. Scope includes development, CI/CD, observability, and 99.99% availability SLA across 3 availability zones. Mandatory LGPD compliance, ISO 27001 certification, and demonstrated experience scaling to 100M+ users. Local content minimum 40%. Portuguese-language operations team required.',
    buyer: 'Dataprev — Brazilian Federal Government',
    buyerType: 'government',
    country: 'Brazil',
    industry: 'technology',
    category: 'identity-platform',
    procurementType: 'open',
    budgetMin: 34000000,
    budgetMax: 46000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 19,
    deadlineDaysFromNow: 24,
    durationDays: 1095,
    status: 'closing',
  },
  // ─── Mining ─────────────────────────────────────────────────────
  {
    reference: 'ZA-DMR-2025-088',
    title: 'Rehabilitation of Abandoned Mine Sites — Mpumalanga Province',
    description:
      'South African Department of Mineral Resources and Energy invites specialised mining contractors for the environmental rehabilitation of 14 abandoned coal mine sites across Mpumalanga. Scope: void filling, acid mine drainage treatment, soil remediation, revegetation with indigenous species, and 5-year aftercare monitoring. Bidders must hold MPRDA-aligned mining rehabilitation credentials, demonstrate community engagement plans aligned with Mining Charter III, and propose 30% B-BBEE ownership. NEMA compliance mandatory. Payment milestone-based with 10% retention for 24 months.',
    buyer: 'Department of Mineral Resources and Energy',
    buyerType: 'government',
    country: 'South Africa',
    region: 'Mpumalanga',
    industry: 'mining',
    category: 'rehabilitation',
    procurementType: 'open',
    budgetMin: 42000000,
    budgetMax: 56000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 13,
    deadlineDaysFromNow: 31,
    durationDays: 1095,
    status: 'open',
  },
  {
    reference: 'AU-GEOSCI-2025-17',
    title: 'Geological Survey & Critical Minerals Mapping Programme',
    description:
      'Geoscience Australia requests specialist services for a 3-year critical minerals mapping programme across the Northern Territory and Western Australia. Scope includes airborne geophysical surveys (60,000 line-km), pre-competitive drilling (12,000m), hyperspectral core logging, and integrated data product delivery via the national geological data portal. Bidders must demonstrate prior Geoscience Australia or state geological survey delivery, ISO 9001 data quality assurance, and ability to engage Traditional Owner groups for land access. Open data licence (CC-BY 4.0) on deliverables.',
    buyer: 'Geoscience Australia',
    buyerType: 'agency',
    country: 'Australia',
    region: 'Northern Territory',
    industry: 'mining',
    category: 'exploration',
    procurementType: 'open',
    budgetMin: 18000000,
    budgetMax: 24000000,
    budgetCurrency: 'AUD',
    publishedDaysAgo: 6,
    deadlineDaysFromNow: 40,
    durationDays: 1095,
    status: 'open',
  },
  {
    reference: 'CA-NRCAN-2025-66',
    title: 'Supply of Mining Equipment & Spares — Long-Term Agreement',
    description:
      'Natural Resources Canada (via Public Services and Procurement Canada) establishes a 5-year non-exclusive supply arrangement for mining equipment and spares supporting federally-funded critical mineral extraction R&D facilities. Categories include continuous miners, load-haul-dump units, ventilation fans, rock reinforcement systems, and associated OEM parts. Bidders must be authorised OEM distributors, provide Canadian service coverage, and commit to emissions-reduction roadmap (Tier 4 Final / Stage V equivalent). Indigenous Benefits Plan required; bilingual documentation (EN/FR) mandatory.',
    buyer: 'Natural Resources Canada',
    buyerType: 'government',
    country: 'Canada',
    industry: 'mining',
    category: 'equipment-supply',
    procurementType: 'framework',
    budgetMin: 24000000,
    budgetMax: 36000000,
    budgetCurrency: 'CAD',
    publishedDaysAgo: 22,
    deadlineDaysFromNow: 19,
    durationDays: 1825,
    status: 'closing',
  },
  // ─── Infrastructure ─────────────────────────────────────────────
  {
    reference: 'IN-NHAI-2025-9912',
    title: 'BOT Toll — 6-Laning of National Highway Section (92 km)',
    description:
      'National Highways Authority of India invites RfQ/RfP under Hybrid Annuity Model for 6-laning of 92 km National Highway including 4 major bridges, 2 flyovers, 7 vehicular underpasses, toll plaza, and wayside amenities. Concession period 30 years (toll-operate-transfer). Bidders must meet NHAI financial capacity criteria (net worth INR 700 crore), technical capacity of 50% of project cost in similar works, and submit an EAP-aligned ESG plan. Swiss-challenge mechanism not applicable. Land acquisition 78% complete; financial close within 180 days of LoA.',
    buyer: 'National Highways Authority of India',
    buyerType: 'agency',
    country: 'Singapore',
    region: 'South Asia',
    industry: 'infrastructure',
    category: 'highway',
    procurementType: 'open',
    budgetMin: 480000000,
    budgetMax: 560000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 3,
    deadlineDaysFromNow: 49,
    durationDays: 730,
    status: 'open',
  },
  {
    reference: 'AU-INLAND-RAIL-2025-22',
    title: 'Inland Rail — Bridge Construction Package C (Queensland)',
    description:
      'Australian Rail Track Corporation (ARTC) seeks a construction JV for 18 bridging structures on the Inland Rail alignment in Queensland, including 3 major crossings (up to 1.2km), involving bored pile foundations, precast segmental superstructures, and rail systems interface. Works must comply with AS 5100 Bridge Design and ARTC Engineering Standards. Mandatory: rail safety accreditation (RIW), demonstrated bridging JV experience >AUD 300M, and Indigenous Participation Plan meeting 5% target. Environmental approval conditions under EPBC Act apply; Koala habitat offset requirements.',
    buyer: 'Australian Rail Track Corporation',
    buyerType: 'agency',
    country: 'Australia',
    region: 'Queensland',
    industry: 'infrastructure',
    category: 'rail',
    procurementType: 'selective',
    budgetMin: 380000000,
    budgetMax: 470000000,
    budgetCurrency: 'AUD',
    publishedDaysAgo: 17,
    deadlineDaysFromNow: 56,
    durationDays: 1460,
    status: 'open',
  },
  // ─── More cross-industry ────────────────────────────────────────
  {
    reference: 'EU-CEF-2025-2034',
    title: 'Cross-Border Rail Interoperability — ERTMS Deployment Study',
    description:
      'European Climate, Infrastructure and Environment Executive Agency (CINEA) seeks consultants and engineering firms to deliver a comprehensive deployment study for European Rail Traffic Management System (ERTMS) Level 3 across 3 cross-border corridors. Deliverables include cost-benefit analysis, migration strategy, spectrum management, and stakeholder engagement across 8 national infrastructure managers. TSI compliance assessment required. Multilingual delivery (EN/FR/DE). Contract value subject to CEF Transport work programme co-funding.',
    buyer: 'CINEA — European Commission',
    buyerType: 'government',
    country: 'Germany',
    region: 'EU',
    industry: 'consulting',
    category: 'engineering',
    procurementType: 'open',
    budgetMin: 6800000,
    budgetMax: 9200000,
    budgetCurrency: 'EUR',
    publishedDaysAgo: 2,
    deadlineDaysFromNow: 27,
    durationDays: 540,
    status: 'open',
  },
  {
    reference: 'UK-NHS-2025-DIGITAL-44',
    title: 'Federated Data Platform — NHS Trusts Deployment & Support',
    description:
      'NHS England requires a supplier to deploy and support the Federated Data Platform across 42 Integrated Care Systems, enabling secure cross-trust analytics, population health management, and operational reporting. Scope includes platform configuration, data migration from 200+ source systems, DSPT compliance, interoperability via FHIR R4, and a 5-year managed service. Suppliers must be on G-Cloud 14 framework, hold DSPT Level 2, and demonstrate UK Sovereign data residency. Open-source first principle; exit strategy mandatory.',
    buyer: 'NHS England',
    buyerType: 'agency',
    country: 'United Kingdom',
    industry: 'technology',
    category: 'data-platform',
    procurementType: 'framework',
    budgetMin: 320000000,
    budgetMax: 420000000,
    budgetCurrency: 'GBP',
    publishedDaysAgo: 1,
    deadlineDaysFromNow: 36,
    durationDays: 1825,
    status: 'open',
  },
  {
    reference: 'US-DOE-2025-GRID-08',
    title: 'Grid Modernisation — Advanced Conductors & Storage Pilot',
    description:
      'U.S. Department of Energy Office of Electricity requests proposals for a pilot deployment of advanced grid conductors (carbon-core) and 4-hour utility-scale battery storage (200MWh) at 3 substations. Includes engineering, procurement, construction, SCADA integration, and 24-month performance validation. Bidders must demonstrate prior utility-scale BESS deployment, IEEE 1547 compliance, and Buy America compliance for steel and iron components. Cost-share 20% minimum. DE-FOA-0003300. Performance bonds 100% required.',
    buyer: 'U.S. Department of Energy',
    buyerType: 'government',
    country: 'United States',
    industry: 'infrastructure',
    category: 'energy',
    procurementType: 'open',
    budgetMin: 92000000,
    budgetMax: 118000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 15,
    deadlineDaysFromNow: 43,
    durationDays: 910,
    status: 'open',
  },
  {
    reference: 'AE-EMAAR-2025-FAC-11',
    title: 'Smart Facility Management Platform — IoT & Predictive Maintenance',
    description:
      'Dubai Municipality seeks a technology provider to implement a city-wide smart facility management platform integrating IoT sensors, BIM digital twins, predictive maintenance ML models, and a unified command dashboard across 380 public buildings. Mandatory: integration with Dubai Now app, compliance with Dubai Data Law, Arabic/English UI, and local managed services team. Vendor must provide 5-year TCO model and SLA penalties capped at 15% of annual fee. Blockchain-based asset registry preferred.',
    buyer: 'Dubai Municipality',
    buyerType: 'municipal',
    country: 'United Arab Emirates',
    industry: 'technology',
    category: 'iot-platform',
    procurementType: 'open',
    budgetMin: 16000000,
    budgetMax: 22000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 10,
    deadlineDaysFromNow: 22,
    durationDays: 1825,
    status: 'closing',
  },
  {
    reference: 'AU-DEF-2025-SUP-555',
    title: 'Sustainment Services — Royal Australian Navy Fleet Support',
    description:
      'Defence has issued a restricted tender for the sustainment of Royal Australian Navy surface fleet including Anzac-class frigates, with engineering, logistics, dockside maintenance, and configuration management. Award under SEA 1900 Phase 1. Bidders must be Commonwealth accredited defence exporters, hold NAVWAR compliance, and propose a Sovereign Industrial Capability plan addressing 70% local sustainment. 7-year initial term with 3+3 year options. CASG Commercialigthm applies.',
    buyer: 'Australian Department of Defence — CASG',
    buyerType: 'defence',
    country: 'Australia',
    industry: 'defence',
    category: 'sustainment',
    procurementType: 'selective',
    budgetMin: 1200000000,
    budgetMax: 1500000000,
    budgetCurrency: 'AUD',
    publishedDaysAgo: 25,
    deadlineDaysFromNow: 11,
    durationDays: 2555,
    status: 'closing',
  },
  {
    reference: 'CA-PWGSC-2025-BUILD-77',
    title: 'Federal Building Decarbonisation — Deep Retrofit Programme',
    description:
      'Public Services and Procurement Canada issues a request for qualifications for a deep energy retrofit programme across 64 federal buildings, targeting 50% GHG reduction. Works include envelope upgrades, electrification of heating (geoexchange), on-site solar, and BMS modernisation. Energy Performance Contracting model with guaranteed savings. Bidders must be ESCO-qualified, demonstrate LEED Gold project delivery, and propose a 20-year M&V plan. Greening Government Strategy alignment mandatory. Indigenous Benefits Plan weighted at 10%.',
    buyer: 'Public Services and Procurement Canada',
    buyerType: 'government',
    country: 'Canada',
    industry: 'construction',
    category: 'retrofit',
    procurementType: 'open',
    budgetMin: 180000000,
    budgetMax: 240000000,
    budgetCurrency: 'CAD',
    publishedDaysAgo: 20,
    deadlineDaysFromNow: 33,
    durationDays: 1825,
    status: 'open',
  },
  {
    reference: 'DE-BMVI-2025-SMART-09',
    title: 'Smart Port Logistics — Hamburg Autonomous Container Movement',
    description:
      'Hamburg Port Authority (under BMVI funding) seeks a consortium to design and deploy an autonomous container movement system across 4 terminals, including AGV fleet (60 units), 5G private network, terminal operating system integration, and AI orchestration. Bidders must demonstrate prior port automation delivery, ISO 21434 cybersecurity for automotive, and a worker transition plan. Open APIs and interoperability with neighbouring Baltic ports required. Co-funding 30% from consortium.',
    buyer: 'Hamburg Port Authority',
    buyerType: 'agency',
    country: 'Germany',
    industry: 'infrastructure',
    category: 'port-automation',
    procurementType: 'open',
    budgetMin: 74000000,
    budgetMax: 96000000,
    budgetCurrency: 'EUR',
    publishedDaysAgo: 28,
    deadlineDaysFromNow: 8,
    durationDays: 1095,
    status: 'closing',
  },
  {
    reference: 'BR-ANP-2025-SEISMIC-03',
    title: 'Pre-Salt Basin 3D Seismic Acquisition & Processing',
    description:
      'Brazilian National Agency of Petroleum (ANP) requires specialist geophysical services for 3D seismic acquisition (8,400 km²) and pre-stack depth migration processing over the pre-salt Santos Basin. Vessel must be equipped with marine source controllers meeting IBAMA environmental noise standards;数据处理 in-country with 40% local content. Pre-competitive data delivered to ANP under open-access 5-year post-completion. Bidders must demonstrate prior ultra-deepwater seismic acquisition >5,000 km².',
    buyer: 'Brazilian National Agency of Petroleum',
    buyerType: 'agency',
    country: 'Brazil',
    industry: 'mining',
    category: 'geophysical',
    procurementType: 'open',
    budgetMin: 58000000,
    budgetMax: 74000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 9,
    deadlineDaysFromNow: 50,
    durationDays: 730,
    status: 'open',
  },
  {
    reference: 'UK-CROWN-2025-PROC-66',
    title: 'Crown Commercial Service — G-Cloud 15 Replacement Framework',
    description:
      'Crown Commercial Service invites applications for the next generation G-Cloud framework (Lots 1: Cloud Hosting, 2: Cloud Software, 3: Cloud Support). Estimated framework value £2.4bn over 4 years. Suppliers must demonstrate UK public sector cloud delivery, Cyber Essentials Plus, ISO 27001, and live pricing catalogue. Open to SMEs (60% of suppliers on prior frameworks were SMEs). Lot 4 (training) removed; new Lot for AI as a Service under consultation. Apply via supplier self-service portal.',
    buyer: 'Crown Commercial Service',
    buyerType: 'government',
    country: 'United Kingdom',
    industry: 'technology',
    category: 'framework',
    procurementType: 'framework',
    budgetMin: 1800000000,
    budgetMax: 2400000000,
    budgetCurrency: 'GBP',
    publishedDaysAgo: 30,
    deadlineDaysFromNow: 14,
    durationDays: 1460,
    status: 'closing',
  },
  {
    reference: 'SG-LTA-2025-RAIL-21',
    title: 'Cross Island Line — Tunnelling & Civil Works Package D',
    description:
      'Land Transport Authority (Singapore) invites pre-qualification from experienced contractors for twin-bore tunnelling (9.4km) and 3 underground station civil structures under the Cross Island Line Phase 2. Earth Pressure Balance TBM required through mixed geology (Jurong Formation + Bukit Timah Granite). Bidders must demonstrate prior MRT tunnelling delivery in Singapore or comparable dense urban environment, S$200M+ bonded capacity, and LTA WSH compliance. Local SME sub-contracting target 30%. 7-year defects liability.',
    buyer: 'Land Transport Authority',
    buyerType: 'agency',
    country: 'Singapore',
    industry: 'infrastructure',
    category: 'rail',
    procurementType: 'selective',
    budgetMin: 680000000,
    budgetMax: 820000000,
    budgetCurrency: 'SGD',
    publishedDaysAgo: 24,
    deadlineDaysFromNow: 61,
    durationDays: 1825,
    status: 'open',
  },
  {
    reference: 'US-AID-2025-WASH-44',
    title: 'East Africa Regional Water & Sanitation Infrastructure Programme',
    description:
      'USAID seeks an implementing partner to deliver a 5-year WASH infrastructure programme across Kenya, Uganda, and Tanzania. Scope: 12,000 household connections, 84 rural piped systems, 9 faecal sludge treatment plants, and utility capacity building. Bidders must demonstrate prior USAID or comparable donor WASH delivery >$25M, local presence in 2 of 3 countries, and a Gender Equality & Social Inclusion plan. Cost-share 10%. Fixed Amount Reimbursement Agreement (FARA) instrument. PII data protection per USAID ADS 201.',
    buyer: 'USAID — Bureau for Africa',
    buyerType: 'government',
    country: 'United States',
    region: 'East Africa',
    industry: 'infrastructure',
    category: 'wash',
    procurementType: 'open',
    budgetMin: 64000000,
    budgetMax: 82000000,
    budgetCurrency: 'USD',
    publishedDaysAgo: 12,
    deadlineDaysFromNow: 28,
    durationDays: 1825,
    status: 'open',
  },
]

const USERS = [
  { name: 'Eleanor Whitfield', email: 'eleanor.whitfield@buildcore.com', role: 'owner', jobTitle: 'Founder & CEO', avatarColor: '#0d9488' },
  { name: 'Marcus Chen', email: 'marcus.chen@buildcore.com', role: 'admin', jobTitle: 'Head of Bid Management', avatarColor: '#7c3aed' },
  { name: 'Priya Nair', email: 'priya.nair@buildcore.com', role: 'manager', jobTitle: 'Capture Manager', avatarColor: '#d97706' },
  { name: 'David Okafor', email: 'david.okafor@buildcore.com', role: 'analyst', jobTitle: 'Tender Analyst', avatarColor: '#0891b2' },
  { name: 'Sofia Almeida', email: 'sofia.almeida@buildcore.com', role: 'analyst', jobTitle: 'Market Intelligence Analyst', avatarColor: '#be185d' },
  { name: 'Kenji Tanaka', email: 'kenji.tanaka@buildcore.com', role: 'manager', jobTitle: 'APAC Regional Lead', avatarColor: '#15803d' },
  { name: 'Hannah Becker', email: 'hannah.becker@buildcore.com', role: 'analyst', jobTitle: 'Compliance & Risk Analyst', avatarColor: '#b45309' },
  { name: 'Liam OConnor', email: 'liam.oconnor@buildcore.com', role: 'viewer', jobTitle: 'Executive Observer', avatarColor: '#475569' },
]

const TEAMS = [
  { name: 'Civil & Infrastructure', description: 'Highway, rail, and large civil works pursuits', color: '#0d9488' },
  { name: 'Defence & Cyber', description: 'Defence procurement and secure systems', color: '#7c3aed' },
  { name: 'Digital & Cloud', description: 'Government IT, cloud, and AI platforms', color: '#0891b2' },
  { name: 'Mining & Energy', description: 'Resources, mining services and energy transition', color: '#d97706' },
]

const COMPETITORS = [
  { name: 'Bechtel Infrastructure Group', website: 'bechtel.com', industry: 'construction', hqCountry: 'United States', size: 'enterprise', winRate: 28.4, activeBids: 14, totalWins: 312, threatLevel: 'high', notes: 'Global EPC giant with strong US/UK pipeline. Competes on mega-projects >$500M.' },
  { name: 'Jacobs Solutions', website: 'jacobs.com', industry: 'consulting', hqCountry: 'United States', size: 'enterprise', winRate: 22.1, activeBids: 9, totalWins: 187, threatLevel: 'high', notes: 'Strong consulting + engineering blend. Active on federal frameworks.' },
  { name: 'Leidos Defence', website: 'leidos.com', industry: 'defence', hqCountry: 'United States', size: 'enterprise', winRate: 31.7, activeBids: 11, totalWins: 244, threatLevel: 'high', notes: 'Dominant on DoD IT & cyber services. Watch for teaming arrangements.' },
  { name: 'BHP Engineering Services', website: 'bhp.com', industry: 'mining', hqCountry: 'Australia', size: 'enterprise', winRate: 18.9, activeBids: 6, totalWins: 98, threatLevel: 'medium', notes: 'Captive mining EPC; expanding into government critical minerals.' },
  { name: 'Accenture Federal', website: 'accenture.com', industry: 'technology', hqCountry: 'United States', size: 'enterprise', winRate: 26.3, activeBids: 12, totalWins: 203, threatLevel: 'high', notes: 'Aggressive on cloud modernisation and AI citizen-service platforms.' },
  { name: 'Downer Group', website: 'downergroup.com', industry: 'construction', hqCountry: 'Australia', size: 'large', winRate: 19.5, activeBids: 8, totalWins: 142, threatLevel: 'medium', notes: 'Strong ANZ transport & utilities presence.' },
]

const COMPETITOR_ACTIVITIES = [
  { competitorIdx: 0, type: 'bid_won', description: 'Won $312M Texas DOT interchange contract', value: 312000000, daysAgo: 4 },
  { competitorIdx: 0, type: 'leadership_change', description: 'Appointed new VP of Civil Infrastructure', daysAgo: 11 },
  { competitorIdx: 1, type: 'new_contract', description: 'Awarded place on £180M UK DfT advisory framework', value: 180000000, daysAgo: 7 },
  { competitorIdx: 2, type: 'bid_won', description: 'Secured $145M MOD cyber resilience extension', value: 145000000, daysAgo: 2 },
  { competitorIdx: 2, type: 'partnership', description: 'Teaming agreement with Microsoft Federal for Azure Government', daysAgo: 15 },
  { competitorIdx: 3, type: 'expansion', description: 'Opened new critical minerals engineering hub in Perth', daysAgo: 19 },
  { competitorIdx: 4, type: 'bid_won', description: 'Won £320M NHS Federated Data Platform (subject to challenge)', value: 320000000, daysAgo: 1 },
  { competitorIdx: 4, type: 'bid_lost', description: 'Lost Japan Digital Agency chatbot to local consortium', daysAgo: 9 },
  { competitorIdx: 5, type: 'new_contract', description: 'Awarded AUD 88M Sydney Water facilities maintenance', value: 58000000, daysAgo: 13 },
  { competitorIdx: 5, type: 'leadership_change', description: 'CFO resignation announced; replacement pending', daysAgo: 21 },
]

const AUDIT_ACTIONS = [
  { action: 'login', resource: 'auth', details: 'Signed in via SSO' },
  { action: 'view_tender', resource: 'tender', details: 'Viewed tender DOT-2025-4471' },
  { action: 'create_search', resource: 'saved_search', details: 'Created saved search "Australian civil works >$50M"' },
  { action: 'update_pipeline', resource: 'pipeline', details: 'Moved "Sydney Metro West" to Pursuing stage' },
  { action: 'ai_summarize', resource: 'tender', details: 'Generated AI summary for AU-DEF-2025-ARM-77' },
  { action: 'generate_report', resource: 'report', details: 'Generated weekly market intelligence report' },
  { action: 'ai_summarize', resource: 'tender', details: 'Risk assessment run for UK-MOD-DASA-2025-228' },
  { action: 'update_pipeline', resource: 'pipeline', details: 'Assigned Inland Rail bridge package to Civil team' },
  { action: 'create_search', resource: 'saved_search', details: 'Created alert for "defence cyber 2025"' },
  { action: 'view_tender', resource: 'tender', details: 'Viewed 12 tenders in Defence & Cyber category' },
  { action: 'invite_user', resource: 'team', details: 'Invited hannah.becker@buildcore.com to Compliance team' },
  { action: 'generate_report', resource: 'report', details: 'Generated competitor brief for Leidos Defence' },
]

async function main() {
  console.log('🌱 Seeding Tender Intelligence database...')

  await db.auditLog.deleteMany()
  await db.alert.deleteMany()
  await db.report.deleteMany()
  await db.savedSearch.deleteMany()
  await db.competitorActivity.deleteMany()
  await db.competitor.deleteMany()
  await db.pipelineEntry.deleteMany()
  await db.tender.deleteMany()
  await db.collectionSource.deleteMany()
  await db.teamMember.deleteMany()
  await db.team.deleteMany()
  await db.user.deleteMany()
  await db.tenant.deleteMany()

  const tenant = await db.tenant.create({
    data: {
      name: 'BuildCore Group',
      slug: 'buildcore',
      plan: 'enterprise',
      industry: 'construction',
      seatLimit: 50,
      status: 'active',
    },
  })

  const userRecords = []
  for (const u of USERS) {
    userRecords.push(
      await db.user.create({
        data: {
          tenantId: tenant.id,
          email: u.email,
          name: u.name,
          role: u.role,
          jobTitle: u.jobTitle,
          avatarColor: u.avatarColor,
          lastActive: new Date(Date.now() - Math.floor(Math.random() * 5) * 86400000),
        },
      })
    )
  }

  const teamRecords = []
  for (let i = 0; i < TEAMS.length; i++) {
    const t = TEAMS[i]
    const team = await db.team.create({
      data: {
        tenantId: tenant.id,
        name: t.name,
        description: t.description,
        color: t.color,
      },
    })
    teamRecords.push(team)
    const lead = userRecords[i % userRecords.length]
    const member = userRecords[(i + 3) % userRecords.length]
    await db.teamMember.create({ data: { teamId: team.id, userId: lead.id, role: 'lead' } })
    await db.teamMember.create({ data: { teamId: team.id, userId: member.id, role: 'member' } })
  }

  const sources = [
    { name: 'SAM.gov', url: 'https://sam.gov', type: 'portal', region: 'North America', country: 'United States', itemsFound: 1284 },
    { name: 'Contracts Finder (UK)', url: 'https://www.gov.uk/contracts-finder', type: 'portal', region: 'Europe', country: 'United Kingdom', itemsFound: 642 },
    { name: 'AusTender', url: 'https://www.tenders.gov.au', type: 'portal', region: 'Oceania', country: 'Australia', itemsFound: 518 },
    { name: 'TED (EU)', url: 'https://ted.europa.eu', type: 'portal', region: 'Europe', country: 'Germany', itemsFound: 2156 },
    { name: 'UNGM', url: 'https://www.ungm.org', type: 'portal', region: 'global', country: null, itemsFound: 387 },
    { name: 'Global Infrastructure Hub', url: 'https://www.gihub.org', type: 'infrastructure', region: 'global', country: null, itemsFound: 94 },
  ]
  const sourceRecords = []
  for (const s of sources) {
    sourceRecords.push(
      await db.collectionSource.create({
        data: {
          tenantId: tenant.id,
          name: s.name,
          url: s.url,
          type: s.type,
          region: s.region,
          country: s.country,
          status: 'active',
          scanFreqHrs: 24,
          lastScanAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 3600000),
          itemsFound: s.itemsFound,
        },
      })
    )
  }

  const tenderRecords = []
  for (const t of TENDERS) {
    const publishedAt = new Date(Date.now() - t.publishedDaysAgo * 86400000)
    const deadlineAt = new Date(Date.now() + t.deadlineDaysFromNow * 86400000)
    const descLen = t.description.length
    const budgetMid = (t.budgetMin + t.budgetMax) / 2
    const riskScore = Math.min(88, 38 + Math.floor(descLen / 220) + (t.procurementType === 'negotiated' ? 12 : 0))
    const oppScore = Math.max(20, 88 - Math.floor(descLen / 280) - (t.status === 'closing' ? 6 : 0))
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 50 ? 'medium' : 'low'
    const sourceIdx = sourceRecords.length ? (t.country === 'United States' ? 0 : t.country === 'United Kingdom' ? 1 : t.country === 'Australia' ? 2 : t.country === 'Germany' ? 3 : 4) : -1

    const tender = await db.tender.create({
      data: {
        tenantId: tenant.id,
        sourceId: sourceIdx >= 0 ? sourceRecords[sourceIdx].id : null,
        reference: t.reference,
        title: t.title,
        description: t.description,
        buyer: t.buyer,
        buyerType: t.buyerType,
        country: t.country,
        region: t.region ?? null,
        industry: t.industry,
        category: t.category,
        procurementType: t.procurementType,
        budgetMin: t.budgetMin,
        budgetMax: t.budgetMax,
        budgetCurrency: t.budgetCurrency,
        publishedAt,
        deadlineAt,
        durationDays: t.durationDays,
        status: t.status,
        url: t.url ?? `https://tenders.example/${t.reference}`,
        contactEmail: t.contactEmail ?? `procurement@${t.buyer.split(' ')[0].toLowerCase()}.gov`,
        summary: `${t.title} — issued by ${t.buyer} in ${t.country} under ${t.procurementType} procurement. Budget ${t.budgetCurrency} ${t.budgetMin.toLocaleString()}–${t.budgetMax.toLocaleString()}, closing in ${t.deadlineDaysFromNow} days. Scope covers ${t.category} requirements with a ${t.durationDays}-day delivery window.`,
        riskScore,
        riskLevel,
        riskNotes: `${riskLevel === 'high' ? 'Elevated risk: complex multi-stakeholder scope, tight timeline, and stringent compliance requirements. Verify bond capacity and security clearances early.' : riskLevel === 'medium' ? 'Moderate risk driven by specification complexity and competitive field. Confirm team capacity and local content thresholds.' : 'Lower risk profile; standard procurement with reasonable timeline.'}`,
        opportunityScore: oppScore,
        winProbability: Math.max(12, oppScore - 8),
        opportunityNotes: `Win probability ${Math.max(12, oppScore - 8)}% based on budget size (~${t.budgetCurrency} ${(budgetMid / 1e6).toFixed(1)}M), ${t.industry} alignment, and ${t.deadlineDaysFromNow}-day response window. ${oppScore > 70 ? 'Strong fit — prioritise capture.' : oppScore > 50 ? 'Viable opportunity; assess pursuit cost vs. ROI.' : 'Marginal fit; monitor for partner-teaming option.'}`,
        industries: JSON.stringify([t.industry, t.category]),
        keyRequirements: JSON.stringify(extractRequirements(t.description)),
        aiProcessedAt: new Date(),
      },
    })
    tenderRecords.push(tender)
  }

  const stages = ['identified', 'qualifying', 'pursuing', 'bidding', 'won', 'lost']
  const priorities = ['low', 'medium', 'high', 'critical']
  let pipelineCount = 0
  for (let i = 0; i < tenderRecords.length; i++) {
    if (i % 5 === 4) continue
    const tender = tenderRecords[i]
    const stage = stages[i % stages.length]
    const team = teamRecords[i % teamRecords.length]
    const owner = userRecords[(i + 1) % userRecords.length]
    const budgetMid = (tender.budgetMin! + tender.budgetMax!) / 2
    await db.pipelineEntry.create({
      data: {
        tenantId: tenant.id,
        tenderId: tender.id,
        teamId: team.id,
        ownerId: owner.id,
        stage,
        priority: priorities[i % priorities.length],
        pursuitValue: budgetMid * (0.4 + (i % 5) * 0.1),
        notes: stage === 'bidding' ? 'Full bid team mobilised; pricing review scheduled.' : stage === 'won' ? 'Contract awarded; mobilisation underway.' : stage === 'qualifying' ? 'Initial go/no-go review pending.' : 'Active capture — schedule bid strategy session.',
        dueDate: new Date(Date.now() + (tender.deadlineAt!.getTime() - Date.now()) * 0.6),
      },
    })
    pipelineCount++
  }

  for (let i = 0; i < COMPETITORS.length; i++) {
    const c = COMPETITORS[i]
    const competitor = await db.competitor.create({
      data: {
        tenantId: tenant.id,
        name: c.name,
        website: c.website,
        industry: c.industry,
        hqCountry: c.hqCountry,
        size: c.size,
        winRate: c.winRate,
        activeBids: c.activeBids,
        totalWins: c.totalWins,
        threatLevel: c.threatLevel,
        notes: c.notes,
      },
    })
    for (const a of COMPETITOR_ACTIVITIES.filter((x) => x.competitorIdx === i)) {
      await db.competitorActivity.create({
        data: {
          competitorId: competitor.id,
          type: a.type,
          description: a.description,
          value: a.value ?? null,
          date: new Date(Date.now() - a.daysAgo * 86400000),
        },
      })
    }
  }

  const savedSearches = [
    { name: 'Australian civil works >$50M', query: 'civil construction Australia large infrastructure', filters: { industry: 'construction', country: 'Australia', budgetMin: 50000000 } },
    { name: 'Defence cyber 2025', query: 'defence cyber security resilience', filters: { industry: 'defence', category: 'cyber-security' } },
    { name: 'Cloud migration federal', query: 'cloud migration modernization federal government', filters: { industry: 'technology', country: 'United States' } },
    { name: 'Mining rehabilitation ANZ', query: 'mine rehabilitation environmental remediation', filters: { industry: 'mining' } },
    { name: 'Rail & tunnelling mega-projects', query: 'rail tunnel boring metro underground', filters: { industry: 'infrastructure', budgetMin: 100000000 } },
    { name: 'Closing within 30 days', query: 'urgent closing soon deadline', filters: { status: 'closing' } },
  ]
  for (let i = 0; i < savedSearches.length; i++) {
    const s = savedSearches[i]
    await db.savedSearch.create({
      data: {
        tenantId: tenant.id,
        name: s.name,
        query: s.query,
        filtersJson: JSON.stringify(s.filters),
        notifyEmail: true,
        lastRunAt: new Date(Date.now() - i * 7200000),
        resultCount: 4 + Math.floor(Math.random() * 18),
      },
    })
  }

  const alertTemplates = [
    { type: 'new_tender', severity: 'info', title: 'New tender matches "Defence cyber 2025"', message: 'UK-MOD-DASA-2025-228 published 2 hours ago' },
    { type: 'deadline_reminder', severity: 'warning', title: 'Deadline approaching in 8 days', message: 'DE-BMVI-2025-SMART-09 closes on ' + new Date(Date.now() + 8 * 86400000).toDateString() },
    { type: 'risk_change', severity: 'critical', title: 'Risk level escalated to High', message: 'AU-DEF-2025-SUP-555 risk score increased to 78' },
    { type: 'score_change', severity: 'success', title: 'Opportunity score improved', message: 'US-GSA-2025-IT-3398 now scores 82 (up from 71)' },
    { type: 'competitor', severity: 'warning', title: 'Competitor activity detected', message: 'Accenture Federal won £320M NHS Federated Data Platform' },
    { type: 'saved_search', severity: 'info', title: 'Saved search returned 12 new results', message: '"Rail & tunnelling mega-projects" found new opportunities' },
    { type: 'new_tender', severity: 'info', title: '3 new tenders in Australia', message: 'Matching your APAC regional watch list' },
    { type: 'deadline_reminder', severity: 'critical', title: 'Deadline in 11 days', message: 'AU-DEF-2025-SUP-555 (AUD 1.2B Navy sustainment) closes soon' },
  ]
  for (let i = 0; i < alertTemplates.length; i++) {
    const a = alertTemplates[i]
    const tender = tenderRecords[i % tenderRecords.length]
    await db.alert.create({
      data: {
        tenantId: tenant.id,
        tenderId: tender.id,
        userId: userRecords[i % userRecords.length].id,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        read: i >= 5,
      },
    })
  }

  const reportTypes = [
    { type: 'weekly', title: 'Weekly Tender Digest — Week 47', period: 7 },
    { type: 'market_intelligence', title: 'Market Intelligence — APAC Infrastructure Q4', period: 90 },
    { type: 'competitor_brief', title: 'Competitor Brief — Leidos Defence', period: 30 },
    { type: 'pipeline_review', title: 'Pipeline Review — Q4 Pursuit Health', period: 30 },
    { type: 'weekly', title: 'Weekly Tender Digest — Week 46', period: 7 },
  ]
  for (let i = 0; i < reportTypes.length; i++) {
    const r = reportTypes[i]
    const periodEnd = new Date(Date.now() - i * 7 * 86400000)
    const periodStart = new Date(periodEnd.getTime() - r.period * 86400000)
    const contentJson = JSON.stringify({
      highlights: [
        `${tenderRecords.length} tenders tracked this period`,
        `$${tenderRecords.reduce((s, t) => s + (t.budgetMax ?? 0), 0).toLocaleString()} total addressable budget`,
        `Top buyer: ${tenderRecords[0].buyer}`,
      ],
      recommendations: [
        'Prioritise opportunities with win probability above 60%',
        'Allocate capture resources to top 3 buyers by volume',
        'Monitor deadline clustering to avoid bid-team overload',
      ],
      sections: [
        { heading: 'Pipeline Health', body: `Active pipeline of ${tenderRecords.length} opportunities across ${INDUSTRIES.length} industries.` },
        { heading: 'Risk Posture', body: `${tenderRecords.filter((t) => t.riskLevel === 'high').length} high-risk tenders require senior review.` },
      ],
    })
    await db.report.create({
      data: {
        tenantId: tenant.id,
        title: r.title,
        type: r.type,
        periodStart,
        periodEnd,
        summary: `${r.title}. Over the past ${r.period} days, ${tenderRecords.length} tenders were tracked across ${INDUSTRIES.length} industries. The market remains active with significant opportunities in construction, defence, and technology sectors.`,
        contentJson,
        status: 'generated',
      },
    })
  }

  for (let i = 0; i < AUDIT_ACTIONS.length; i++) {
    const a = AUDIT_ACTIONS[i]
    await db.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: userRecords[i % userRecords.length].id,
        action: a.action,
        resource: a.resource,
        resourceId: i < tenderRecords.length ? tenderRecords[i].id : null,
        details: a.details,
        ipAddress: '203.0.113.' + (10 + i),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) TenderIntelligence/1.0',
      },
    })
  }

  console.log(`✅ Seed complete:
   - 1 tenant (${tenant.name})
   - ${userRecords.length} users
   - ${teamRecords.length} teams
   - ${sourceRecords.length} collection sources
   - ${tenderRecords.length} tenders (AI-enriched)
   - ${pipelineCount} pipeline entries
   - ${COMPETITORS.length} competitors with activities
   - ${savedSearches.length} saved searches
   - ${alertTemplates.length} alerts
   - ${reportTypes.length} reports
   - ${AUDIT_ACTIONS.length} audit logs`)
}

function extractRequirements(desc: string): string[] {
  const reqs: string[] = []
  if (/ISO\s*9001/i.test(desc)) reqs.push('ISO 9001 certification')
  if (/ISO\s*27001/i.test(desc)) reqs.push('ISO 27001 certification')
  if (/ISO\s*14001/i.test(desc)) reqs.push('ISO 14001 certification')
  if (/FedRAMP/i.test(desc)) reqs.push('FedRAMP authorisation')
  if (/Cyber Essentials/i.test(desc)) reqs.push('Cyber Essentials Plus')
  if (/clearance/i.test(desc)) reqs.push('Security clearance')
  if (/bond/i.test(desc)) reqs.push('Performance bond')
  if (/local content|local workforce|Indigenous|B-BBEE|Aboriginal/i.test(desc)) reqs.push('Local content plan')
  if (/ESG|Net Zero|sustainability|GHG/i.test(desc)) reqs.push('Sustainability plan')
  if (/apprentice|Sovereign|local/i.test(desc)) reqs.push('Workforce development plan')
  if (reqs.length === 0) reqs.push('Compliance documentation', 'Past performance', 'Financial capacity')
  return reqs.slice(0, 6)
}

main()
  .then(async () => {
    await db.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await db.$disconnect()
    process.exit(1)
  })
