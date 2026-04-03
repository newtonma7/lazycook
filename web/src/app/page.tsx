import { createClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { addConsumer, deleteConsumer, updateConsumer } from "./actions";

type ConsumerRow = {
  consumer_id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  status: string;
};

/** Always read fresh data from Supabase; avoid cached RSC payload after mutations. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^"|"$/g, "");
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/^"|"$/g, "");

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
        <h1 className="mb-4 text-2xl font-semibold">Supabase Consumer Data</h1>
        <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          Missing Supabase environment variables.
        </p>
      </main>
    );
  }

  noStore();

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("consumer")
    .select("consumer_id, username, email, password_hash, created_at, status")
    .order("consumer_id", { ascending: true });

  const rows = (data ?? []) as ConsumerRow[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
      <h1 className="text-3xl text-green-500">Connected</h1>
      <h1 className="mb-6 text-2xl font-semibold">Supabase Consumer Data</h1>

      {/* --- INSERT --- */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="mb-4 text-lg font-medium">Add New Consumer</h2>
        <form action={addConsumer} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm text-zinc-600">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-zinc-600">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-zinc-600">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Insert Record
          </button>
        </form>
      </div>

      {/* --- TABLE --- */}
      {error ? (
        <p className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
          Failed to load data: {error.message}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <th className="px-4 py-3 font-medium">consumer_id</th>
                <th className="px-4 py-3 font-medium">username</th>
                <th className="px-4 py-3 font-medium">email</th>
                <th className="px-4 py-3 font-medium">password_hash</th>
                <th className="px-4 py-3 font-medium">created_at</th>
                <th className="px-4 py-3 font-medium">status</th>
                <th className="px-4 py-3 font-medium">Update</th>
                <th className="px-4 py-3 font-medium">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.consumer_id} className="border-t border-zinc-200 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{row.consumer_id}</td>
                  <td className="px-4 py-3">{row.username}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.password_hash}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700">
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">
                    <form action={updateConsumer} className="flex min-w-[220px] flex-col gap-2">
                      <input type="hidden" name="consumer_id" value={row.consumer_id} />
                      <input
                        name="username"
                        type="text"
                        required
                        defaultValue={row.username}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Username for consumer ${row.consumer_id}`}
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        defaultValue={row.email}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Email for consumer ${row.consumer_id}`}
                      />
                      <input
                        name="password"
                        type="text"
                        autoComplete="off"
                        defaultValue={row.password_hash}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Password hash for consumer ${row.consumer_id}`}
                      />
                      <select
                        name="status"
                        defaultValue={row.status}
                        className="w-full rounded border border-zinc-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                        aria-label={`Status for consumer ${row.consumer_id}`}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        Save changes
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteConsumer}>
                      <input type="hidden" name="consumer_id" value={row.consumer_id} />
                      <button
                        type="submit"
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="border-t border-zinc-200">
                  <td className="px-4 py-3 text-zinc-500" colSpan={8}>
                    No consumer rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
