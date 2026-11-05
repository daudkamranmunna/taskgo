# TaskGo File Structure

Strict rule: do not create files outside this tree without asking and updating this file.
One responsibility per file. Reuse existing components before making new ones.

taskgo/
  README.md
  .gitignore
  docs/
    MASTER_PROMPT.md   (the master prompt)
    PROGRESS.md        (progress tracker)
    API.md
    DATABASE.md
    STRUCTURE.md
  supabase/
    schema.sql
    seed.sql
  backend/
    package.json
    .env  (not committed)
    .env.example
    src/
      index.js              (starts the server)
      app.js                (express app, cors, routes)
      config/env.js
      lib/supabase.js       (createUserClient(token), createAnonClient())
      middleware/auth.js
      middleware/errorHandler.js
      utils/response.js     (ok(res,data), fail(res,status,msg))
      utils/dates.js        (date helpers: daysBetween, addDays, etc.)
      routes/index.js, profile.routes.js, sessions.routes.js, tasks.routes.js, stats.routes.js, badges.routes.js, quotes.routes.js
      controllers/profile.controller.js, sessions.controller.js, tasks.controller.js, stats.controller.js, badges.controller.js, quotes.controller.js
      services/streak.service.js, stats.service.js, badges.service.js, xp.service.js
  mobile/
    package.json, app.json, .env (not committed), .env.example
    app/
      _layout.js            (root: AuthProvider + route guard)
      index.js              (redirects to login or tabs)
      (auth)/_layout.js, login.js, register.js
      (tabs)/_layout.js, home.js, tasks.js, timer.js, progress.js, profile.js
      task-form.js          (stack screen: add / edit a task)
      history.js            (stack screen, opened from Progress)
      badges.js             (stack screen, opened from Progress/Profile)
    src/
      lib/supabase.js, api.js
      context/AuthContext.js
      constants/theme.js, config.js
      utils/date.js, format.js, alarm.js
      components/Button.js, Input.js, Card.js, ProgressRing.js, StreakCard.js, BarChart.js, StreakCalendar.js, BadgeItem.js, BadgePopup.js, SessionItem.js, TaskItem.js, DeadlineCard.js, XPBar.js, EmptyState.js, LoadingView.js, ScreenContainer.js, CustomTimerModal.js