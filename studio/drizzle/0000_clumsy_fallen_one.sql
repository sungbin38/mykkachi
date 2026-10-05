CREATE TABLE `content` (
	`id` text PRIMARY KEY NOT NULL,
	`channel` text NOT NULL,
	`locale` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`keyword` text NOT NULL,
	`slides` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`scheduled_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_content_locale_channel_slug` ON `content` (`locale`,`channel`,`slug`);--> statement-breakpoint
CREATE INDEX `idx_content_status_schedule` ON `content` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE TABLE `event_totals` (
	`day` text NOT NULL,
	`event` text NOT NULL,
	`source` text NOT NULL,
	`locale` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_event_totals_key` ON `event_totals` (`day`,`event`,`source`,`locale`);--> statement-breakpoint
CREATE TABLE `job_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`summary` text NOT NULL,
	`mode` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
