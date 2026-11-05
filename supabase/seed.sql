-- TaskGo seed data. Run this once, after schema.sql.

-- ============ BADGES ============
insert into public.badges
  (code, name, description, icon, requirement_type, requirement_value, sort_order)
values
  ('first_session', 'First Step',     'Finish your first study session',          'footsteps',        'sessions_count', 1,  1),
  ('streak_3',      '3-Day Streak',   'Study 3 days in a row',                    'flame',            'streak',         3,  2),
  ('streak_7',      'Week Warrior',   'Study 7 days in a row',                    'flame',            'streak',         7,  3),
  ('streak_14',     'Fortnight Focus','Study 14 days in a row',                   'bonfire',          'streak',         14, 4),
  ('streak_30',     'Monthly Master', 'Study 30 days in a row',                   'trophy',           'streak',         30, 5),
  ('total_10h',     '10 Hours',       'Study 10 hours in total',                  'time',             'total_hours',    10, 6),
  ('total_50h',     '50 Hours',       'Study 50 hours in total',                  'hourglass',        'total_hours',    50, 7),
  ('goal_days_5',   'Goal Getter',    'Reach your daily goal on 5 different days','checkmark-circle', 'goal_days',      5,  8),
  ('tasks_5',       'Task Starter',   'Complete 5 tasks',                         'checkbox',         'tasks_done',     5,  9),
  ('tasks_25',      'Task Champion',  'Complete 25 tasks',                        'ribbon',           'tasks_done',     25, 10)
on conflict (code) do nothing;

-- ============ QUOTES ============
insert into public.quotes (text, author) values
  ('Small steps every day beat big plans someday.', null),
  ('Start where you are. Use what you have. Do what you can.', null),
  ('Consistency turns ordinary days into extraordinary results.', null),
  ('Your future self is watching. Make them proud.', null),
  ('Do not break the chain. One session today keeps the streak alive.', null),
  ('Focus for 25 minutes. Then rest. Then repeat.', null),
  ('Progress, not perfection.', null),
  ('A little studying every day is better than a lot once a week.', null),
  ('You do not have to be great to start, but you have to start to be great.', null),
  ('The best time to study was yesterday. The next best time is now.', null),
  ('Discipline is choosing what you want most over what you want now.', null),
  ('Every expert was once a beginner who kept going.', null),
  ('Tired? Rest, do not quit.', null),
  ('One more page. One more problem. One more minute.', null),
  ('Your goals do not care about your mood. Show up anyway.', null),
  ('Hard work stays quiet until results make the noise.', null),
  ('Make your streak so long that skipping a day feels strange.', null),
  ('Deep focus is a superpower. Practice it daily.', null),
  ('Mistakes mean you are learning. Keep going.', null),
  ('Study now so exam day feels like revision, not panic.', null),
  ('Done is better than perfect. Open the book.', null),
  ('Today is a good day to add one more day to your streak.', null),
  ('Your brain grows when you challenge it.', null),
  ('Do not wait for motivation. Build the habit.', null),
  ('Ten focused minutes beat an hour of distraction.', null),
  ('Believe you can learn it, then prove it.', null),
  ('Success is the sum of small efforts repeated daily.', null),
  ('Put your phone away. Future you says thanks.', null),
  ('Slow progress is still progress.', null),
  ('Every session counts, even the short ones.', null),
  ('Learning is a marathon with daily steps.', null),
  ('Be the student who shows up on the hard days too.', null),
  ('Plan the day, protect your focus time, finish what you start.', null),
  ('You are one study session away from a better day.', null);