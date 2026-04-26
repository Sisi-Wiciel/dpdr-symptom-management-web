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
