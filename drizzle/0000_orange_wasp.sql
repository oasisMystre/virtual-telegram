CREATE TABLE IF NOT EXISTS "support_ticker" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"user_id" text NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"last_name" text,
	"first_name" text NOT NULL,
	"username" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "virtual_numbers" (
	"id" text PRIMARY KEY NOT NULL,
	"price" integer NOT NULL,
	"json_data" json NOT NULL,
	"is_charged" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"chain" text NOT NULL,
	"private_key" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "wallets_private_key_unique" UNIQUE("private_key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_ticker" ADD CONSTRAINT "support_ticker_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "virtual_numbers" ADD CONSTRAINT "virtual_numbers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
