CREATE TABLE "cycle_devices" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"default_duration" integer,
	"delay_step" integer,
	"built_in" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"programs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cycle_devices_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "cycle_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"selected_device_id" text,
	"selected_program_id" text,
	"duration" integer DEFAULT 150 NOT NULL,
	"finish_mode" text DEFAULT 'soon' NOT NULL,
	"finish_mode_configured" boolean DEFAULT false NOT NULL,
	"calculation_mode" text DEFAULT 'soon' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "off_peak_slots" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "off_peak_slots_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "cycle_devices" ADD CONSTRAINT "cycle_devices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cycle_preferences" ADD CONSTRAINT "cycle_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "off_peak_slots" ADD CONSTRAINT "off_peak_slots_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;