# DPDR Symptom Management Web

This repository is currently being planned as a **real-world research platform for depersonalization-derealization disorder (DPDR)**, with patient self-monitoring as the first core use case.

## Current planning direction

### Primary purpose of v1
- Support **patient self-monitoring** for DPDR.
- Serve **real-world research** needs in the initial phase.
- Collect repeated patient-reported data for later clinical/research analysis.

### Core assessment focus
- **Cambridge Depersonalization Scale (CDS)** as a baseline instrument.
- **State version of the CDS** for repeated/high-frequency symptom monitoring.
- State monitoring strategy: **scheduled check-ins + additional entries during symptom exacerbations/episodes**.

### Main roles
#### Patient side
V1 must include:
- Registration and login
- Baseline questionnaire / baseline scale completion
- State scale completion
- Historical trend visualization

#### Doctor side
V1 doctor functions are expected to go beyond passive viewing and include research/clinical management functions.
Current direction includes:
- Reviewing patient-entered treatment data
- Confirming whether treatment records are consistent with real clinical treatment
- Correcting treatment records when needed while preserving the audit trail
- Managing patients within research projects

#### Admin side
- Platform-style admin functions are recognized as necessary, but can be postponed to a later stage.

## Data domains clarified so far

### 1) Intervention / treatment recording
Both of the following should be recorded:
- Patient self-coping behaviors
- Formal treatment measures

Current priority:
- **Formal treatment measures are the key priority** in V1.

### 2) Formal treatment recording logic
Current decisions:
- Treatment is entered **primarily by patients**.
- Patients can **edit** their treatment records.
- The system must **preserve edit history**.
- Doctors can **review/identify/confirm** records.
- Doctor confirmation should mean: **the record is consistent with actual clinical treatment**.
- If patient-entered treatment data conflicts with clinical reality, doctors can **directly correct it**, but:
  - the **original patient-entered content must remain traceable**
  - the **full audit trail must be preserved**

### 3) Medication recording requirements
Medication is the most important formal treatment element to capture in detail.

V1 medication record must include:
- Medication name
- Single dose
- Frequency / administration instructions
- Adverse effects
- Other free-text notes that the patient wants to record

Adverse effect design:
- Preset common adverse-effect options
- Additional free-text supplement
- Default state: **no adverse effects**

Update logic:
- Medication information should persist as current treatment information
- Patients update it when treatment changes
- During state-scale completion, patients may also **confirm current medication status**

### 4) Treatment audit trail requirements
When medication/treatment entries are modified, the system should preserve:
- Previous content
- Updated content
- Editor identity
- Edit timestamp
- Whether the doctor has confirmed it

## Emotion / related symptom tracking
Emotion tracking should exist as a **module separate from the DPDR state scale**, rather than being obligatorily attached to every single state entry.

### Current priority dimensions
The first three priority dimensions identified are:
- Anxiety
- Depression
- Sleep

### Planned instruments so far
- Anxiety: **SAS**
- Depression: **SDS**
- Sleep: **PSQI**

### Frequency logic
- The frequency of SAS / SDS / PSQI should be **configured by doctors according to the research protocol**.
- In V1, this configuration should be done **at the research-project level**, not individualized per patient.
- Doctors should be able to place patients into different research projects.

## Cross-project participation, visibility, and authorization rules

### 1) Patient-to-project relationship
- A single patient may belong to **multiple research projects at the same time**.
- Patient-to-project assignment should be performed primarily by **research staff**, not mainly by patients themselves.

### 2) Data ownership / scope model
Each data domain should support two possible scopes:
- **Global/shared**
- **Project-private**

This scope model must support **two layers of configuration**:
- **Data-type-level default rule**
- **Project-level override rule**

This means a data type may have a default ownership scope, while a specific project can override that default when needed.

### 3) Saving logic for project-private data
If a data type is configured as **project-private**:
- when the user is already operating inside a specific project context, the system should **automatically assign that project**
- when there is no current project context, the user must **manually choose the project** before saving

### 4) Visibility of global/shared data
Global/shared data must **not** be exposed with a single uniform rule.
Visibility should be **role-based**.

Current minimum role set:
- Platform administrator
- Project principal investigator / project owner
- Clinician
- Research assistant
- Patient

### 5) Research assistant permissions
Research assistants should be allowed to:
- assign/manage patient participation in research projects
- view research-relevant data within their permissions
- enter / proxy-enter certain types of data

But research assistants should **not** be allowed to replace a clinician in making **clinical confirmation** decisions.

### 6) Confirmation rules for proxy-entered data
The effective-confirmation rule should differ by data type:

- **Medication / treatment-related records**
  - require **doctor confirmation**

- **Adverse event / side-effect records**
  - **general discomfort**: confirmed by the **patient**
  - **important / serious adverse events**: confirmed by the **doctor**

- **Symptom self-rating records**
  - confirmed by the **patient**, or entered directly by the patient

- **Scale / questionnaire results**
  - **patient self-rated scales**: confirmed by the **patient**
  - **researcher-rated scales**: assessed by the **research assistant**

- **Basic demographic / baseline information entered by research staff**
  - may take effect **directly**

- **Intervention execution records**
  - confirmed by the **patient**

### 7) Cross-project participation visibility
If a patient belongs to multiple projects, visibility of that fact should be role-based:

- **Platform administrators**
  - can see the **specific cross-project participation details**, including which projects the patient is involved in

- **Project principal investigators / project owners**
  - can know that the patient **also participates in other project(s)**
  - but **cannot see which specific other projects**

- Other roles should **not** automatically see cross-project participation information.

### 8) Cross-project coordination requests
When a project principal investigator becomes aware that a patient also participates in other projects:
- they should **not** automatically gain access to those other projects
- they **may submit a coordination / access request**
- the request should be routed through the **platform administrator**, not direct project-to-project exposure

### 9) Approval model for cross-project access
Approval should depend on the request type:

- for requests involving only **project-existence / basic coordination information**:
  - approval by the **platform administrator** is sufficient

- for requests involving access to **specific data from another project**:
  - approval should require **both**:
    - the **platform administrator**
    - the **principal investigator / owner of the other involved project**

### 10) Authorization modes after approval
Approved cross-project access should support multiple authorization modes, selected at approval time:
- **one-time authorization**
- **time-limited authorization**
- **task-bound authorization**

### 11) Audit trail for cross-project access
All cross-project request / approval / authorization / viewing actions should be fully audited.
The audit log should include at least:
- applicant identity
- approver identity
- request time
- approval time
- authorization mode
- validity period
- approved viewing scope
- the **actual data modules / fields viewed**

## Features intentionally postponed for now
These ideas are recognized but not part of the current first-priority scope:
- Doctor-patient interaction/messaging
- Personalized recommendations
- Professional journal paper / psychoeducation homepage
- Full platform-management admin panel in the earliest phase

## Working summary of v1 scope so far
V1 is shaping up as a:
- **research-first**
- **patient self-monitoring**
- **doctor-managed**
- **audit-trail-preserving**
DPDR platform.

The current planning emphasis is not general psychoeducation, but rather structured longitudinal data collection around:
- baseline DPDR severity
- repeated DPDR state changes
- emotional state modules
- formal treatment records, especially medication
- doctor confirmation and research-project assignment

## Status
Planning is in progress. Requirements are being elicited step by step through structured questioning before full product design.
