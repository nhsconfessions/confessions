# NHSC Confessions

An anonymous confession platform for students to share their thoughts, memories, stories, and experiences.

## Why?

This website was inspired by my high school days, when students had a strong desire to share their thoughts freely. What they needed was absolute anonymity and a fast, convenient way to submit posts.

So, instead of forcing students to submit content through restrictive forms with limited interaction, I built this custom web interface to provide a more modern, intuitive, and seamless submission experience.

## Requirements

Before running the project, make sure you have:

* **Node.js**
* **npm**
* **A Supabase project**

## Getting the Source Code

Clone the repository:

```bash
git clone https://github.com/nhsconfessions/confessions.git
cd confessions
```

Install the dependencies:

```bash
npm install
```

## Supabase Setup

The application uses Supabase as its backend.

### Environment Variables

The frontend requires these two environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 1. Create a Supabase Project

Create a project at [Supabase](https://supabase.com/).

After creating the project, open:

**Project Settings → API**

Copy the following values:

* **Project URL**
* **Publishable / anonymous client key** appropriate for your project

> **Important:** Never put a Supabase **service-role key** or other secret key in the frontend.
>
> This application is designed to use a public client key together with PostgreSQL permissions, Row Level Security (RLS), and database functions.

### 2. Create the Database

The application expects these main tables:

```text
confessions
comments
feedback
```

The `confessions` table contains these fields:

```text
uuid
created_at
content
status
likes
comment_count
last_updated
```

The `comments` table contains:

```text
id
uuid
created_at
content
```

The `feedback` table contains:

```text
created_at
content
```

### 3. Create the Database Functions

The frontend uses two PostgreSQL functions through Supabase RPC:

```text
like_confession
add_comment
```

Run the following SQL in:

**Supabase Dashboard → SQL Editor → New Query**

#### `like_confession`

```sql
CREATE OR REPLACE FUNCTION public.like_confession(p_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
    new_likes integer;
begin

    update public.confessions
    set likes = likes + 1
    where uuid = p_uuid
    returning likes into new_likes;

    if not found then
        return json_build_object(
            'status', 'error',
            'message', 'Confession not found'
        );
    end if;

    return json_build_object(
        'status', 'success',
        'likes', new_likes
    );

end;
$function$;
```

#### `add_comment`

```sql
CREATE OR REPLACE FUNCTION public.add_comment(
    p_uuid uuid,
    p_content text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
    new_comment public.comments;
begin

    if p_uuid is null then
        return json_build_object(
            'status', 'error',
            'message', 'UUID is required'
        );
    end if;

    if p_content is null
       or length(trim(p_content)) = 0 then
        return json_build_object(
            'status', 'error',
            'message', 'Content is required'
        );
    end if;

    if not exists (
        select 1
        from public.confessions
        where uuid = p_uuid
    ) then
        return json_build_object(
            'status', 'error',
            'message', 'Confession not found'
        );
    end if;

    insert into public.comments (
        uuid,
        content
    )
    values (
        p_uuid,
        p_content
    )
    returning * into new_comment;

    return json_build_object(
        'status', 'success',
        'comment', json_build_object(
            'id', new_comment.id,
            'uuid', new_comment.uuid,
            'content', new_comment.content,
            'time', new_comment.created_at
        )
    );

end;
$function$;
```

These functions are used by the frontend as:

```javascript
supabase.rpc("like_confession", {
    p_uuid: confessionUuid
});
```

and:

```javascript
supabase.rpc("add_comment", {
    p_uuid: confessionUuid,
    p_content: commentContent
});
```

> **Security note:** Both functions use `SECURITY DEFINER`, so review their permissions carefully before deploying a public instance. Do not expose the Supabase service-role key to the browser.

### 4. Enable Realtime

The frontend uses **Supabase Realtime** to receive database changes.

Enable Realtime for the tables that need to be monitored, especially:

```text
confessions
comments
```

This allows updates to appear without requiring a full page refresh.

### 5. Configure Row Level Security

When Row Level Security is enabled, create policies that allow only the required operations.

A typical public deployment needs to handle:

* Reading approved and important confessions
* Submitting pending confessions
* Adding comments
* Submitting feedback
* Increasing confession likes through the database function

> **Do not** fix permission errors by putting the Supabase service-role key in the frontend.
>
> The service-role key is a **server-side secret** and must never be exposed in a Vite client application.

Before deploying publicly, review your:

* Tables
* RLS policies
* Database functions
* Grants and permissions

## Environment File

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-client-key
```

Replace the example values with those from your Supabase project.

Do **not** put secret keys in these variables when they will be exposed to the Vite frontend.

## Development

Start the Vite development server:

```bash
npm run dev
```

Vite will start a local development server.

## Production Build

Create a production build with:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

The contents of `dist/` can then be deployed to a static hosting service such as GitHub Pages.

## Disclaimer

This project is provided as open-source software.

Anyone deploying their own instance is responsible for:

* Supabase configuration
* Database security
* Row Level Security policies
* Content moderation
* Privacy practices
* Abuse prevention
* Deployment configuration
* Compliance with applicable laws and regulations

The maintainers of this repository are **not responsible** for independently deployed instances or the data handled by them.

## License

See the repository's license file for the applicable license and usage terms.
