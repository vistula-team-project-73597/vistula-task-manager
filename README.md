# Task Manager

Task Manager is a web application for creating, viewing, editing and deleting tasks. Each task has a title, an optional description and a completion status. Tasks can be marked as completed or incomplete, and changes remain saved after refreshing the page. No installation or login is required.

Student ID: **73597**

## Links

- [Task Manager](https://vistula-team-project-73597.github.io/vistula-task-manager/)
- [GitHub repository](https://github.com/vistula-team-project-73597/vistula-task-manager)

The frontend uses HTML, CSS and JavaScript. Data is stored in a Supabase PostgreSQL database and accessed through the Supabase REST API using GET, POST, PATCH and DELETE requests.

`config.json` contains the Supabase project URL, public publishable API key and table name `tasks`. The separate demonstration database contains test data only. Row Level Security is enabled with public policies for selecting, inserting, updating and deleting demonstration tasks. All visitors share the same tasks.

The `tasks` table has an automatically generated BIGINT primary key `id`, required TEXT `title`, optional TEXT `description`, and BOOLEAN `completed` with a default of `false`.

GitHub Pages hosts the application from the root directory of the `main` branch.
