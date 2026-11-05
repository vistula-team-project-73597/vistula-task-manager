# Task Manager

Task Manager for Practical Assignment 1, Team Project – IT.

Student ID: **73597**  
GitHub account: **vistula-team-project-73597**

## Links

- [Task Manager](https://vistula-team-project-73597.github.io/vistula-task-manager/)
- [GitHub repository](https://github.com/vistula-team-project-73597/vistula-task-manager)
- [Contributor page](https://vistula-team-project-73597.github.io/vistula-task-manager/contribution.html) — pending the partner's Pull Request.
- [Contributor JSON](https://vistula-team-project-73597.github.io/vistula-task-manager/contribution.json) — pending the partner's Pull Request.

## Application

The application uses HTML, CSS and JavaScript with the Supabase REST API and a PostgreSQL database. It displays, creates, edits, completes, reopens and deletes tasks. Changes remain available after refreshing the page. No installation or login is required.

`config.json` contains the Supabase project URL, public publishable API key and table name `tasks`. The separate demonstration database contains test data only. Row Level Security is enabled with public policies for selecting, inserting, updating and deleting demonstration tasks. All visitors share the same tasks.

The `tasks` table has an automatically generated BIGINT primary key `id`, required TEXT `title`, optional TEXT `description`, and BOOLEAN `completed` with a default of `false`.

The frontend uses GET to retrieve all tasks and individual tasks, POST to create tasks, PATCH to update tasks, and DELETE to remove tasks. GitHub Pages publishes the repository root from the `main` branch.

## Team collaboration

Part B is pending until a partner is available. The partner must add `contribution.html` and `contribution.json` to this repository through a Pull Request. These files are not created by the repository owner.

- Outgoing merged Pull Request to the partner's repository: pending.
- Incoming merged Pull Request from the partner: pending.

Both merged Pull Request links will be added here after collaboration is completed.
