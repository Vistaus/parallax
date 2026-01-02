# Parallax UX Contract (Frozen v1)

## 1. UX Philosophy

Parallax is a **system clarity tool**, not a warning system.

- **Tone**: Calm, Informational, Non-judgmental, Trustworthy.
- **Design Goal**: "Composed".
- **Core Question**: "Can a non-technical user understand app trust in under 10 seconds?"

## 2. Screen Inventory (3 Screens Only)

### 🧭 Screen 1: System Trust Overview (Home)

- **Purpose**: Answer "Is my app ecosystem healthy?"
- **Content**:
  - Total Installed Apps count.
  - Count of Low, Medium, High risk apps.
  - Neutral summary line (e.g., "Most of your apps have a low trust risk.").
- **Constraints**: No charts, no percentages. Numbers only.

### 📋 Screen 2: App List

- **Purpose**: Finding apps that deserve attention.
- **Sorting**: High Risk (Top) > Medium > Low.
- **Item Content**: Icon, Name, Trust Score, Risk Badge.
- **Constraints**: No explanations on this screen.

### 📱 Screen 3: App Detail View

- **Purpose**: Explain the trust score.
- **Order**:
  1.  App Identity (Icon, Name)
  2.  Trust Score + Risk Label
  3.  Explanation List (Sentences)
  4.  Permissions Summary
  5.  Update Info
  6.  Maintainer Info
  7.  Help Text ("What does this mean?")

## 3. Navigation Model

- **Structure**: Home -> App List -> App Detail.
- **Rules**:
  - Back button always returns to previous.
  - No deep links.
  - No modal stacks.

## 4. Visual Hierarchy & Semantics

### Emphasis

1.  **Trust Score**
2.  **Risk Label**
3.  **Explanations**

### Risk Colors (Calm)

- 🟢 **Low**: Muted Green
- 🟡 **Medium**: Amber / Yellow
- 🔴 **High**: Soft Red (Never bright/alarming)
- **Forbidden**: Flashing, Skulls, Danger Symbols.

## 5. Copy Tone Guidelines

- **Allowed**: "can access", "has not been updated", "may have fewer restrictions".
- **Forbidden**: "dangerous", "unsafe", "malicious", "spy", "threat".
- **Rule**: Parallax never accuses.

## 6. Accessibility Contract

- No text smaller than system default.
- Tap targets >= 40px.
- No color-only meaning.
