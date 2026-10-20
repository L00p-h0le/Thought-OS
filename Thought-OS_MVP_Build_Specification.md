# Thought-OS MVP: Product and Build Specification

**Product:** Thought-OS  
**Purpose:** Help individuals capture ideas, evaluate their potential, organize execution, and measure how many ideas they successfully implement.  
**Document scope:** MVP product requirements and implementation work only. This document intentionally excludes learning plans, technology tutorials, and post-MVP features.

---

## 1. MVP Goal

Deliver a working personal idea-management application that supports this complete journey:

1. Capture an idea.
2. Record its context and category.
3. Evaluate feasibility, scalability, and monetization potential.
4. Create and manage tasks for the idea.
5. Track execution progress.
6. Mark the idea as launched when the intended outcome is complete.
7. Review accurate dashboard statistics.

The MVP should be reliable and usable before advanced automation or AI is added.

## 2. Existing First-Draft Features

Retain and refine these existing features:

- Dashboard with summary cards.
- Quick idea capture.
- New-idea form with title, description, category, and status.
- Idea detail page.
- Lifecycle statuses: Draft, Exploring, Building, Launched, Archived.
- Analysis fields: Challenges, Knowledge Gap, Feasibility, Scalability, Monetization, How to Build, and Notes.
- Task tracker with task status and priority.
- Task completion count and progress bar.
- Recent ideas list.

The visual design is not part of this specification except where usability or feedback is necessary for a feature to work correctly.

## 3. MVP Requirements

### 3.1 Idea Management

Implement:

- Create an idea with a required title.
- Add an optional description and category.
- Open an idea's detail page.
- Edit existing idea details.
- Change an idea's lifecycle status.
- Search ideas by title.
- Filter ideas by category and lifecycle status.
- Sort ideas by newest, oldest, or recently updated.
- Archive an idea without losing its history.
- Delete an idea with a confirmation step.
- Validate required fields and reasonable input lengths.
- Show clear success, error, loading, and empty states.

**Acceptance criteria**
- A valid idea can be created and appears in the dashboard and recent-ideas list.
- Invalid or blank titles are rejected with a clear message.
- Editing an idea preserves its tasks and evaluation data.
- Archived ideas are excluded from active counts but remain accessible through an archived filter.
- Deletion behavior is consistent and documented.

### 3.2 Quick Capture

Implement:

- A single-field quick-capture input on the dashboard.
- Enter and the Capture button both submit the idea.
- Quick capture creates a Draft idea using the entered text as its title.
- After successful capture, clear the input and update the dashboard without requiring a manual refresh.
- Provide a way to open the newly created idea for further details.

**Acceptance criteria**
- Empty input is rejected.
- Pressing Enter does not submit twice.
- Successful capture creates exactly one idea.
- The user receives visible confirmation or an error message.

### 3.3 Idea Lifecycle

Use these statuses:

- **Draft:** Captured, but not actively evaluated.
- **Exploring:** Being researched or evaluated.
- **Building:** Active execution is underway.
- **Launched:** The intended deliverable has been completed or released.
- **Archived:** Removed from active work without deleting its history.

Implement:

- A status control on the idea detail page.
- Validation of allowed status values.
- A clear indication of the current status.
- A launch confirmation before moving an idea to Launched.
- A way to move an archived idea back to an active status.

**Acceptance criteria**
- Status changes persist after reload.
- Unsupported status values are rejected.
- Marking all tasks Done does not automatically launch the idea.
- Launching an idea is an explicit user action.
- Archiving does not silently delete tasks or evaluations.

### 3.4 Analysis and Feasibility

Retain the current analysis fields:

- Challenges and risks.
- Knowledge gaps.
- Feasibility rating: Low, Medium, High.
- Feasibility rationale.
- Scalability rating: Low, Medium, High.
- Scalability rationale.
- Monetization toggle.
- Monetization approach, shown when monetization is enabled.
- How to Build.
- Notes and reference links.

Implement:

- Persist each field against its idea.
- Allow users to edit and save analysis independently of other idea data.
- Validate rating values against the allowed options.
- Require no rating rationale unless the product later decides it is necessary.
- Show saved values when reopening an idea.
- Show a clear indication when changes are saved or when saving fails.

**Acceptance criteria**
- Every analysis field persists after navigation or reload.
- Saving analysis does not overwrite unrelated idea fields or tasks.
- Invalid rating values are rejected.
- The monetization approach is retained when monetization is enabled.

**Out of scope:** Automatic AI analysis and automatic scoring in the MVP.

### 3.5 Task Tracker

Each task should have:

- Task title.
- Status: To Do, In Progress, Done.
- Priority: Low, Medium, High.
- Creation date.
- Optional due date.
- Completion timestamp when marked Done.

Implement:

- Add a task to an idea.
- Edit a task title.
- Change task priority.
- Change task status.
- Filter tasks by All, To Do, In Progress, and Done.
- Delete a task with confirmation.
- Display completed-task count and progress.
- Show an empty state when no tasks exist.

**Progress calculation**

`progress percentage = (number of Done tasks / number of non-cancelled tasks) * 100`

For the MVP, do not add a Cancelled task status unless cancellation is required. If no tasks exist, show “Not started” and a 0/0 count rather than dividing by zero.

**Acceptance criteria**
- Adding, editing, completing, and deleting tasks updates the tracker immediately.
- A task marked Done is reflected in the completion count.
- Reopening a Done task reduces the completion percentage.
- Filtering changes the visible list without changing task data.
- An idea with zero tasks does not display 100% progress.
- Completing all tasks does not change the idea's lifecycle status automatically.

### 3.6 Dashboard and Analytics

Implement these dashboard metrics with documented definitions:

- **Total Ideas:** Count of non-archived ideas.
- **Building:** Count of ideas whose status is Building.
- **Launched:** Count of ideas whose status is Launched.
- **Tasks Done:** Count of tasks currently in Done status across non-archived ideas.
- **Recent Ideas:** Most recently created or updated ideas, with the chosen sorting rule made consistent.
- **Implementation Rate:** Launched ideas divided by eligible non-archived ideas, multiplied by 100. Exclude Draft ideas from the denominator; include Exploring, Building, and Launched ideas.

If there are no eligible ideas, show “N/A” or 0% consistently rather than dividing by zero.

Implement:
- Correct counts after create, update, archive, launch, and delete operations.
- Links from dashboard cards to the corresponding filtered list where practical.
- Empty-state guidance when no ideas exist.

**Acceptance criteria**
- Dashboard numbers match the stored records.
- Archiving or deleting an idea updates relevant counts.
- Marking an idea Launched updates the launched count and implementation rate.
- Task metrics are not confused with idea implementation metrics.

### 3.7 Data Integrity and Ownership

The initial application is for an individual user, but data access must still be consistently designed.

Implement:
- Stable identifiers for ideas and tasks.
- Clear ownership relationships if accounts are part of the MVP.
- Validation on every create and update operation.
- Consistent deletion and archival rules.
- Safe handling of missing or invalid IDs.
- No reliance on frontend validation alone.
- If authentication is included, verify ownership for every idea, task, and analysis operation.

**Acceptance criteria**
- Missing records return a clear not-found result.
- A task cannot be modified through an idea it does not belong to.
- A user cannot access another user's private records by changing an identifier.
- Related records are not left orphaned after deletion.

### 3.8 Error Handling and User Feedback

Implement:
- Field-level validation messages where useful.
- A visible result for failed saves.
- Loading feedback for operations that take time.
- Confirmation for destructive actions.
- Safe handling of duplicate submissions.
- Predictable error responses from the application.
- No silent data loss when a save fails.

**Acceptance criteria**
- Users can distinguish a successful save from a failed save.
- A failed update does not falsely appear successful.
- Destructive actions cannot be triggered accidentally without confirmation.

## 4. Core Data Entities

Use these conceptual entities to guide the data model.

### Idea
- `id`
- `title`
- `description`
- `category`
- `status`
- `created_at`
- `updated_at`
- `archived_at` (nullable, if archival is represented with a timestamp)

### Idea Analysis
- `id`
- `idea_id`
- `challenges`
- `knowledge_gaps`
- `feasibility_rating`
- `feasibility_reason`
- `scalability_rating`
- `scalability_reason`
- `is_monetizable`
- `monetization_approach`
- `build_approach`
- `notes`
- `updated_at`

### Task
- `id`
- `idea_id`
- `title`
- `status`
- `priority`
- `due_date` (nullable)
- `created_at`
- `updated_at`
- `completed_at` (nullable)

### User (if accounts are included in the MVP)
- `id`
- `name`
- `email`
- `password_hash`
- `created_at`

These are conceptual fields, not a finalized database migration. Choose whether analysis is stored as a one-to-one record per idea or as fields on the idea before implementing persistence. If evaluation history is required later, use a separate evaluation-history entity.

## 5. Main User Flows

### Flow A: Capture an idea
1. User enters a title in Quick Capture or opens New Idea.
2. Application validates the input.
3. Application creates the idea with Draft status.
4. Dashboard and recent-ideas list update.
5. User can open the idea to add analysis and tasks.

### Flow B: Evaluate an idea
1. User opens an idea.
2. User fills in challenges and knowledge gaps.
3. User selects feasibility and scalability ratings.
4. User adds reasoning and optional monetization/build notes.
5. Application saves the analysis.
6. Saved values are visible on the next visit.

### Flow C: Track execution
1. User changes an idea to Building.
2. User creates tasks and sets priorities.
3. User moves tasks through To Do, In Progress, and Done.
4. Application calculates progress from task status.
5. Dashboard task counts update.

### Flow D: Launch an idea
1. User reviews the idea and its tasks.
2. User explicitly selects Launched.
3. Application asks for confirmation.
4. Application saves the status and launch timestamp if a timestamp field is implemented.
5. Dashboard counts update.

## 6. MVP Implementation Checklist

Use this checklist to track the build.

### Idea management
- [ ] Create idea
- [ ] View idea details
- [ ] Edit idea
- [ ] Delete idea with confirmation
- [ ] Archive and restore idea
- [ ] Search and filter ideas
- [ ] Sort ideas

### Quick capture
- [ ] Capture with Enter
- [ ] Capture with button
- [ ] Prevent empty and duplicate submission
- [ ] Update dashboard after capture

### Lifecycle
- [ ] Persist status changes
- [ ] Validate supported statuses
- [ ] Confirm launch action
- [ ] Keep archival separate from deletion

### Analysis
- [ ] Save challenges and knowledge gaps
- [ ] Save feasibility rating and rationale
- [ ] Save scalability rating and rationale
- [ ] Save monetization toggle and approach
- [ ] Save build approach and notes
- [ ] Restore saved values when reopening the idea

### Tasks
- [ ] Add task
- [ ] Edit task
- [ ] Change priority
- [ ] Change status
- [ ] Filter tasks
- [ ] Delete task with confirmation
- [ ] Calculate progress and completion count
- [ ] Handle the no-task state

### Dashboard
- [ ] Total Ideas count
- [ ] Building count
- [ ] Launched count
- [ ] Tasks Done count
- [ ] Recent Ideas list
- [ ] Implementation Rate
- [ ] Empty states and links to relevant lists

### Reliability
- [ ] Validate all inputs
- [ ] Handle missing records
- [ ] Prevent orphaned task/analysis records
- [ ] Enforce ownership if accounts are enabled
- [ ] Show save errors and success feedback
- [ ] Test critical lifecycle and progress rules
- [ ] Verify dashboard metrics against sample data

## 7. MVP Release Acceptance Checklist

The MVP is ready when all of the following are true:

- [ ] A user can capture, view, edit, archive, and delete ideas.
- [ ] Analysis fields persist independently from idea details.
- [ ] Tasks can be added, updated, filtered, and completed.
- [ ] Progress is calculated correctly, including zero-task and reopened-task cases.
- [ ] Lifecycle statuses persist and invalid values are rejected.
- [ ] Launching an idea is explicit and separate from completing tasks.
- [ ] Dashboard metrics match the agreed definitions.
- [ ] Errors are visible and do not silently discard changes.
- [ ] Related data remains consistent after archive and delete operations.
- [ ] All primary user flows have been tested end to end.

## 8. Deliberately Out of Scope for MVP

Do not include these in the first release:

- AI-generated evaluations.
- Automatic weighted idea scoring.
- Team collaboration and shared workspaces.
- Subscription tiers and payment processing.
- External integrations.
- Complex notification systems.
- Advanced configurable evaluation criteria.
- Microservices or distributed infrastructure.
- UI redesign and visual polish beyond what is needed for usability.

**MVP principle:** Make idea capture, analysis, task tracking, lifecycle changes, and dashboard metrics correct and reliable before expanding the product.
