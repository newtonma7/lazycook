import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

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

  // --- 1. SERVER ACTION FOR INSERTING DATA ---
  async function addConsumer(formData: FormData) {
    "use server"; // This tells Next.js to run this function securely on the server

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username || !email || !password) return;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from("consumer")
      .insert([
        {
          username: username,
          email: email,
          // Note: In a real production app, NEVER store plain text passwords. 
          // You would hash this using a library like bcrypt before inserting.
          password_hash: password, 
          status: "active", // Providing a default status as per standard DB practices
        },
      ]);

    if (error) {
      console.error("Insertion Error:", error.message);
      // In a more advanced setup, you could return this error to the UI 
      // using the 'useFormState' hook.
    }

    // This tells Next.js to clear its cache for this page and re-fetch the data,
    // making your new row appear instantly!
    revalidatePath("/");
  }

  // --- 2. FETCH EXISTING DATA ---
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

      {/* --- 3. INSERTION FORM --- */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="mb-4 text-lg font-medium">Add New Consumer</h2>
        <form action={addConsumer} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm text-zinc-600">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-zinc-600">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-zinc-600">Password</label>
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

      {/* --- 4. DATA TABLE --- */}
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