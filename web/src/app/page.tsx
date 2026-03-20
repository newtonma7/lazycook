import { createClient } from "@supabase/supabase-js";

type ConsumerRow = {
  consumer_id: number;
  username: string;
  email: string;
};

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

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("consumer")
    .select("consumer_id, username, email")
    .order("consumer_id", { ascending: true });

  const rows = (data ?? []) as ConsumerRow[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-16">
      <h1 className="text-3xl text-green-500">Connected</h1>
      <h1 className="mb-6 text-2xl font-semibold">Supabase Consumer Data</h1>

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
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.consumer_id} className="border-t border-zinc-200">
                  <td className="px-4 py-3">{row.consumer_id}</td>
                  <td className="px-4 py-3">{row.username}</td>
                  <td className="px-4 py-3">{row.email}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="border-t border-zinc-200">
                  <td className="px-4 py-3 text-zinc-500" colSpan={3}>
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
